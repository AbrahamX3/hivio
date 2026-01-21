"use node";

import { v } from "convex/values";
import { TMDB } from "tmdb-ts";

import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import { data } from "./data";

const tmdb = new TMDB(process.env.TMDB_API_KEY!);

type HistoryRow = {
  status: string;
  is_favourite: number;
  created_at: number;
  updated_at: number;
  titleName: string;
  poster_url: string;
  backdrop_url: string;
  description: string;
  imdb_id: string;
  tmdb_id: number;
  media_type: "MOVIE" | "SERIES";
  release_date: string;
  genres: number[];
};

function extractTmdbPath(url: string): string | undefined {
  if (!url) return undefined;
  // Extract path from TMDB URL like https://image.tmdb.org/t/p/w500/path.jpg
  const match = url.match(/\/t\/p\/[^/]+\/(.+)$/);
  return match ? `/${match[1]}` : undefined;
}

async function fetchTitleData(
  tmdbId: number,
  mediaType: "MOVIE" | "SERIES"
): Promise<{
  name: string;
  posterUrl?: string;
  backdropUrl?: string;
  description?: string;
  directors: string[];
  imdbId: string;
  releaseDate: string;
  genres: string;
}> {
  if (mediaType === "MOVIE") {
    const [movie, credits] = await Promise.all([
      tmdb.movies.details(tmdbId, ["external_ids"]),
      tmdb.movies.credits(tmdbId),
    ]);

    const directors =
      credits.crew?.filter((c) => c.job === "Director")?.map((c) => c.name) ||
      [];

    return {
      name: movie.title,
      posterUrl: movie.poster_path || undefined,
      backdropUrl: movie.backdrop_path || undefined,
      description: movie.overview || undefined,
      directors,
      imdbId: movie.external_ids?.imdb_id || "",
      releaseDate: movie.release_date || "",
      genres: JSON.stringify(movie.genres?.map((g) => g.id) || []),
    };
  } else {
    const tvShow = await tmdb.tvShows.details(tmdbId, ["external_ids"]);

    const directors = tvShow.created_by?.map((c) => c.name) || [];

    return {
      name: tvShow.name,
      posterUrl: tvShow.poster_path || undefined,
      backdropUrl: tvShow.backdrop_path || undefined,
      description: tvShow.overview || undefined,
      directors,
      imdbId: tvShow.external_ids?.imdb_id || "",
      releaseDate: tvShow.first_air_date || "",
      genres: JSON.stringify(tvShow.genres?.map((g) => g.id) || []),
    };
  }
}

