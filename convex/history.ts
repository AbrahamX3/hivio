import { v } from "convex/values";
import { TMDB } from "tmdb-ts";

import { api, internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { action, mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

type HistoryWithTitle = Doc<"history"> & { title: Doc<"title"> | null };
type HistoryWithRequiredTitle = Doc<"history"> & { title: Doc<"title"> };

const historyStatusValidator = v.union(
  v.literal("FINISHED"),
  v.literal("WATCHING"),
  v.literal("PLANNED"),
  v.literal("ON_HOLD"),
  v.literal("DROPPED"),
  v.literal("REWATCHING")
);

const mediaTypeValidator = v.union(v.literal("MOVIE"), v.literal("SERIES"));

export const getAll = query({
  args: {
    filters: v.optional(
      v.array(
        v.object({
          id: v.string(),
          value: v.union(v.string(), v.array(v.string())),
          operator: v.string(),
        })
      )
    ),
    sort: v.optional(
      v.array(
        v.object({
          id: v.string(),
          desc: v.boolean(),
        })
      )
    ),
    _refresh: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<HistoryWithTitle[]> => {
    const currentUser: {
      _id: Id<"users">;
      _creationTime: number;
      email: string;
      name?: string | undefined;
      defaultStatus?:
        | "FINISHED"
        | "WATCHING"
        | "PLANNED"
        | "ON_HOLD"
        | "DROPPED"
        | "REWATCHING"
        | undefined;
      authId: string;
      createdAt: number;
      updatedAt?: number | undefined;
    } | null = await ctx.runQuery(internal.auth.getCurrentUserRecord);
    if (!currentUser) {
      return [];
    }

    const userId: Id<"users"> = currentUser._id;
    let sortDirection: "asc" | "desc" = "desc";

    if (args.sort && args.sort.length > 0) {
      for (const sortItem of args.sort) {
        if (sortItem.id === "status") {
          sortDirection = sortItem.desc ? "desc" : "asc";
          break;
        }
      }
    }

    const query = ctx.db
      .query("history")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .order(sortDirection);

    const historyItems = await query.collect();

    let historyWithTitles: HistoryWithTitle[] = await Promise.all(
      historyItems.map(async (item) => {
        const title = await ctx.db.get("title", item.titleId);
        return {
          ...item,
          title: title || null,
        };
      })
    );

    if (args.filters && args.filters.length > 0) {
      for (const filter of args.filters) {
        if (filter.id === "title" && typeof filter.value === "string") {
          const searchValue = filter.value as string;
          historyWithTitles = historyWithTitles.filter((item) =>
            item.title?.name?.toLowerCase().includes(searchValue.toLowerCase())
          );
        } else if (filter.id === "status" && Array.isArray(filter.value)) {
          historyWithTitles = historyWithTitles.filter((item) =>
            (filter.value as string[]).includes(item.status)
          );
        } else if (filter.id === "type" && Array.isArray(filter.value)) {
          historyWithTitles = historyWithTitles.filter(
            (item) =>
              item.title?.mediaType &&
              (filter.value as string[]).includes(item.title.mediaType)
          );
        }
      }
    }

    if (args.sort && args.sort.length > 0) {
      const sortItem = args.sort[0];

      historyWithTitles.sort((a, b) => {
        const aValue = getSortValue(a, sortItem.id);
        const bValue = getSortValue(b, sortItem.id);

        if (aValue < bValue) return sortItem.desc ? 1 : -1;
        if (aValue > bValue) return sortItem.desc ? -1 : 1;
        return 0;
      });
    }

    return historyWithTitles;
  },
});

function getSortValue(item: HistoryWithTitle, sortId: string): string | number {
  if (sortId === "title") {
    return item.title?.name || "";
  } else if (sortId === "type") {
    return item.title?.mediaType || "";
  } else if (sortId === "status") {
    return item.status;
  } else if (sortId === "releaseDate") {
    return item.title?.releaseDate
      ? new Date(item.title.releaseDate).getFullYear()
      : 0;
  }
  return 0;
}

export const add = mutation({
  args: {
    titleId: v.id("title"),
    status: historyStatusValidator,
    currentEpisode: v.optional(v.number()),
    currentSeason: v.optional(v.number()),
    currentRuntime: v.optional(v.number()),
    isFavourite: v.optional(v.boolean()),
  },
  returns: v.object({
    _id: v.id("history"),
    _creationTime: v.number(),
    titleId: v.id("title"),
    userId: v.id("users"),
    status: historyStatusValidator,
    currentEpisode: v.optional(v.number()),
    currentSeason: v.optional(v.number()),
    currentRuntime: v.optional(v.number()),
    isFavourite: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  handler: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", authUser._id))
      .first();

    if (!user) {
      throw new Error("User record not found");
    }

    const dbUserId = user._id;
    const existingHistory = await ctx.db
      .query("history")
      .withIndex("by_user_id_title_id", (q) =>
        q.eq("userId", dbUserId).eq("titleId", args.titleId)
      )
      .first();

    const now = Date.now();

    if (existingHistory) {
      const updates: {
        status: typeof args.status;
        currentEpisode?: number;
        currentSeason?: number;
        currentRuntime?: number;
        isFavourite?: boolean;
        updatedAt: number;
      } = {
        status: args.status,
        updatedAt: now,
      };

      if (args.currentEpisode !== undefined)
        updates.currentEpisode = args.currentEpisode;
      if (args.currentSeason !== undefined)
        updates.currentSeason = args.currentSeason;
      if (args.currentRuntime !== undefined)
        updates.currentRuntime = args.currentRuntime;
      if (args.isFavourite !== undefined)
        updates.isFavourite = args.isFavourite;

      await ctx.db.patch(existingHistory._id, updates);

      const history = await ctx.db.get("history", existingHistory._id);
      if (!history) {
        throw new Error("History item not found after update");
      }
      return history;
    }

    const historyId = await ctx.db.insert("history", {
      titleId: args.titleId,
      userId: dbUserId,
      status: args.status,
      currentEpisode: args.currentEpisode,
      currentSeason: args.currentSeason,
      currentRuntime: args.currentRuntime,
      isFavourite: args.isFavourite ?? false,
      createdAt: now,
      updatedAt: now,
    });

    const history = await ctx.db.get("history", historyId);
    if (!history) {
      throw new Error("Failed to create history item");
    }
    return history;
  },
});

export const update = mutation({
  args: {
    id: v.id("history"),
    status: v.optional(historyStatusValidator),
    currentEpisode: v.optional(v.number()),
    currentSeason: v.optional(v.number()),
    currentRuntime: v.optional(v.number()),
    isFavourite: v.optional(v.boolean()),
  },
  returns: v.object({
    _id: v.id("history"),
    _creationTime: v.number(),
    titleId: v.id("title"),
    userId: v.id("users"),
    status: historyStatusValidator,
    currentEpisode: v.optional(v.number()),
    currentSeason: v.optional(v.number()),
    currentRuntime: v.optional(v.number()),
    isFavourite: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  handler: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const historyItem = await ctx.db.get("history", args.id);

    if (!historyItem) {
      throw new Error("History item not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", authUser._id))
      .first();

    if (!user) {
      throw new Error("User record not found");
    }

    const dbUserId = user._id;
    if (historyItem.userId !== dbUserId) {
      throw new Error("Unauthorized");
    }

    const updates: {
      status?: typeof args.status;
      currentEpisode?: number;
      currentSeason?: number;
      currentRuntime?: number;
      isFavourite?: boolean;
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };

    if (args.status !== undefined) updates.status = args.status;
    if (args.currentEpisode !== undefined)
      updates.currentEpisode = args.currentEpisode;
    if (args.currentSeason !== undefined)
      updates.currentSeason = args.currentSeason;
    if (args.currentRuntime !== undefined)
      updates.currentRuntime = args.currentRuntime;
    if (args.isFavourite !== undefined) updates.isFavourite = args.isFavourite;

    await ctx.db.patch(args.id, updates);

    const history = await ctx.db.get("history", args.id);
    if (!history) {
      throw new Error("History item not found after update");
    }
    return history;
  },
});

export const remove = mutation({
  args: {
    id: v.id("history"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const historyItem = await ctx.db.get("history", args.id);

    if (!historyItem) {
      throw new Error("History item not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", authUser._id))
      .first();

    if (!user) {
      throw new Error("User record not found");
    }

    const dbUserId = user._id;
    if (historyItem.userId !== dbUserId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
    return null;
  },
});

export const addFromTmdbInternal = mutation({
  args: {
    name: v.string(),
    posterUrl: v.optional(v.string()),
    backdropUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    tmdbId: v.number(),
    imdbId: v.string(),
    directors: v.array(v.string()),
    mediaType: mediaTypeValidator,
    releaseDate: v.string(),
    genres: v.string(),
    status: historyStatusValidator,
    currentEpisode: v.optional(v.number()),
    currentSeason: v.optional(v.number()),
    isFavourite: v.optional(v.boolean()),
  },
  returns: v.object({
    _id: v.id("history"),
    _creationTime: v.number(),
    titleId: v.id("title"),
    userId: v.id("users"),
    status: historyStatusValidator,
    currentEpisode: v.optional(v.number()),
    currentSeason: v.optional(v.number()),
    currentRuntime: v.optional(v.number()),
    isFavourite: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    title: v.object({
      _id: v.id("title"),
      _creationTime: v.number(),
      name: v.string(),
      posterUrl: v.optional(v.string()),
      backdropUrl: v.optional(v.string()),
      description: v.optional(v.string()),
      directors: v.optional(v.array(v.string())),
      tmdbId: v.number(),
      imdbId: v.string(),
      mediaType: mediaTypeValidator,
      releaseDate: v.string(),
      genres: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const existingTitle = await ctx.db
      .query("title")
      .withIndex("by_tmdb_id_media_type", (q) =>
        q.eq("tmdbId", args.tmdbId).eq("mediaType", args.mediaType)
      )
      .first();

    let title;
    if (existingTitle) {
      title = existingTitle;
    } else {
      const now = Date.now();
      const titleId = await ctx.db.insert("title", {
        name: args.name,
        posterUrl: args.posterUrl,
        backdropUrl: args.backdropUrl,
        description: args.description,
        directors: args.directors,
        tmdbId: args.tmdbId,
        imdbId: args.imdbId,
        mediaType: args.mediaType,
        releaseDate: args.releaseDate,
        genres: args.genres,
        createdAt: now,
        updatedAt: now,
      });
      title = await ctx.db.get("title", titleId);
    }

    if (!title) {
      throw new Error("Failed to create or get title");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", authUser._id))
      .first();

    if (!user) {
      throw new Error("User record not found");
    }

    const dbUserId = user._id;

    const existingHistory = await ctx.db
      .query("history")
      .withIndex("by_user_id_title_id", (q) =>
        q.eq("userId", dbUserId).eq("titleId", title!._id)
      )
      .first();

    const now = Date.now();

    if (existingHistory) {
      const updates: {
        status: typeof args.status;
        currentEpisode?: number;
        currentSeason?: number;
        isFavourite?: boolean;
        updatedAt: number;
      } = {
        status: args.status,
        updatedAt: now,
      };

      if (args.currentEpisode !== undefined)
        updates.currentEpisode = args.currentEpisode;
      if (args.currentSeason !== undefined)
        updates.currentSeason = args.currentSeason;
      if (args.isFavourite !== undefined)
        updates.isFavourite = args.isFavourite;

      await ctx.db.patch(existingHistory._id, updates);
      const updated = await ctx.db.get("history", existingHistory._id);
      return {
        ...updated!,
        title,
      };
    }

    const historyId = await ctx.db.insert("history", {
      titleId: title._id,
      userId: dbUserId,
      status: args.status,
      currentEpisode: args.currentEpisode,
      currentSeason: args.currentSeason,
      currentRuntime: undefined,
      isFavourite: args.isFavourite ?? false,
      createdAt: now,
      updatedAt: now,
    });

    const history = await ctx.db.get("history", historyId);
    if (!history) {
      throw new Error("Failed to create history item");
    }
    return {
      ...history,
      title,
    };
  },
});

const titleValidator = v.object({
  _id: v.id("title"),
  _creationTime: v.number(),
  name: v.string(),
  posterUrl: v.optional(v.string()),
  backdropUrl: v.optional(v.string()),
  description: v.optional(v.string()),
  directors: v.optional(v.array(v.string())),
  tmdbId: v.number(),
  imdbId: v.string(),
  mediaType: mediaTypeValidator,
  releaseDate: v.string(),
  genres: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

const addFromTmdbReturnValidator = v.object({
  _id: v.id("history"),
  _creationTime: v.number(),
  titleId: v.id("title"),
  userId: v.id("users"),
  status: historyStatusValidator,
  currentEpisode: v.optional(v.number()),
  currentSeason: v.optional(v.number()),
  currentRuntime: v.optional(v.number()),
  isFavourite: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
  title: titleValidator,
});

export const addFromTmdb = action({
  args: {
    tmdbId: v.number(),
    mediaType: mediaTypeValidator,
    status: historyStatusValidator,
    currentEpisode: v.optional(v.number()),
    currentSeason: v.optional(v.number()),
    isFavourite: v.optional(v.boolean()),
  },
  returns: addFromTmdbReturnValidator,
  handler: async (ctx, args): Promise<HistoryWithRequiredTitle> => {
    const tmdb = new TMDB(process.env.TMDB_API_KEY!);

    let titleData;
    if (args.mediaType === "MOVIE") {
      const [movie, credits] = await Promise.all([
        tmdb.movies.details(args.tmdbId, ["external_ids"]),
        tmdb.movies.credits(args.tmdbId),
      ]);

      const directors =
        credits.crew?.filter((c) => c.job === "Director")?.map((c) => c.name) ||
        [];

      titleData = {
        name: movie.title,
        posterUrl: movie.poster_path || undefined,
        backdropUrl: movie.backdrop_path || undefined,
        description: movie.overview || undefined,
        directors,
        tmdbId: args.tmdbId,
        imdbId: movie.external_ids?.imdb_id || "",
        mediaType: args.mediaType,
        releaseDate: movie.release_date || "",
        genres: JSON.stringify(movie.genres?.map((g) => g.id) || []),
      };
    } else {
      const tvShow = await tmdb.tvShows.details(args.tmdbId, ["external_ids"]);

      const directors = tvShow.created_by?.map((c) => c.name) || [];

      titleData = {
        name: tvShow.name,
        posterUrl: tvShow.poster_path || undefined,
        backdropUrl: tvShow.backdrop_path || undefined,
        description: tvShow.overview || undefined,
        directors,
        tmdbId: args.tmdbId,
        imdbId: tvShow.external_ids?.imdb_id || "",
        mediaType: args.mediaType,
        releaseDate: tvShow.first_air_date || "",
        genres: JSON.stringify(tvShow.genres?.map((g) => g.id) || []),
      };
    }

    return await ctx.runMutation(api.history.addFromTmdbInternal, {
      ...args,
      ...titleData,
    });
  },
});
