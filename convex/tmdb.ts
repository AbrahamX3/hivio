import { v } from "convex/values";
import { Movie, TMDB, TV } from "tmdb-ts";

import { action } from "./_generated/server";

const tmdb = new TMDB(process.env.TMDB_API_KEY!);

const mediaTypeValidator = v.union(v.literal("MOVIE"), v.literal("SERIES"));

export const search = action({
  args: {
    query: v.string(),
    mediaType: v.optional(mediaTypeValidator),
  },
  returns: v.array(
    v.object({
      id: v.number(),
      name: v.string(),
      posterUrl: v.optional(v.string()),
      backdropUrl: v.optional(v.string()),
      description: v.optional(v.string()),
      mediaType: v.union(v.literal("MOVIE"), v.literal("SERIES")),
      releaseDate: v.string(),
      genres: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    if (args.mediaType === "MOVIE") {
      const results = await tmdb.search.movies({
        query: args.query,
      });

      return results.results.map(mapMovieToResult);
    } else if (args.mediaType === "SERIES") {
      const results = await tmdb.search.tvShows({
        query: args.query,
      });
      return results.results.map(mapShowToResult);
    } else {
      const results = await tmdb.search.multi({
        query: args.query,
      });

      const filteredResults = results.results
        .filter(
          (item): item is typeof item & { media_type: "movie" | "tv" } =>
            item.media_type === "movie" || item.media_type === "tv"
        )
        .slice(0, 25)
        .map((item) => {
          if (item.media_type === "movie") {
            // We need to cast because the MultiSearchResult type in tmdb-ts might be broad
            // but we know it has movie properties if media_type is movie
            return mapMovieToResult(item);
          } else {
            return mapShowToResult(item);
          }
        });

      return filteredResults;
    }
  },
});

function mapMovieToResult(movie: Movie) {
  return {
    id: movie.id,
    name: movie.title,
    posterUrl: movie.poster_path || undefined,
    backdropUrl: movie.backdrop_path || undefined,
    description: movie.overview || undefined,
    mediaType: "MOVIE" as const,
    releaseDate: movie.release_date || "",
    genres: JSON.stringify(movie.genre_ids || []),
  };
}

function mapShowToResult(show: TV) {
  return {
    id: show.id,
    name: show.name,
    posterUrl: show.poster_path || undefined,
    backdropUrl: show.backdrop_path || undefined,
    description: show.overview || undefined,
    mediaType: "SERIES" as const,
    releaseDate: show.first_air_date || "",
    genres: JSON.stringify(show.genre_ids || []),
  };
}

export const getDetails = action({
  args: {
    tmdbId: v.number(),
    mediaType: mediaTypeValidator,
  },
  returns: v.object({
    directors: v.array(v.string()),
    imdbId: v.union(v.string(), v.null()),
    runtime: v.union(v.number(), v.null()),
    seasons: v.union(
      v.array(
        v.object({
          seasonNumber: v.number(),
          episodeCount: v.number(),
          name: v.string(),
          airDate: v.union(v.string(), v.null()),
        })
      ),
      v.null()
    ),
    episodes: v.null(),
    description: v.union(v.string(), v.null()),
  }),
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
  returns: v.array(
    v.object({
      episodeNumber: v.number(),
      name: v.string(),
      airDate: v.union(v.string(), v.null()),
      runtime: v.union(v.number(), v.null()),
      overview: v.union(v.string(), v.null()),
    })
  ),
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
        runtime: ep.runtime || null,
        overview: ep.overview || null,
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
      v.null()
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
        (ep) => ep.episode_number === args.currentEpisode
      );

      if (currentEpIndex === -1) {
        return {
          nextEpisode: null,
          seasonProgress,
        };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = currentEpIndex + 1; i < episodes.length; i++) {
        const episode = episodes[i];
        if (!episode.air_date) continue;

        const airDate = new Date(episode.air_date);
        airDate.setHours(0, 0, 0, 0);

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
      providers: v.array(v.string()),
    })
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
        .map((movie) => ({
          id: movie.id,
          name: movie.title,
          posterUrl: movie.poster_path ? movie.poster_path : null, // explicit null
          mediaType: "MOVIE" as const,
          tmdbId: movie.id,
        }));

      const series = (popularTv.results || []).slice(0, limit).map((show) => ({
        id: show.id,
        name: show.name,
        posterUrl: show.poster_path ? show.poster_path : null, // explicit null
        mediaType: "SERIES" as const,
        tmdbId: show.id,
      }));

      // Interleave results
      const allTrending = [];
      const maxLength = Math.max(movies.length, series.length);
      for (let i = 0; i < maxLength; i++) {
        if (i < movies.length) allTrending.push(movies[i]);
        if (i < series.length) allTrending.push(series[i]);
      }

      const trendingSlice = allTrending.slice(0, limit);

      const resultsWithProviders = await Promise.all(
        trendingSlice.map(async (item) => {
          try {
            const providersResults =
              item.mediaType === "MOVIE"
                ? await tmdb.movies.watchProviders(item.tmdbId)
                : await tmdb.tvShows.watchProviders(item.tmdbId);

            const usProviders = providersResults.results?.US;
            const flatrate = usProviders?.flatrate || [];

            const providerLogos = flatrate
              .slice(0, 3)
              .map((p) => p.logo_path)
              .filter(Boolean);

            return {
              ...item,
              providers: providerLogos,
            };
          } catch {
            return {
              ...item,
              providers: [],
            };
          }
        })
      );

      return resultsWithProviders;
    } catch {
      return [];
    }
  },
});

export const getWatchProviders = action({
  args: {
    tmdbId: v.number(),
    mediaType: mediaTypeValidator,
  },
  returns: v.array(
    v.object({
      logo_path: v.string(),
      provider_name: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    try {
      const providersResults =
        args.mediaType === "MOVIE"
          ? await tmdb.movies.watchProviders(args.tmdbId)
          : await tmdb.tvShows.watchProviders(args.tmdbId);

      const usProviders = providersResults.results?.US;
      const flatrate = usProviders?.flatrate || [];

      return flatrate.map((p) => ({
        logo_path: p.logo_path,
        provider_name: p.provider_name,
      }));
    } catch {
      return [];
    }
  },
});

export const getVideos = action({
  args: {
    tmdbId: v.number(),
    mediaType: mediaTypeValidator,
  },
  returns: v.array(
    v.object({
      key: v.string(),
      name: v.string(),
      site: v.string(),
      type: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    try {
      const videosResults =
        args.mediaType === "MOVIE"
          ? await tmdb.movies.videos(args.tmdbId)
          : await tmdb.tvShows.videos(args.tmdbId);

      return (videosResults.results || [])
        .filter(
          (v) =>
            v.site === "YouTube" &&
            (v.type === "Trailer" || v.type === "Teaser")
        )
        .map((v) => ({
          key: v.key,
          name: v.name,
          site: v.site,
          type: v.type,
        }));
    } catch {
      return [];
    }
  },
});
