import {
	fetchPosterBlur,
	findTitleDetails,
	getIMDBId,
	updateTitle,
} from "@/app/(dashboard)/app/actions";
import {
	AddTitleToHiveSchema,
	saveTitleFormSchema,
} from "@/app/(dashboard)/app/validations";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import e from "@edgedb/edgeql-js";
import { TitleType } from "@edgedb/edgeql-js/modules/default";
import { z } from "zod";
import {
	selectHiveQuery,
	selectTitleByIdQuery,
	selectTitleMetadataByIdQuery,
} from "../queries";

export const hiveRouter = createTRPCRouter({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		return await selectHiveQuery.run(ctx.authClient);
	}),
	getMetadataById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			return await selectTitleMetadataByIdQuery.run(ctx.authClient, {
				titleId: input.id,
			});
		}),
	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			return await selectTitleByIdQuery.run(ctx.authClient, {
				titleId: input.id,
			});
		}),
	update: protectedProcedure
		.input(saveTitleFormSchema)
		.mutation(async ({ ctx, input }) => {
			const id = input.id;
			const form = input.form;

			const totalRuntime =
				(input.form.currentRuntimeHours ?? 0) * 60 +
				(input.form.currentRuntimeMinutes ?? 0);

			if (form.status === "FINISHED") {
				const data = await e
					.update(e.Hive, (hive) => ({
						set: {
							status: form.status,
							currentEpisode: form.currentEpisode ? form.currentEpisode : null,
							currentSeason: form.currentSeason ? form.currentSeason : null,
							finishedAt: form.finishedAt ? form.finishedAt : null,
							rating: form.rating ? form.rating : null,
							startedAt: form.startedAt ? form.startedAt : null,
							isFavorite: form.isFavorite ?? false,
							currentRunTime: totalRuntime ?? 0,
						},
						filter_single: e.op(
							e.op(hive.id, "=", e.uuid(id)),
							"and",
							e.op(hive.addedBy.id, "=", e.global.CurrentUser.id),
						),
					}))
					.run(ctx.authClient);

				return data;
			}
			if (form.status === "PENDING") {
				const data = await e
					.update(e.Hive, (hive) => ({
						set: {
							status: form.status,
						},
						filter_single: e.op(
							e.op(hive.id, "=", e.uuid(id)),
							"and",
							e.op(hive.addedBy.id, "=", e.global.CurrentUser.id),
						),
					}))
					.run(ctx.authClient);

				return data;
			}
			if (form.status === "UNFINISHED") {
				const data = await e
					.update(e.Hive, (hive) => ({
						set: {
							status: form.status,
							currentEpisode: form.currentEpisode ? form.currentEpisode : null,
							currentSeason: form.currentSeason ? form.currentSeason : null,
							startedAt: form.startedAt ? form.startedAt : null,
							isFavorite: e.bool(form.isFavorite ?? false),
							currentRunTime: totalRuntime ?? 0,
						},
						filter_single: e.op(
							e.op(hive.id, "=", e.uuid(id)),
							"and",
							e.op(hive.addedBy.id, "=", e.global.CurrentUser.id),
						),
					}))
					.run(ctx.authClient);

				return data;
			}
			if (form.status === "WATCHING") {
				const data = await e
					.update(e.Hive, (hive) => ({
						set: {
							status: form.status,
							currentEpisode: form.currentEpisode ? form.currentEpisode : null,
							currentSeason: form.currentSeason ? form.currentSeason : null,
							startedAt: form.startedAt ? form.startedAt : null,
							isFavorite: e.bool(form.isFavorite ?? false),
							currentRunTime: totalRuntime ?? 0,
						},
						filter_single: e.op(
							e.op(hive.id, "=", e.uuid(id)),
							"and",
							e.op(hive.addedBy.id, "=", e.global.CurrentUser.id),
						),
					}))
					.run(ctx.authClient);

				return data;
			}

			return null;
		}),
	create: protectedProcedure
		.input(AddTitleToHiveSchema)
		.mutation(async ({ ctx, input }) => {
			const client = ctx.authClient;
			const tmdbId = input.titleFormValues.tmdbId;
			const TypeEnum =
				input.titleFormValues.type === "movie"
					? TitleType.MOVIE
					: TitleType.SERIES;
			const isTitleAdded = await e
				.select(e.Title, (title) => ({
					tmdbId: true,
					type: true,
					updatedAt: true,
					filter_single: e.op(
						e.op(title.tmdbId, "=", e.int32(tmdbId)),
						"and",
						e.op(title.type, "=", TypeEnum),
					),
				}))
				.run(client);

			if (!isTitleAdded?.tmdbId) {
				const titleDetails = await findTitleDetails({
					tmdbId: input.titleFormValues.tmdbId,
					type: input.titleFormValues.type,
				});

				const data = titleDetails?.data;

				if (!data) {
					throw new Error("Failed to fetch title details");
				}

				const name = data?.mediaType === "movie" ? data.title : data.name;
				const date =
					data.mediaType === "movie" ? data.release_date : data.first_air_date;
				const type = data.mediaType === "movie" ? "MOVIE" : "SERIES";
				const { overview, id, poster_path } = data;
				const genre_ids = data.genres.map((genre) => genre.id);
				const imdbId = await getIMDBId(id, type);
				const posterBlurhash = await fetchPosterBlur(
					`https://image.tmdb.org/t/p/original${poster_path}`,
				);

				const insertTitle = await e
					.insert(e.Title, {
						tmdbId: e.int32(id),
						name: e.str(name),
						description: e.str(overview),
						release_date: e.cal.local_date(date),
						poster: e.str(poster_path),
						posterBlur: posterBlurhash,
						type: TypeEnum,
						runtime:
							data.mediaType === "movie" ? e.int32(data.runtime) : undefined,
						rating: data.vote_average
							? e.float32(data.vote_average)
							: undefined,
						genres: genre_ids,
						imdbId: imdbId ?? undefined,
					})
					.run(client);

				if (data.mediaType === "series") {
					const titleId = e.select(e.Title, (title) => ({
						filter_single: e.op(title.id, "=", e.uuid(insertTitle.id)),
					}));

					const query = e.params(
						{
							seasons: e.array(
								e.tuple({
									season: e.int32,
									episodes: e.int32,
									date: e.str,
								}),
							),
						},
						({ seasons }) => {
							return e.for(
								e.array_unpack(seasons),
								({ date, season, episodes }) => {
									return e.insert(e.Season, {
										title: e.set(titleId),
										season_number: season,
										total_episodes: episodes,
										air_date: e.cast(e.cal.local_date, date),
									});
								},
							);
						},
					);

					const seasons = data.seasons
						.filter(
							(season) =>
								season.season_number !== 0 &&
								season.episode_count !== 0 &&
								season.air_date !== null,
						)
						.map((details) => ({
							season: details.season_number,
							episodes: details.episode_count,
							date: details.air_date,
						}));

					await query.run(client, {
						seasons,
					});
				}
			} else {
				await updateTitle({
					tmdbId: isTitleAdded.tmdbId,
					type: isTitleAdded.type,
					userId: ctx.session?.id,
				});
			}

			const isTitleInHive = await e
				.select(e.Hive, (hive) => ({
					filter_single: e.op(
						e.op(
							e.op(hive.title.tmdbId, "=", tmdbId),
							"and",
							e.op(hive.title.type, "=", TypeEnum),
						),
						"and",
						e.op(hive.addedBy.id, "=", e.global.CurrentUser.id),
					),
				}))
				.run(client);

			if (isTitleInHive) {
				return {
					success: false,
					error: {
						reason: "Title is already added to your hive!",
					},
				};
			}
			const titleToAdd = e.select(e.Title, (title) => ({
				filter_single: e.op(
					e.op(title.tmdbId, "=", tmdbId),
					"and",
					e.op(title.type, "=", TypeEnum),
				),
			}));

			const status = input.hiveFormValues.status;

			if (status === "FINISHED") {
				const insert = await e
					.insert(e.Hive, {
						addedBy: e.global.CurrentUser,
						title: titleToAdd,
						status: input.hiveFormValues.status,
						finishedAt: input.hiveFormValues.finishedAt
							? input.hiveFormValues.finishedAt
							: undefined,
						startedAt: input.hiveFormValues.startedAt
							? input.hiveFormValues.startedAt
							: undefined,
						currentEpisode: input.hiveFormValues.currentEpisode,
						currentSeason: input.hiveFormValues.currentSeason,
						rating: input.hiveFormValues.rating
							? e.float32(input.hiveFormValues.rating)
							: undefined,
						isFavorite: e.bool(input.hiveFormValues.isFavorite ?? false),
					})
					.run(client);

				return {
					success: true,
					status: input.hiveFormValues.status,
					data: insert.id,
				};
			}
			if (status === "PENDING") {
				const insert = await e
					.insert(e.Hive, {
						addedBy: e.global.CurrentUser,
						title: titleToAdd,
						currentEpisode: input.hiveFormValues.currentEpisode,
						startedAt: input.hiveFormValues.startedAt
							? input.hiveFormValues.startedAt
							: null,
						currentSeason: input.hiveFormValues.currentSeason,
						status: input.hiveFormValues.status,
					})
					.run(client);

				return {
					success: true,
					status: input.hiveFormValues.status,
					data: insert.id,
				};
			}
			const insert = await e
				.insert(e.Hive, {
					addedBy: e.global.CurrentUser,
					title: titleToAdd,
					currentEpisode: input.hiveFormValues.currentEpisode,
					startedAt: input.hiveFormValues.startedAt
						? input.hiveFormValues.startedAt
						: null,
					currentSeason: input.hiveFormValues.currentSeason,
					status: input.hiveFormValues.status,
					isFavorite: e.bool(input.hiveFormValues.isFavorite ?? false),
				})
				.run(client);

			return {
				success: true,
				status: input.hiveFormValues.status,
				data: insert.id,
			};
		}),
});
