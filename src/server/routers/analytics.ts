import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { history, historyAuditLog, titles } from "@/db/schema";

import { protectedProcedure } from "../procedures";

const dateRangeInput = z.object({
	startDate: z.string(),
	endDate: z.string(),
});

const activityDate = sql`COALESCE(${history.updatedAt}, ${history.createdAt})`;

export const analyticsRouter = {
	getOverview: protectedProcedure
		.input(dateRangeInput)
		.handler(async ({ input, context }) => {
			const userId = context.session!.userId;
			const start = input.startDate;
			const end = input.endDate;

			const where = and(
				eq(history.userId, userId),
				gte(sql`${activityDate}::date`, sql`${start}::date`),
				lte(sql`${activityDate}::date`, sql`${end}::date`),
			);

			const statusCounts = await db
				.select({ status: history.status, count: count() })
				.from(history)
				.where(where)
				.groupBy(history.status);

			const countMap = statusCounts.reduce(
				(acc: Record<string, number>, { status, count: c }) => {
					acc[status] = Number(c);
					return acc;
				},
				{},
			);

			const total =
				(countMap["FINISHED"] ?? 0) +
				(countMap["WATCHING"] ?? 0) +
				(countMap["PLANNED"] ?? 0) +
				(countMap["ON_HOLD"] ?? 0) +
				(countMap["DROPPED"] ?? 0) +
				(countMap["REWATCHING"] ?? 0);

			const [favouritesResult, episodesResult, minutesResult, typeResult] =
				await Promise.all([
					db
						.select({ count: count() })
						.from(history)
						.where(and(where, eq(history.isFavourite, true))),
					db
						.select({
							total:
								sql<number>`COALESCE(SUM(${history.currentEpisode}), 0)`.mapWith(
									Number,
								),
						})
						.from(history)
						.where(where),
					db
						.select({
							total:
								sql<number>`COALESCE(SUM(${history.currentRuntime}), 0)`.mapWith(
									Number,
								),
						})
						.from(history)
						.where(where),
					db
						.select({
							type: titles.mediaType,
							count: count(),
						})
						.from(history)
						.innerJoin(titles, eq(history.titleId, titles.id))
						.where(where)
						.groupBy(titles.mediaType),
				]);

			const typeMap: Record<string, number> = {};
			for (const row of typeResult) {
				typeMap[row.type] = Number(row.count);
			}

			return {
				total,
				watching: countMap["WATCHING"] ?? 0,
				finished: countMap["FINISHED"] ?? 0,
				planned: countMap["PLANNED"] ?? 0,
				onHold: countMap["ON_HOLD"] ?? 0,
				dropped: countMap["DROPPED"] ?? 0,
				rewatching: countMap["REWATCHING"] ?? 0,
				favourites: Number(favouritesResult[0]?.count ?? 0),
				totalEpisodes: episodesResult[0]?.total ?? 0,
				totalMinutes: minutesResult[0]?.total ?? 0,
				movies: typeMap["MOVIE"] ?? 0,
				series: typeMap["SERIES"] ?? 0,
			};
		}),

	getActivityTimeline: protectedProcedure
		.input(dateRangeInput)
		.handler(async ({ input, context }) => {
			const userId = context.session!.userId;
			const start = input.startDate;
			const end = input.endDate;

			const rows = await db
				.select({
					date: sql<string>`DATE(${history.createdAt})`.mapWith(String),
					count: count(),
				})
				.from(history)
				.where(
					and(
						eq(history.userId, userId),
						gte(sql`${activityDate}::date`, sql`${start}::date`),
						lte(sql`${activityDate}::date`, sql`${end}::date`),
					),
				)
				.groupBy(sql`DATE(${history.createdAt})`)
				.orderBy(sql`DATE(${history.createdAt})`);

			return rows.map((r) => ({
				date: r.date,
				count: Number(r.count),
			}));
		}),

	getStatusDistribution: protectedProcedure
		.input(dateRangeInput)
		.handler(async ({ input, context }) => {
			const userId = context.session!.userId;
			const start = input.startDate;
			const end = input.endDate;

			const rows = await db
				.select({ status: history.status, count: count() })
				.from(history)
				.where(
					and(
						eq(history.userId, userId),
						gte(sql`${activityDate}::date`, sql`${start}::date`),
						lte(sql`${activityDate}::date`, sql`${end}::date`),
					),
				)
				.groupBy(history.status);

			return rows.map((r) => ({
				status: r.status,
				count: Number(r.count),
			}));
		}),

	getContentBreakdown: protectedProcedure
		.input(dateRangeInput)
		.handler(async ({ input, context }) => {
			const userId = context.session!.userId;
			const start = input.startDate;
			const end = input.endDate;

			const where = and(
				eq(history.userId, userId),
				gte(sql`${activityDate}::date`, sql`${start}::date`),
				lte(sql`${activityDate}::date`, sql`${end}::date`),
			);

			const [typeBreakdown, genreRows] = await Promise.all([
				db
					.select({ type: titles.mediaType, count: count() })
					.from(history)
					.innerJoin(titles, eq(history.titleId, titles.id))
					.where(where)
					.groupBy(titles.mediaType),
				db
					.select({ genres: titles.genres })
					.from(history)
					.innerJoin(titles, eq(history.titleId, titles.id))
					.where(where),
			]);

			const genreCount: Record<number, number> = {};
			for (const row of genreRows) {
				if (row.genres) {
					for (const genreId of row.genres) {
						genreCount[genreId] = (genreCount[genreId] ?? 0) + 1;
					}
				}
			}

			const topGenres = Object.entries(genreCount)
				.sort(([, a], [, b]) => b - a)
				.slice(0, 5)
				.map(([id, c]) => ({ genreId: Number(id), count: c }));

			return {
				types: typeBreakdown.map((r) => ({
					type: r.type,
					count: Number(r.count),
				})),
				topGenres,
			};
		}),

	getProgressTimeline: protectedProcedure
		.input(dateRangeInput)
		.handler(async ({ input, context }) => {
			const userId = context.session!.userId;
			const start = input.startDate;
			const end = input.endDate;

			const episodeRows = await db
				.select({
					date: sql<string>`DATE(${historyAuditLog.createdAt})`.mapWith(String),
					total:
						sql<number>`SUM(CAST(${historyAuditLog.newValue} AS integer) - COALESCE(CAST(${historyAuditLog.oldValue} AS integer), 0))`.mapWith(
							Number,
						),
				})
				.from(historyAuditLog)
				.where(
					and(
						eq(historyAuditLog.userId, userId),
						eq(historyAuditLog.changedField, "current_episode"),
						gte(sql`${historyAuditLog.createdAt}::date`, sql`${start}::date`),
						lte(sql`${historyAuditLog.createdAt}::date`, sql`${end}::date`),
					),
				)
				.groupBy(sql`DATE(${historyAuditLog.createdAt})`)
				.orderBy(sql`DATE(${historyAuditLog.createdAt})`);

			const minuteRows = await db
				.select({
					date: sql<string>`DATE(${historyAuditLog.createdAt})`.mapWith(String),
					total:
						sql<number>`SUM(CAST(${historyAuditLog.newValue} AS integer) - COALESCE(CAST(${historyAuditLog.oldValue} AS integer), 0))`.mapWith(
							Number,
						),
				})
				.from(historyAuditLog)
				.where(
					and(
						eq(historyAuditLog.userId, userId),
						eq(historyAuditLog.changedField, "current_runtime"),
						gte(sql`${historyAuditLog.createdAt}::date`, sql`${start}::date`),
						lte(sql`${historyAuditLog.createdAt}::date`, sql`${end}::date`),
					),
				)
				.groupBy(sql`DATE(${historyAuditLog.createdAt})`)
				.orderBy(sql`DATE(${historyAuditLog.createdAt})`);

			const episodeMap = new Map<string, number>();
			for (const row of episodeRows) {
				episodeMap.set(row.date, (episodeMap.get(row.date) ?? 0) + row.total);
			}

			const minuteMap = new Map<string, number>();
			for (const row of minuteRows) {
				minuteMap.set(row.date, (minuteMap.get(row.date) ?? 0) + row.total);
			}

			const allDates = new Set([...episodeMap.keys(), ...minuteMap.keys()]);

			let cumulativeEpisodes = 0;
			let cumulativeMinutes = 0;

			return [...allDates].sort().map((date) => {
				cumulativeEpisodes += episodeMap.get(date) ?? 0;
				cumulativeMinutes += minuteMap.get(date) ?? 0;
				return {
					date,
					episodesCompleted: cumulativeEpisodes,
					minutesWatched: cumulativeMinutes,
				};
			});
		}),

	getStatusTransitions: protectedProcedure
		.input(dateRangeInput)
		.handler(async ({ input, context }) => {
			const userId = context.session!.userId;
			const start = input.startDate;
			const end = input.endDate;

			const rows = await db
				.select({
					oldValue: historyAuditLog.oldValue,
					newValue: historyAuditLog.newValue,
					count: count(),
				})
				.from(historyAuditLog)
				.where(
					and(
						eq(historyAuditLog.userId, userId),
						eq(historyAuditLog.changedField, "status"),
						gte(sql`${historyAuditLog.createdAt}::date`, sql`${start}::date`),
						lte(sql`${historyAuditLog.createdAt}::date`, sql`${end}::date`),
					),
				)
				.groupBy(historyAuditLog.oldValue, historyAuditLog.newValue);

			return rows.map((r) => ({
				from: r.oldValue ?? "created",
				to: r.newValue,
				count: Number(r.count),
			}));
		}),
};
