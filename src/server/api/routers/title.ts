import { updateTitle } from "@/app/(dashboard)/app/actions";
import {
	FindTitleSeasonsSchema,
	RefreshTitleDataSchema,
} from "@/app/(dashboard)/app/validations";
import { env } from "@/env";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { edgeClient } from "@/server/db";
import type { SeriesDetails } from "@/types/tmdb";
import e from "@edgedb/edgeql-js";

interface EpisodeData {
	name: string;
	episode_number: number;
	air_date: string;
	overview: string;
	runtime: number;
	seasonId: string;
}

type SeasonKey = `season/${number}`;
type SeasonInfo = {
	_id: string;
	air_date: string;
	episodes: Array<{
		air_date: string;
		episode_number: number;
		episode_type: string;
		id: number;
		name: string;
		overview: string;
		production_code: string;
		runtime: number;
		season_number: number;
		show_id: number;
		still_path: string;
		vote_average: number;
		vote_count: number;
		crew: Array<{
			job: string;
			department: string;
			credit_id: string;
			adult: boolean;
			gender: number;
			id: number;
			known_for_department: string;
			name: string;
			original_name: string;
			popularity: number;
			profile_path?: string;
		}>;
		guest_stars: Array<{
			character: string;
			credit_id: string;
			order: number;
			adult: boolean;
			gender: number;
			id: number;
			known_for_department: string;
			name: string;
			original_name: string;
			popularity: number;
			profile_path?: string;
		}>;
	}>;
	name: string;
	overview: string;
	poster_path: string;
	season_number: number;
	vote_average: number;
};

export type Root = {
	adult: boolean;
	backdrop_path: string;
	created_by: Array<{
		id: number;
		credit_id: string;
		name: string;
		original_name: string;
		gender: number;
		profile_path: string;
	}>;
	episode_run_time: Array<number>;
	first_air_date: string;
	genres: Array<{
		id: number;
		name: string;
	}>;
	homepage: string;
	id: number;
	in_production: boolean;
	languages: Array<string>;
	last_air_date: string;
	last_episode_to_air: {
		id: number;
		name: string;
		overview: string;
		vote_average: number;
		vote_count: number;
		air_date: string;
		episode_number: number;
		episode_type: string;
		production_code: string;
		runtime: number;
		season_number: number;
		show_id: number;
		still_path: string;
	};
	name: string;
	next_episode_to_air: number | null;
	networks: Array<{
		id: number;
		logo_path: string;
		name: string;
		origin_country: string;
	}>;
	number_of_episodes: number;
	number_of_seasons: number;
	origin_country: Array<string>;
	original_language: string;
	original_name: string;
	overview: string;
	popularity: number;
	poster_path: string;
	production_companies: Array<{
		id: number;
		logo_path?: string;
		name: string;
		origin_country: string;
	}>;
	production_countries: Array<{
		iso_3166_1: string;
		name: string;
	}>;
	seasons: Array<{
		air_date?: string;
		episode_count: number;
		id: number;
		name: string;
		overview: string;
		poster_path?: string;
		season_number: number;
		vote_average: number;
	}>;
	spoken_languages: Array<{
		english_name: string;
		iso_639_1: string;
		name: string;
	}>;
	status: string;
	tagline: string;
	type: string;
	vote_average: number;
	vote_count: number;
	[key: `season/${number}`]: SeasonInfo;
};

const addEpisodesQuery = e.params(
	{
		episodes: e.array(
			e.tuple({
				air_date: e.str,
				episode_number: e.int32,
				name: e.str,
				overview: e.str,
				runtime: e.int32,
				seasonId: e.uuid,
			}),
		),
	},
	({ episodes }) => {
		return e.for(
			e.array_unpack(episodes),
			({ air_date, episode_number, name, overview, runtime, seasonId }) => {
				return e.insert(e.Episode, {
					season: e.select(e.Season, (season) => ({
						filter_single: e.op(season.id, "=", seasonId),
					})),
					episode_number: episode_number,
					air_date: e.cast(e.cal.local_date, air_date),
					name: name,
					overview: overview,
					runtime: runtime ?? 0,
				});
			},
		);
	},
);

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

			await addSeasonEpisodes(titleData?.title.tmdbId);
			await updateTitle({
				tmdbId: titleData?.title.tmdbId,
				type: titleData?.title.type,
				userId: session?.id,
			});

			return { id };
		}),
});

export async function addSeasonEpisodes(tmdbId: number) {
	const title = await e
		.select(e.Title, (title) => ({
			tmdbId: true,
			id: true,
			filter_single: e.op(
				e.op(title.tmdbId, "=", e.cast(e.std.int32, tmdbId)),
				"and",
				e.op(e.count(title.seasons.episodes), "=", 0),
			),
			limit: 1,
			seasons: {
				id: true,
				total_episodes: true,
				season_number: true,
			},
		}))
		.run(edgeClient);

	if (!title) {
		return { success: true, neededUpdate: false };
	}

	const s: EpisodeData[] = [];

	const seasonsKeys = title.seasons.map(
		({ season_number }) => `season/${season_number}` as SeasonKey,
	);

	const toAppend = seasonsKeys.join(",");

	const url = `https://api.themoviedb.org/3/tv/${tmdbId}?&append_to_response=${toAppend}`;

	const resposne = await fetch(url, {
		method: "GET",
		headers: {
			Accept: "application/json",
			Authorization: `Bearer ${env.TMDB_API_KEY}`,
		},
	});

	const fetchedData = (await resposne.json()) as Root;

	for (const seasonKey of seasonsKeys) {
		const seasons = fetchedData[seasonKey].episodes;

		for (const ep of seasons) {
			const seasonNumber = ep.season_number;

			const findSeasonId = title.seasons.find(
				(season) => season.season_number === seasonNumber,
			)?.id;

			if (!findSeasonId) {
				throw new Error("Season ID not found");
			}

			s.push({
				air_date: ep.air_date,
				episode_number: ep.episode_number,
				name: ep.name,
				overview: ep.overview,
				runtime: ep.runtime ?? 0,
				seasonId: findSeasonId,
			});
		}
	}

	const result = await addEpisodesQuery.run(edgeClient, {
		episodes: s,
	});

	if (result.length > 0) {
		return { success: true, neededUpdate: true };
	}

	return { success: false, neededUpdate: true };
}
