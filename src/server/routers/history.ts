import { ORPCError } from "@orpc/server";
import type { SQL } from "drizzle-orm";
import { and, asc, count, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { history, historyAuditLog, titles } from "@/db/schema";
import { filterColumns } from "@/lib/filter-columns";
import type { ExtendedColumnFilter, JoinOperator } from "@/types/data-table";

import { protectedProcedure, publicProcedure } from "../procedures";

const filterSchema = z.object({
	id: z.string(),
	value: z.union([z.string(), z.array(z.string())]),
	variant: z.enum([
		"text",
		"number",
		"range",
		"date",
		"dateRange",
		"boolean",
		"select",
		"multiSelect",
	]),
	operator: z.enum([
		"iLike",
		"notILike",
		"eq",
		"ne",
		"inArray",
		"notInArray",
		"lt",
		"lte",
		"gt",
		"gte",
		"isBetween",
		"isEmpty",
		"isNotEmpty",
	]),
});

const sortSchema = z.object({
	id: z.string(),
	desc: z.boolean(),
});

const getHistoryInputSchema = z.object({
	filters: z.array(filterSchema).default([]),
	sort: z.array(sortSchema).default([]),
	page: z.number().min(1).default(1),
	perPage: z.number().min(1).max(100).default(10),
});

const updateHistoryInputSchema = z.object({
	id: z.string(),
	status: z
		.enum([
			"FINISHED",
			"WATCHING",
			"PLANNED",
			"ON_HOLD",
			"DROPPED",
			"REWATCHING",
		])
		.optional(),
	currentEpisode: z.number().optional(),
	currentSeason: z.number().optional(),
	currentRuntime: z.number().optional(),
	isFavourite: z.boolean().optional(),
});

const mediaTypeSchema = z.enum(["MOVIE", "SERIES"]);
const historyStatusSchema = z.enum([
	"FINISHED",
	"WATCHING",
	"PLANNED",
	"ON_HOLD",
	"DROPPED",
	"REWATCHING",
]);

function normalizeFilterId(id: string): string {
	if (id === "title_media_type") return "type";
	if (id === "title_name") return "title";
	if (id === "title_genres") return "genre";
	if (id === "is_favourite") return "isFavourite";
	return id;
}

function buildTitleFilterSql(
	filter: z.infer<typeof filterSchema>,
): SQL | undefined {
	const id = normalizeFilterId(filter.id);

	switch (id) {
		case "type": {
			if (!Array.isArray(filter.value) || filter.value.length === 0)
				return undefined;
			const values = filter.value.filter(
				(v): v is z.infer<typeof mediaTypeSchema> =>
					mediaTypeSchema.safeParse(v).success,
			);
			if (values.length === 0) return undefined;
			return inArray(titles.mediaType, values);
		}
		case "title": {
			const q =
				typeof filter.value === "string"
					? filter.value.trim()
					: Array.isArray(filter.value)
						? String(filter.value[0] ?? "").trim()
						: "";
			if (!q) return undefined;
			return ilike(titles.name, `%${q}%`);
		}
		case "genre": {
			if (!Array.isArray(filter.value) || filter.value.length === 0)
				return undefined;
			const ids = filter.value
				.map((v) => Number.parseInt(String(v), 10))
				.filter((n) => Number.isFinite(n));
			if (ids.length === 0) return undefined;
			const parts = ids.map((n) => sql`${n}`);
			return sql`${titles.genres} && ARRAY[${sql.join(parts, sql`, `)}]::integer[]`;
		}
		default:
			return undefined;
	}
}

function buildHistoryListOrderBy(sort: {
	id: string;
	desc: boolean;
}): ReturnType<typeof desc> | ReturnType<typeof asc> | null {
	const col = (d: boolean, c: Parameters<typeof desc>[0]) =>
		d ? desc(c) : asc(c);

	switch (sort.id) {
		case "title":
			return col(sort.desc, titles.name);
		case "type":
			return col(sort.desc, titles.mediaType);
		case "status":
			return col(sort.desc, history.status);
		case "isFavourite":
			return col(sort.desc, history.isFavourite);
		case "genre":
			return col(sort.desc, titles.genres);
		case "Release Date":
			return col(sort.desc, titles.releaseDate);
		case "createdAt":
			return col(sort.desc, history.createdAt);
		case "updatedAt":
			return col(sort.desc, history.updatedAt);
		default:
			return null;
	}
}

const addHistoryInputSchema = z.object({
	tmdbId: z.number(),
	mediaType: z.enum(["MOVIE", "SERIES"]),
	status: z.enum([
		"FINISHED",
		"WATCHING",
		"PLANNED",
		"ON_HOLD",
		"DROPPED",
		"REWATCHING",
	]),
	name: z.string(),
	posterPath: z.string().nullish(),
	backdropPath: z.string().nullish(),
	overview: z.string().nullish(),
	releaseDate: z.string().nullish(),
	genres: z.array(z.number()).optional(),
	imdbId: z.string().nullish(),
	directors: z.array(z.string()).optional(),
	currentEpisode: z.number().optional(),
	currentSeason: z.number().optional(),
	currentRuntime: z.number().optional(),
	isFavourite: z.boolean().optional(),
});

export const historyRouter = {
	getAll: publicProcedure
		.input(getHistoryInputSchema)
		.handler(async ({ input, context }) => {
			const userId = context.session?.userId;
			if (!userId) {
				return { data: [], total: 0, pageCount: 0 };
			}

			const offset = (input.page - 1) * input.perPage;
			const whereConditions: SQL[] = [eq(history.userId, userId)];

			const historyOnlyFilters: ExtendedColumnFilter<typeof history>[] = [];

			for (const f of input.filters) {
				const id = normalizeFilterId(f.id);

				if (id === "type" || id === "title" || id === "genre") {
					const titleSql = buildTitleFilterSql(f);
					if (titleSql) {
						whereConditions.push(titleSql);
					}
					continue;
				}

				if (id === "isFavourite" || id === "is_favourite") {
					const raw = f.value;
					const arr = Array.isArray(raw) ? raw : [String(raw)];
					const bools = arr.map((v) => v === "true");
					const uniq = [...new Set(bools)];
					if (uniq.length === 1) {
						whereConditions.push(eq(history.isFavourite, uniq[0]!));
					} else if (uniq.length === 2) {
						// both true and false selected → no restriction
					}
					continue;
				}

				if (id === "status") {
					if (Array.isArray(f.value) && f.value.length > 0) {
						const values = f.value.filter(
							(v): v is z.infer<typeof historyStatusSchema> =>
								historyStatusSchema.safeParse(v).success,
						);
						if (values.length > 0) {
							whereConditions.push(inArray(history.status, values));
						}
					}
					continue;
				}

				historyOnlyFilters.push({ ...f, id } as ExtendedColumnFilter<
					typeof history
				>);
			}

			if (historyOnlyFilters.length > 0) {
				const filterCondition = filterColumns({
					table: history,
					filters: historyOnlyFilters,
					joinOperator: "and" as JoinOperator,
				});
				if (filterCondition) {
					whereConditions.push(filterCondition);
				}
			}

			const where = and(...whereConditions);

			let orderByClause: (ReturnType<typeof desc> | ReturnType<typeof asc>)[] =
				[desc(history.createdAt)];
			if (input.sort.length > 0) {
				const mapped = input.sort
					.map((s) => buildHistoryListOrderBy(s))
					.filter((x): x is NonNullable<typeof x> => x != null);
				if (mapped.length > 0) {
					orderByClause = mapped;
				}
			}

			const listQuery = db
				.select({ history, title: titles })
				.from(history)
				.leftJoin(titles, eq(history.titleId, titles.id))
				.where(where)
				.orderBy(...orderByClause)
				.limit(input.perPage)
				.offset(offset);

			const countQuery = db
				.select({ count: count() })
				.from(history)
				.leftJoin(titles, eq(history.titleId, titles.id))
				.where(where);

			const [data, totalResult] = await Promise.all([listQuery, countQuery]);

			const total = Number(totalResult[0]?.count ?? 0);
			const pageCount = Math.ceil(total / input.perPage);

			return {
				data: data.map((row) => ({ ...row.history, title: row.title })),
				total,
				pageCount,
			};
		}),

	getDashboardData: publicProcedure.handler(async ({ context }) => {
		const userId = context.session?.userId;
		if (!userId) {
			return {
				stats: {
					total: 0,
					watching: 0,
					finished: 0,
					planned: 0,
					onHold: 0,
					dropped: 0,
					rewatching: 0,
					favourites: 0,
					progressValue: 0,
				},
				watchingItems: [],
			};
		}

		const statusCounts = await db
			.select({ status: history.status, count: count() })
			.from(history)
			.where(eq(history.userId, userId))
			.groupBy(history.status);

		const countMap = statusCounts.reduce(
			(acc: Record<string, number>, { status, count }) => {
				acc[status] = Number(count);
				return acc;
			},
			{},
		);

		const watching = countMap["WATCHING"] ?? 0;
		const finished = countMap["FINISHED"] ?? 0;
		const planned = countMap["PLANNED"] ?? 0;
		const onHold = countMap["ON_HOLD"] ?? 0;
		const dropped = countMap["DROPPED"] ?? 0;
		const rewatching = countMap["REWATCHING"] ?? 0;
		const total = watching + finished + planned + onHold + dropped + rewatching;

		const [favouritesResult, watchingItems] = await Promise.all([
			db
				.select({ count: count() })
				.from(history)
				.where(and(eq(history.userId, userId), eq(history.isFavourite, true))),
			db
				.select({ history, title: titles })
				.from(history)
				.leftJoin(titles, eq(history.titleId, titles.id))
				.where(and(eq(history.userId, userId), eq(history.status, "WATCHING")))
				.orderBy(desc(history.updatedAt))
				.limit(10),
		]);

		return {
			stats: {
				total,
				watching,
				finished,
				planned,
				onHold,
				dropped,
				rewatching,
				favourites: Number(favouritesResult[0]?.count ?? 0),
				progressValue: total > 0 ? Math.round((finished / total) * 100) : 0,
			},
			watchingItems: watchingItems.map((row) => ({
				...row.history,
				title: row.title,
			})),
		};
	}),

	add: protectedProcedure
		.input(addHistoryInputSchema)
		.handler(async ({ input, context }) => {
			const userId = context.session!.userId;

			// Convert TMDB paths to full URLs
			const posterUrl = input.posterPath;
			const backdropUrl = input.backdropPath;

			// Upsert title - check if title exists by tmdbId + mediaType
			const [existingTitle] = await db
				.select()
				.from(titles)
				.where(
					and(
						eq(titles.tmdbId, input.tmdbId),
						eq(titles.mediaType, input.mediaType),
					),
				)
				.limit(1);

			let titleId: string;

			if (existingTitle) {
				// Update existing title with latest info
				const [updatedTitle] = await db
					.update(titles)
					.set({
						name: input.name,
						posterUrl: posterUrl ?? existingTitle.posterUrl,
						backdropUrl: backdropUrl ?? existingTitle.backdropUrl,
						description: input.overview ?? existingTitle.description,
						releaseDate: input.releaseDate ?? existingTitle.releaseDate,
						genres: input.genres ?? existingTitle.genres,
						imdbId: input.imdbId ?? existingTitle.imdbId,
						directors: input.directors ?? existingTitle.directors,
						updatedAt: new Date(),
					})
					.where(eq(titles.id, existingTitle.id))
					.returning();
				titleId = updatedTitle.id;
			} else {
				// Create new title
				const [newTitle] = await db
					.insert(titles)
					.values({
						tmdbId: input.tmdbId,
						mediaType: input.mediaType,
						name: input.name,
						posterUrl,
						backdropUrl,
						description: input.overview,
						releaseDate: input.releaseDate,
						genres: input.genres,
						imdbId: input.imdbId ?? "",
						directors: input.directors,
					})
					.returning();
				titleId = newTitle.id;
			}

			// Check if user already has this title in history
			const [existingHistory] = await db
				.select()
				.from(history)
				.where(and(eq(history.userId, userId), eq(history.titleId, titleId)))
				.limit(1);

			let historyId: string;
			let isUpdate = false;

			if (existingHistory) {
				// Update existing history with new details
				const [updatedHistory] = await db
					.update(history)
					.set({
						status: input.status,
						currentEpisode: input.currentEpisode,
						currentSeason: input.currentSeason,
						currentRuntime: input.currentRuntime,
						isFavourite: input.isFavourite ?? existingHistory.isFavourite,
						updatedAt: new Date(),
					})
					.where(eq(history.id, existingHistory.id))
					.returning();
				historyId = updatedHistory.id;
				isUpdate = true;
			} else {
				// Create history record
				const [newHistory] = await db
					.insert(history)
					.values({
						userId,
						titleId,
						status: input.status,
						currentEpisode: input.currentEpisode,
						currentSeason: input.currentSeason,
						currentRuntime: input.currentRuntime,
						isFavourite: input.isFavourite ?? false,
					})
					.returning();
				historyId = newHistory.id;
			}

			// Log initial field values to audit log
			const auditFields = [
				{ field: "status", value: input.status },
				{
					field: "current_episode",
					value:
						input.currentEpisode != null ? String(input.currentEpisode) : null,
				},
				{
					field: "current_season",
					value:
						input.currentSeason != null ? String(input.currentSeason) : null,
				},
				{
					field: "current_runtime",
					value:
						input.currentRuntime != null ? String(input.currentRuntime) : null,
				},
				{
					field: "is_favourite",
					value: String(input.isFavourite ?? false),
				},
			];

			await db.insert(historyAuditLog).values(
				auditFields
					.filter((f) => f.value !== null)
					.map((f) => ({
						userId,
						historyId,
						titleId,
						changedField: f.field,
						oldValue: null,
						newValue: f.value!,
					})),
			);

			// Return with joined title
			const result = await db
				.select({ history, title: titles })
				.from(history)
				.leftJoin(titles, eq(history.titleId, titles.id))
				.where(eq(history.id, historyId))
				.limit(1);

			return { ...result[0].history, title: result[0].title, isUpdate };
		}),

	update: protectedProcedure
		.input(updateHistoryInputSchema)
		.handler(async ({ input, context }) => {
			const userId = context.session!.userId;

			const existing = await db
				.select()
				.from(history)
				.where(and(eq(history.id, input.id), eq(history.userId, userId)))
				.limit(1);

			if (!existing.length) {
				throw new ORPCError("NOT_FOUND", { message: "History item not found" });
			}

			const updates: Record<string, unknown> = { updatedAt: new Date() };
			if (input.status !== undefined) updates.status = input.status;
			if (input.currentEpisode !== undefined)
				updates.currentEpisode = input.currentEpisode;
			if (input.currentSeason !== undefined)
				updates.currentSeason = input.currentSeason;
			if (input.currentRuntime !== undefined)
				updates.currentRuntime = input.currentRuntime;
			if (input.isFavourite !== undefined)
				updates.isFavourite = input.isFavourite;

			const [updated] = await db
				.update(history)
				.set(updates)
				.where(eq(history.id, input.id))
				.returning();

			const prev = existing[0];

			const auditEntries: {
				userId: string;
				historyId: string;
				titleId: string;
				changedField: string;
				oldValue: string | null;
				newValue: string;
			}[] = [];

			const trackField = (field: string, oldVal: unknown, newVal: unknown) => {
				if (newVal === undefined || newVal === null) return;
				const oldStr =
					oldVal !== null && oldVal !== undefined ? String(oldVal) : null;
				const newStr = String(newVal);
				if (oldStr !== newStr) {
					auditEntries.push({
						userId,
						historyId: input.id,
						titleId: prev.titleId,
						changedField: field,
						oldValue: oldStr,
						newValue: newStr,
					});
				}
			};

			trackField("status", prev.status, input.status);
			trackField("current_episode", prev.currentEpisode, input.currentEpisode);
			trackField("current_season", prev.currentSeason, input.currentSeason);
			trackField("current_runtime", prev.currentRuntime, input.currentRuntime);
			trackField("is_favourite", prev.isFavourite, input.isFavourite);

			if (auditEntries.length > 0) {
				await db.insert(historyAuditLog).values(auditEntries);
			}

			const result = await db
				.select({ history, title: titles })
				.from(history)
				.leftJoin(titles, eq(history.titleId, titles.id))
				.where(eq(history.id, updated.id))
				.limit(1);

			return { ...result[0].history, title: result[0].title };
		}),

	remove: protectedProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input, context }) => {
			const userId = context.session!.userId;

			const existing = await db
				.select()
				.from(history)
				.where(and(eq(history.id, input.id), eq(history.userId, userId)))
				.limit(1);

			if (!existing.length) {
				throw new ORPCError("NOT_FOUND", { message: "History item not found" });
			}

			await db.delete(history).where(eq(history.id, input.id));
			return { success: true };
		}),
};
