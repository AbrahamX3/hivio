import { eq } from "drizzle-orm";
import type { Movie, TV } from "tmdb-ts";
import { TMDB } from "tmdb-ts";
import { z } from "zod";

import { db } from "@/db";
import { history, titles } from "@/db/schema";
import { env } from "@/env";
import { redis } from "@/lib/redis";

import { publicProcedure } from "../procedures";

const getTmdbClient = () => {
	const apiKey = env.TMDB_API_KEY;
	if (!apiKey) throw new Error("TMDB_API_KEY not configured");
	return new TMDB(apiKey);
};

const tmdbInputSchema = z.object({
	tmdbId: z.number(),
	mediaType: z.enum(["MOVIE", "SERIES"]),
});

export const tmdbRouter = {
	search: publicProcedure
		.input(
			z.object({
				query: z.string(),
				mediaType: z.enum(["MOVIE", "SERIES"]).optional(),
			}),
		)
		.handler(async ({ input }) => {
			const tmdb = getTmdbClient();
			const results = await tmdb.search.multi({ query: input.query });
			return results.results
				.filter((r): r is typeof r & { media_type: "movie" | "tv" } => {
					if (!("media_type" in r)) return false;
					return r.media_type === "movie" || r.media_type === "tv";
				})
				.map((r) => ({
					id: r.id,
					name: "title" in r ? r.title : "name" in r ? r.name : "",
					posterPath: "poster_path" in r ? r.poster_path : undefined,
					backdropPath: "backdrop_path" in r ? r.backdrop_path : undefined,
					overview: "overview" in r ? r.overview : undefined,
					mediaType:
						r.media_type === "movie" ? ("MOVIE" as const) : ("SERIES" as const),
					releaseDate:
						"release_date" in r
							? r.release_date
							: "first_air_date" in r
								? r.first_air_date
								: null,
					popularity: r.popularity,
				}))
				.filter((r) => {
					if (!r.name) return false;
					if (input.mediaType && r.mediaType !== input.mediaType) return false;
					return true;
				});
		}),

	getDetails: publicProcedure
		.input(tmdbInputSchema)
		.handler(async ({ input }) => {
			const tmdb = getTmdbClient();

			if (input.mediaType === "MOVIE") {
				const [movie, credits] = await Promise.all([
					tmdb.movies.details(input.tmdbId, ["external_ids"]),
					tmdb.movies.credits(input.tmdbId),
				]);

				return {
					id: movie.id,
					name: movie.title,
					posterPath: movie.poster_path,
					backdropPath: movie.backdrop_path,
					overview: movie.overview,
					releaseDate: movie.release_date,
					runtime: movie.runtime,
					genres: movie.genres?.map((g) => g.id) || [],
					imdbId: movie.external_ids?.imdb_id,
					directors:
						credits.crew
							?.filter((c) => c.job === "Director")
							.map((c) => c.name) || [],
					seasons: null,
					voteAverage: movie.vote_average,
				};
			} else {
				const tvShow = await tmdb.tvShows.details(input.tmdbId, [
					"external_ids",
				]);

				return {
					id: tvShow.id,
					name: tvShow.name,
					posterPath: tvShow.poster_path,
					backdropPath: tvShow.backdrop_path,
					overview: tvShow.overview,
					releaseDate: tvShow.first_air_date,
					runtime: null,
					genres: tvShow.genres?.map((g) => g.id) || [],
					imdbId: tvShow.external_ids?.imdb_id,
					directors: tvShow.created_by?.map((c) => c.name) || [],
					seasons:
						tvShow.seasons?.map((s) => ({
							seasonNumber: s.season_number,
							name: s.name,
							episodeCount: s.episode_count,
							airDate: s.air_date,
						})) || [],
					voteAverage: tvShow.vote_average,
				};
			}
		}),

	getSeasonEpisodes: publicProcedure
		.input(z.object({ tmdbId: z.number(), seasonNumber: z.number() }))
		.handler(async ({ input }) => {
			const tmdb = getTmdbClient();
			const season = await tmdb.tvShows.season(
				input.tmdbId,
				input.seasonNumber,
			);
			return season.episodes.map((ep) => ({
				episodeNumber: ep.episode_number,
				name: ep.name,
				airDate: ep.air_date ?? null,
				runtime:
					"runtime" in ep
						? ((ep as { runtime?: number }).runtime ?? null)
						: null,
				overview:
					"overview" in ep
						? ((ep as { overview?: string }).overview ?? null)
						: null,
			}));
		}),

	getWatchProviders: publicProcedure
		.input(tmdbInputSchema)
		.handler(async ({ input }) => {
			const tmdb = getTmdbClient();

			if (input.mediaType === "MOVIE") {
				const providers = await tmdb.movies.watchProviders(input.tmdbId);
				return (
					providers.results?.US?.flatrate?.map((p) => ({
						logoPath: p.logo_path,
						providerName: p.provider_name,
					})) || []
				);
			} else {
				const providers = await tmdb.tvShows.watchProviders(input.tmdbId);
				return (
					providers.results?.US?.flatrate?.map((p) => ({
						logoPath: p.logo_path,
						providerName: p.provider_name,
					})) || []
				);
			}
		}),

	getVideos: publicProcedure
		.input(tmdbInputSchema)
		.handler(async ({ input }) => {
			const tmdb = getTmdbClient();

			if (input.mediaType === "MOVIE") {
				const { results } = await tmdb.movies.videos(input.tmdbId);
				return results.map((v) => ({
					key: v.key,
					name: v.name,
					site: v.site,
					type: v.type,
				}));
			} else {
				const { results } = await tmdb.tvShows.videos(input.tmdbId);
				return results.map((v) => ({
					key: v.key,
					name: v.name,
					site: v.site,
					type: v.type,
				}));
			}
		}),

	getTrendingTitles: publicProcedure
		.input(z.object({ limit: z.number().min(1).max(20).default(10) }))
		.handler(async ({ input }) => {
			const cacheKey = `tmdb:trending:titles:${input.limit}`;
			const cached = await redis.get<
				{
					id: number;
					name: string;
					posterPath: string | null;
					backdropPath: string | null;
					overview: string | null;
					mediaType: "MOVIE" | "SERIES";
					releaseDate: string | null;
				}[]
			>(cacheKey);

			if (cached) {
				return cached;
			}

			const tmdb = getTmdbClient();
			const { results } = await tmdb.trending.trending("all", "day");

			const list = results
				.filter((r): r is typeof r & { media_type: "movie" | "tv" } => {
					if (!("media_type" in r)) return false;
					return r.media_type === "movie" || r.media_type === "tv";
				})
				.slice(0, input.limit)
				.map((r) => ({
					id: r.id,
					name: "title" in r ? r.title : "name" in r ? r.name : "",
					posterPath: ("poster_path" in r ? r.poster_path : null) as
						| string
						| null,
					backdropPath: ("backdrop_path" in r ? r.backdrop_path : null) as
						| string
						| null,
					overview: ("overview" in r ? r.overview : null) as string | null,
					mediaType:
						r.media_type === "movie" ? ("MOVIE" as const) : ("SERIES" as const),
					releaseDate:
						"release_date" in r
							? r.release_date
							: "first_air_date" in r
								? r.first_air_date
								: null,
				}));

			await redis.set(cacheKey, list, { ex: 60 * 60 * 24 * 7 });
			return list;
		}),

	getDiscoverTrending: publicProcedure
		.input(
			z.object({
				pages: z.number().min(1).max(10).default(2),
				timeWindow: z.enum(["day", "week"]).default("week"),
				excludeInLibrary: z.boolean().default(true),
			}),
		)
		.handler(async ({ input, context }) => {
			const cacheKey = `trending:discover:${input.pages}:${input.timeWindow}`;
			const cached = await redis.get<
				{
					id: number;
					name: string;
					posterUrl: string | null;
					backdropUrl: string | null;
					mediaType: "MOVIE" | "SERIES";
					tmdbId: number;
					description: string | null;
					releaseDate: string | null;
					genres: number[] | null;
					providers: string[];
				}[]
			>(cacheKey);

			let list: {
				id: number;
				name: string;
				posterUrl: string | null;
				backdropUrl: string | null;
				mediaType: "MOVIE" | "SERIES";
				tmdbId: number;
				description: string | null;
				releaseDate: string | null;
				genres: number[] | null;
				providers: string[];
			}[];

			if (cached) {
				list = cached;
			} else {
				const tmdb = getTmdbClient();

				const trendingPages = await Promise.all(
					Array.from({ length: input.pages }, (_, i) =>
						tmdb.trending.trending("all", input.timeWindow, { page: i + 1 }),
					),
				);

				const trendingItemsMap = new Map<
					string,
					{
						id: number;
						name: string;
						posterUrl: string | null;
						backdropUrl: string | null;
						mediaType: "MOVIE" | "SERIES";
						tmdbId: number;
						description: string | null;
						releaseDate: string | null;
						genres: number[] | null;
					}
				>();

				for (const page of trendingPages) {
					for (const item of page.results ?? []) {
						if (!("media_type" in item)) continue;
						if (item.media_type !== "movie" && item.media_type !== "tv")
							continue;

						const key = `${item.id}-${item.media_type === "movie" ? "MOVIE" : "SERIES"}`;
						if (trendingItemsMap.has(key)) continue;

						if (item.media_type === "movie") {
							const movie = item as Movie & { media_type: "movie" };
							trendingItemsMap.set(key, {
								id: movie.id,
								name: movie.title,
								posterUrl: movie.poster_path,
								backdropUrl: movie.backdrop_path,
								mediaType: "MOVIE",
								tmdbId: movie.id,
								description: movie.overview ?? null,
								releaseDate: movie.release_date ?? null,
								genres: movie.genre_ids ?? [],
							});
						} else {
							const tv = item as TV & { media_type: "tv" };
							trendingItemsMap.set(key, {
								id: tv.id,
								name: tv.name,
								posterUrl: tv.poster_path,
								backdropUrl: tv.backdrop_path,
								mediaType: "SERIES",
								tmdbId: tv.id,
								description: tv.overview ?? null,
								releaseDate: tv.first_air_date ?? null,
								genres: tv.genre_ids ?? [],
							});
						}
					}
				}

				const rawList = Array.from(trendingItemsMap.values());

				const providerResults = await Promise.allSettled(
					rawList.map(async (item) => {
						const providersResults =
							item.mediaType === "MOVIE"
								? await tmdb.movies.watchProviders(item.tmdbId)
								: await tmdb.tvShows.watchProviders(item.tmdbId);

						const flatrate = providersResults.results?.US?.flatrate ?? [];
						return flatrate
							.slice(0, 3)
							.map((p) => p.logo_path)
							.filter((path): path is string => Boolean(path));
					}),
				);

				list = rawList.map((item, index) => ({
					...item,
					providers:
						providerResults[index].status === "fulfilled"
							? providerResults[index].value
							: [],
				}));

				await redis.set(cacheKey, list, { ex: 60 * 60 * 24 });
			}

			if (input.excludeInLibrary && context.session?.userId) {
				const rows = await db
					.select({ tmdbId: titles.tmdbId })
					.from(history)
					.innerJoin(titles, eq(history.titleId, titles.id))
					.where(eq(history.userId, context.session.userId));

				const inLibrary = new Set(rows.map((r) => r.tmdbId.toString()));
				list = list.filter((t) => !inLibrary.has(t.tmdbId.toString()));
			}

			return list;
		}),

	getRecommendations: publicProcedure
		.input(
			z.object({
				tmdbId: z.number(),
				mediaType: z.enum(["MOVIE", "SERIES"]),
				pages: z.number().min(1).max(5).default(3),
			}),
		)
		.handler(async ({ input }) => {
			const tmdb = getTmdbClient();

			const pageResults = await Promise.all(
				Array.from({ length: input.pages }, (_, i) =>
					input.mediaType === "MOVIE"
						? tmdb.movies.recommendations(input.tmdbId, { page: i + 1 })
						: tmdb.tvShows.recommendations(input.tmdbId, { page: i + 1 }),
				),
			);

			const seen = new Set<number>();
			const results: Array<{
				id: number;
				name: string;
				posterPath: string | null;
				overview: string | null;
				releaseDate: string | null;
				voteAverage: number | null;
				genreIds: number[];
				mediaType: "MOVIE" | "SERIES";
			}> = [];

			for (const page of pageResults) {
				for (const item of page.results ?? []) {
					if (seen.has(item.id)) continue;
					seen.add(item.id);

					results.push({
						id: item.id,
						name: "title" in item ? item.title : item.name,
						posterPath: item.poster_path ?? null,
						overview: item.overview ?? null,
						releaseDate:
							"release_date" in item
								? item.release_date
								: "first_air_date" in item
									? item.first_air_date
									: null,
						voteAverage: item.vote_average ?? null,
						genreIds: item.genre_ids ?? [],
						mediaType: input.mediaType === "MOVIE" ? "MOVIE" : "SERIES",
					});
				}
			}

			return results;
		}),

	getNextEpisodeInfoBatch: publicProcedure
		.input(
			z.array(
				z.object({
					tmdbId: z.number(),
					currentSeason: z.number(),
					currentEpisode: z.number(),
				}),
			),
		)
		.handler(async ({ input }) => {
			const tmdb = getTmdbClient();

			const results = await Promise.all(
				input.map(async ({ tmdbId, currentSeason, currentEpisode }) => {
					const cacheKey = `tmdb:nextEpisode:${tmdbId}:${currentSeason}:${currentEpisode}`;
					const cached = await redis.get<{
						nextEpisode: {
							episodeNumber: number;
							name: string;
							airDate: string;
						} | null;
						seasonProgress: {
							current: number;
							total: number;
						} | null;
						lastAired: {
							episodeNumber: number;
							name: string;
							airDate: string;
						} | null;
					}>(cacheKey);

					if (cached) {
						return cached;
					}

					try {
						const season = await tmdb.tvShows.season(tmdbId, currentSeason);
						const nextEpisode = season.episodes.find(
							(ep) => ep.episode_number === currentEpisode + 1,
						);

						let result: {
							nextEpisode: {
								episodeNumber: number;
								name: string;
								airDate: string;
							} | null;
							seasonProgress: {
								current: number;
								total: number;
							} | null;
							lastAired: {
								episodeNumber: number;
								name: string;
								airDate: string;
							} | null;
						};

						if (nextEpisode) {
							result = {
								nextEpisode: {
									episodeNumber: nextEpisode.episode_number,
									name: nextEpisode.name,
									airDate: nextEpisode.air_date || "",
								},
								seasonProgress: {
									current: currentEpisode,
									total: season.episodes.length,
								},
								lastAired: null,
							};
						} else {
							let nextSeasonEpisode: {
								episodeNumber: number;
								name: string;
								airDate: string;
							} | null = null;

							const nextSeason = await tmdb.tvShows.season(
								tmdbId,
								currentSeason + 1,
							);
							if (nextSeason.episodes.length > 0) {
								nextSeasonEpisode = {
									episodeNumber: 1,
									name: nextSeason.episodes[0].name,
									airDate: nextSeason.episodes[0].air_date || "",
								};
							}

							const lastEpisode = season.episodes[season.episodes.length - 1];
							result = {
								nextEpisode: nextSeasonEpisode,
								seasonProgress: {
									current: currentEpisode,
									total: season.episodes.length,
								},
								lastAired: lastEpisode
									? {
											episodeNumber: lastEpisode.episode_number,
											name: lastEpisode.name,
											airDate: lastEpisode.air_date || "",
										}
									: null,
							};
						}

						await redis.set(cacheKey, result, { ex: 60 * 60 * 24 });
						return result;
					} catch {
						return {
							nextEpisode: null,
							seasonProgress: null,
							lastAired: null,
						};
					}
				}),
			);

			return results;
		}),
};