export const seedHistory = action({
  args: {
    userId: v.id("users"),
    updateExisting: v.optional(v.boolean()),
  },
  returns: v.object({
    titlesCreated: v.number(),
    titlesUpdated: v.number(),
    historyCreated: v.number(),
    historyUpdated: v.number(),
    errors: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    // Use the imported data directly
    const rows: HistoryRow[] = data;
    console.log(`Processing ${rows.length} rows from data`);

    let titlesCreated = 0;
    let titlesUpdated = 0;
    let historyCreated = 0;
    let historyUpdated = 0;
    const errors: string[] = [];

    // Verify user exists
    const user = await ctx.runQuery(internal.seedInternal.getUser, {
      userId: args.userId,
    });
    if (!user) {
      throw new Error(`User with id ${args.userId} not found`);
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const tmdbId = row.tmdb_id;
        if (typeof tmdbId !== "number" || isNaN(tmdbId)) {
          errors.push(`Row ${i + 1}: Invalid tmdb_id: ${row.tmdb_id}`);
          continue;
        }

        const mediaType =
          row.media_type === "MOVIE" || row.media_type === "SERIES"
            ? row.media_type
            : null;
        if (!mediaType) {
          errors.push(`Row ${i + 1}: Invalid media_type: ${row.media_type}`);
          continue;
        }

        // Check if title exists
        const existingTitle = await ctx.runQuery(
          internal.seedInternal.getTitle,
          {
            tmdbId,
            mediaType,
          }
        );

        let titleId;
        if (existingTitle) {
          // Fetch updated data from TMDB and update title
          const updatedData = await fetchTitleData(tmdbId, mediaType);
          await ctx.runMutation(internal.seedInternal.updateTitle, {
            titleId: existingTitle._id,
            ...updatedData,
          });
          titleId = existingTitle._id;
          titlesUpdated++;
        } else {
          // Fetch latest data from TMDB (may have updates)
          // Extract paths from CSV URLs as fallback
          const posterPath = extractTmdbPath(row.poster_url);
          const backdropPath = extractTmdbPath(row.backdrop_url);

          let tmdbData;
          try {
            tmdbData = await fetchTitleData(tmdbId, mediaType);
          } catch (error) {
            // If TMDB fetch fails, use JSON data
            console.warn(
              `Failed to fetch TMDB data for ${tmdbId}, using JSON data: ${error}`
            );
            tmdbData = {
              name: row.titleName,
              posterUrl: posterPath,
              backdropUrl: backdropPath,
              description: row.description || undefined,
              directors: [],
              imdbId: row.imdb_id || "",
              releaseDate: row.release_date || "",
              genres: JSON.stringify(row.genres || []),
            };
          }

          titleId = await ctx.runMutation(internal.seedInternal.createTitle, {
            name: tmdbData.name || row.titleName,
            posterUrl: tmdbData.posterUrl || posterPath,
            backdropUrl: tmdbData.backdropUrl || backdropPath,
            description: tmdbData.description || row.description || undefined,
            directors: tmdbData.directors,
            tmdbId,
            mediaType,
            imdbId: tmdbData.imdbId || row.imdb_id || "",
            releaseDate: tmdbData.releaseDate || row.release_date || "",
            genres: tmdbData.genres || JSON.stringify(row.genres || []),
          });
          titlesCreated++;
        }

        // Parse timestamps (already numbers in JSON)
        const createdAt = row.created_at;
        const updatedAt = row.updated_at;
        if (typeof createdAt !== "number" || typeof updatedAt !== "number") {
          errors.push(
            `Row ${i + 1}: Invalid timestamps (created_at: ${row.created_at}, updated_at: ${row.updated_at})`
          );
          continue;
        }

        // Parse status
        const validStatuses = [
          "FINISHED",
          "WATCHING",
          "PLANNED",
          "ON_HOLD",
          "DROPPED",
          "REWATCHING",
        ] as const;

        if (
          !validStatuses.includes(row.status as (typeof validStatuses)[number])
        ) {
          errors.push(`Row ${i + 1}: Invalid status: ${row.status}`);
          continue;
        }

        const status = row.status as (typeof validStatuses)[number];

        // Parse isFavourite (already a number in JSON: 0 or 1)
        const isFavourite = row.is_favourite === 1;

        // Check if history exists
        const existingHistory = await ctx.runQuery(
          internal.seedInternal.getHistory,
          {
            userId: args.userId,
            titleId,
          }
        );

        if (existingHistory) {
          if (args.updateExisting) {
            await ctx.runMutation(internal.seedInternal.updateHistory, {
              historyId: existingHistory._id,
              status,
              isFavourite,
              createdAt,
              updatedAt,
            });
            historyUpdated++;
          }
        } else {
          await ctx.runMutation(internal.seedInternal.createHistory, {
            userId: args.userId,
            titleId,
            status,
            isFavourite,
            createdAt,
            updatedAt,
          });
          historyCreated++;
        }

        // Add a small delay to avoid rate limiting
        if (i % 10 === 0 && i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        const errorMsg = `Row ${i + 1}: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    return {
      titlesCreated,
      titlesUpdated,
      historyCreated,
      historyUpdated,
      errors,
    };
  },
});
