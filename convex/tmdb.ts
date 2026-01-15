import { v } from "convex/values";
import { TMDB } from "tmdb-ts";

import { action } from "./_generated/server";

const tmdb = new TMDB(process.env.TMDB_API_KEY!);

const mediaTypeValidator = v.union(v.literal("MOVIE"), v.literal("SERIES"));

export const search = action({
  args: {
    query: v.string(),
    mediaType: v.optional(mediaTypeValidator),
  },
  handler: async (ctx, args) => {
    if (args.mediaType === "MOVIE") {
      const results = await tmdb.search.movies({
        query: args.query,
      });

      return results.results.map((movie) => ({
        id: movie.id,
        name: movie.title,
        posterUrl: movie.poster_path ?? undefined,
        backdropUrl: movie.backdrop_path ?? undefined,
        description: movie.overview ?? undefined,
        mediaType: "MOVIE" as const,
        releaseDate: movie.release_date || "",
        genres: JSON.stringify(movie.genre_ids || []),
      }));
    } else if (args.mediaType === "SERIES") {
      const results = await tmdb.search.tvShows({
        query: args.query,
      });
      return results.results.map((show) => ({
        id: show.id,
        name: show.name,
        posterUrl: show.poster_path ?? undefined,
        backdropUrl: show.backdrop_path ?? undefined,
        description: show.overview ?? undefined,
        mediaType: "SERIES" as const,
        releaseDate: show.first_air_date || "",
        genres: JSON.stringify(show.genre_ids || []),
      }));
    } else {
      const results = await tmdb.search.multi({
        query: args.query,
      });

      const filteredResults = results.results
        .filter(
          (item): item is typeof item & { media_type: "movie" | "tv" } =>
            item.media_type === "movie" || item.media_type === "tv",
        )
        .slice(0, 25)
        .map((item) => {
          if (item.media_type === "movie") {
            const movie = item as typeof item & {
              title: string;
              release_date?: string;
              genre_ids?: number[];
            };
            return {
              id: movie.id,
              name: movie.title,
              posterUrl: movie.poster_path ?? undefined,
              backdropUrl: movie.backdrop_path ?? undefined,
              description: movie.overview ?? undefined,
              mediaType: "MOVIE" as const,
              releaseDate: movie.release_date || "",
              genres: JSON.stringify(movie.genre_ids || []),
            };
          } else {
            const show = item as typeof item & {
              name: string;
              first_air_date?: string;
              genre_ids?: number[];
            };
            return {
              id: show.id,
              name: show.name,
              posterUrl: show.poster_path ?? undefined,
              backdropUrl: show.backdrop_path ?? undefined,
              description: show.overview ?? undefined,
              mediaType: "SERIES" as const,
              releaseDate: show.first_air_date || "",
              genres: JSON.stringify(show.genre_ids || []),
            };
          }
        });

      return filteredResults;
    }
  },
});

export const getDetails = action({
  args: {
    tmdbId: v.number(),
    mediaType: mediaTypeValidator,
  },
  handler: async (ctx, args) => {
    if (args.mediaType === "MOVIE") {
      const [movie, credits] = await Promise.all([
        tmdb.movies.details(args.tmdbId, ["external_ids"]),
        tmdb.movies.credits(args.tmdbId),
      ]);

      const directors =
        credits.crew?.filter((c) => c.job === "Director")?.map((c) => c.name) ||
        [];

      return {
        directors,
        imdbId: movie.external_ids?.imdb_id,
        runtime: movie.runtime || null,
        seasons: null,
        episodes: null,
        description: movie.overview || null,
      };
    } else {
      const [tvShow] = await Promise.all([
        tmdb.tvShows.details(args.tmdbId, ["external_ids"]),
      ]);

      const seasons =
        tvShow.seasons
          ?.filter((s) => s.season_number >= 0)
          .map((s) => ({
            seasonNumber: s.season_number,
            episodeCount: s.episode_count || 0,
            name: s.name || `Season ${s.season_number}`,
            airDate: s.air_date || null,
          })) || [];

      const directors = tvShow.created_by?.map((c) => c.name) || [];

      return {
        imdbId: tvShow.external_ids?.imdb_id,
        runtime: null,
        seasons,
        directors,
        episodes: null,
        description: tvShow.overview || null,
      };
    }
  },
});

export const getSeasonEpisodes = action({
  args: {
    tmdbId: v.number(),
    seasonNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const season = await tmdb.tvSeasons.details({
      tvShowID: args.tmdbId,
      seasonNumber: args.seasonNumber,
    });
    return (
      season.episodes?.map((ep) => ({
        episodeNumber: ep.episode_number,
        name: ep.name || `Episode ${ep.episode_number}`,
        airDate: ep.air_date || null,
      })) || []
    );
  },
});

