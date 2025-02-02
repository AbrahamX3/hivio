import { updateTitle } from "@/app/(dashboard)/app/actions";
import {
	FindTitleSeasonsSchema,
	RefreshTitleDataSchema,
} from "@/app/(dashboard)/app/validations";
import { env } from "@/env";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import type { SeriesDetails } from "@/types/tmdb";
import e from "@edgedb/edgeql-js";

export const titleRouter = createTRPCRouter({
	search: protectedProcedure
		.input(FindTitleSeasonsSchema)
		.mutation(async ({ input }) => {
			const tmdbId = input.tmdbId;

			const response = await fetch(
				`https://api.themoviedb.org/3/tv/${tmdbId}`,
				{
					method: "GET",
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${env.TMDB_API_KEY}`,
					},
				},
			);

			const data = (await response.json()) as SeriesDetails;

			if (!response.ok) {
				throw new Error("Failed to fetch series data");
			}

			const seasons = data.seasons
				.map((details) => ({
					season: details.season_number,
					episodes: details.episode_count,
					date: details.air_date,
				}))
				.filter((season) => season.season !== 0);

			return { success: true, data: seasons };
		}),
	refresh: protectedProcedure
		.input(RefreshTitleDataSchema)
		.mutation(async ({ ctx, input }) => {
			const client = ctx.authClient;
			const session = ctx.session;
			const id = input.id;

			const titleData = await e
				.select(e.Hive, (hive) => ({
					title: {
						tmdbId: true,
						type: true,
					},
					filter_single: e.op(
						e.op(hive.id, "=", e.uuid(id)),
						"and",
						e.op(hive.addedBy.id, "=", e.global.CurrentUser.id),
					),
				}))
				.run(client);

			if (!titleData) return { id: null };

			await updateTitle({
				tmdbId: titleData?.title.tmdbId,
				type: titleData?.title.type,
				userId: session?.id,
			});

			return { id };
		}),
});
