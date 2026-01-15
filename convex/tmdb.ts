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
      // Use TMDB's multi search to search across all media types
      const results = await tmdb.search.multi({
        query: args.query,
      });

      // Filter for movies and TV shows only, and map to our unified format
      const filteredResults = results.results
        .filter(
          (item): item is typeof item & { media_type: "movie" | "tv" } =>
            item.media_type === "movie" || item.media_type === "tv",
        )
        .slice(0, 20) // Limit to top 20 results
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
      // Get movie details and credits separately
      const [movie, credits] = await Promise.all([
        tmdb.movies.details(args.tmdbId, ["external_ids"]),
        tmdb.movies.credits(args.tmdbId),
      ]);

      console.log("Movie credits data:", {
        crewCount: credits.crew?.length || 0,
        directorCount:
          credits.crew?.filter((c) => c.job === "Director").length || 0,
        directors:
          credits.crew
            ?.filter((c) => c.job === "Director")
            .map((c) => ({ name: c.name, job: c.job })) || [],
      });

      const directors =
        credits.crew?.filter((c) => c.job === "Director")?.map((c) => c.name) ||
        [];

      return {
        directors,
        imdbId: movie.external_ids?.imdb_id,
        runtime: movie.runtime || null,
        seasons: null,
        episodes: null,
      };
    } else {
      // Get TV show details and credits separately
      const [tvShow, credits] = await Promise.all([
        tmdb.tvShows.details(args.tmdbId, ["external_ids"]),
        tmdb.tvShows.credits(args.tmdbId),
      ]);

      console.log("TV Show credits data:", {
        crewCount: credits.crew?.length || 0,
        directorCount:
          credits.crew?.filter((c) => c.job === "Director").length || 0,
        directors:
          credits.crew
            ?.filter((c) => c.job === "Director")
            .map((c) => ({ name: c.name, job: c.job })) || [],
      });

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