export const getNextEpisodeInfo = action({
  args: {
    tmdbId: v.number(),
    currentSeason: v.number(),
    currentEpisode: v.number(),
  },
  returns: v.object({
    nextEpisode: v.union(
      v.object({
        episodeNumber: v.number(),
        name: v.string(),
        airDate: v.string(),
      }),
      v.null(),
    ),
    seasonProgress: v.object({
      current: v.number(),
      total: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    try {
      const season = await tmdb.tvSeasons.details({
        tvShowID: args.tmdbId,
        seasonNumber: args.currentSeason,
      });

      const episodes = season.episodes || [];
      const seasonProgress = {
        current: args.currentEpisode,
        total: episodes.length,
      };

      const currentEpIndex = episodes.findIndex(
        (ep) => ep.episode_number === args.currentEpisode,
      );

      if (currentEpIndex === -1) {
        return {
          nextEpisode: null,
          seasonProgress,
        };
      }

      // Find the next episode that airs after today
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

      // Look for episodes after the current one that haven't aired yet
      for (let i = currentEpIndex + 1; i < episodes.length; i++) {
        const episode = episodes[i];
        if (!episode.air_date) continue;

        const airDate = new Date(episode.air_date);
        airDate.setHours(0, 0, 0, 0); // Reset time to start of day

        if (airDate >= today) {
          return {
            nextEpisode: {
              episodeNumber: episode.episode_number,
              name: episode.name || `Episode ${episode.episode_number}`,
              airDate: episode.air_date,
            },
            seasonProgress,
          };
        }
      }

      // No upcoming episodes found, return the most recent aired episode
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      let mostRecentAiredEpisode = null;
      for (let i = episodes.length - 1; i >= 0; i--) {
        const episode = episodes[i];
        if (!episode.air_date) continue;

        const airDate = new Date(episode.air_date);
        airDate.setHours(0, 0, 0, 0);

        if (airDate < now) {
          mostRecentAiredEpisode = episode;
          break;
        }
      }

      return {
        nextEpisode: mostRecentAiredEpisode
          ? {
              episodeNumber: mostRecentAiredEpisode.episode_number,
              name:
                mostRecentAiredEpisode.name ||
                `Episode ${mostRecentAiredEpisode.episode_number}`,
              airDate: mostRecentAiredEpisode.air_date,
            }
          : null,
        seasonProgress,
      };
    } catch {
      return {
        nextEpisode: null,
        seasonProgress: {
          current: args.currentEpisode,
          total: 0,
        },
      };
    }
  },
});

export const getTrendingTitles = action({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      id: v.number(),
      name: v.string(),
      posterUrl: v.union(v.string(), v.null()),
      mediaType: v.union(v.literal("MOVIE"), v.literal("SERIES")),
      tmdbId: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    try {
      const limit = args.limit ?? 3;

      const [popularMovies, popularTv] = await Promise.all([
        tmdb.discover.movie({
          sort_by: "popularity.desc",
        }),
        tmdb.discover.tvShow({
          sort_by: "popularity.desc",
        }),
      ]);

      const movies = (popularMovies.results || [])
        .slice(0, limit)
        .map(
          (movie: {
            id: number;
            title: string;
            poster_path: string | null;
          }) => ({
            id: movie.id,
            name: movie.title,
            posterUrl: movie.poster_path,
            mediaType: "MOVIE" as const,
            tmdbId: movie.id,
          }),
        );

      const series = (popularTv.results || [])
        .slice(0, limit)
        .map(
          (show: { id: number; name: string; poster_path: string | null }) => ({
            id: show.id,
            name: show.name,
            posterUrl: show.poster_path,
            mediaType: "SERIES" as const,
            tmdbId: show.id,
          }),
        );

      // Interleave movies and series to alternate between them
      const allTrending: Array<{
        id: number;
        name: string;
        posterUrl: string | null;
        mediaType: "MOVIE" | "SERIES";
        tmdbId: number;
      }> = [];
      const maxLength = Math.max(movies.length, series.length);

      for (let i = 0; i < maxLength; i++) {
        if (i < movies.length) {
          allTrending.push(movies[i]);
        }
        if (i < series.length) {
          allTrending.push(series[i]);
        }
      }

      return allTrending.slice(0, limit).map((item) => ({
        ...item,
        posterUrl: item.posterUrl ?? null,
      }));
    } catch {
      return [];
    }
  },
});
