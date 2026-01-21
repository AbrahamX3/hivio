import { v } from "convex/values";

import { internalMutation, internalQuery } from "./_generated/server";

// Internal queries and mutations for seed operations
export const getUser = internalQuery({
  args: {
    userId: v.id("users"),
  },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      email: v.string(),
      defaultStatus: v.optional(
        v.union(
          v.literal("FINISHED"),
          v.literal("WATCHING"),
          v.literal("PLANNED"),
          v.literal("ON_HOLD"),
          v.literal("DROPPED"),
          v.literal("REWATCHING")
        )
      ),
      authId: v.string(),
      createdAt: v.number(),
      updatedAt: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getTitle = internalQuery({
  args: {
    tmdbId: v.number(),
    mediaType: v.union(v.literal("MOVIE"), v.literal("SERIES")),
  },
  returns: v.union(
    v.object({
      _id: v.id("title"),
      _creationTime: v.number(),
      name: v.string(),
      posterUrl: v.optional(v.string()),
      backdropUrl: v.optional(v.string()),
      description: v.optional(v.string()),
      directors: v.optional(v.array(v.string())),
      tmdbId: v.number(),
      imdbId: v.string(),
      mediaType: v.union(v.literal("MOVIE"), v.literal("SERIES")),
      releaseDate: v.string(),
      genres: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("title")
      .withIndex("by_tmdb_id_media_type", (q) =>
        q.eq("tmdbId", args.tmdbId).eq("mediaType", args.mediaType)
      )
      .first();
  },
});

export const createTitle = internalMutation({
  args: {
    name: v.string(),
    posterUrl: v.optional(v.string()),
    backdropUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    directors: v.array(v.string()),
    tmdbId: v.number(),
    mediaType: v.union(v.literal("MOVIE"), v.literal("SERIES")),
    imdbId: v.string(),
    releaseDate: v.string(),
    genres: v.string(),
  },
  returns: v.id("title"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("title", {
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
  },
});

export const updateTitle = internalMutation({
  args: {
    titleId: v.id("title"),
    name: v.string(),
    posterUrl: v.optional(v.string()),
    backdropUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    directors: v.array(v.string()),
    imdbId: v.string(),
    releaseDate: v.string(),
    genres: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { titleId, ...updates } = args;
    await ctx.db.patch(titleId, {
      ...updates,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const getHistory = internalQuery({
  args: {
    userId: v.id("users"),
    titleId: v.id("title"),
  },
  returns: v.union(
    v.object({
      _id: v.id("history"),
      _creationTime: v.number(),
      titleId: v.id("title"),
      userId: v.id("users"),
      status: v.union(
        v.literal("FINISHED"),
        v.literal("WATCHING"),
        v.literal("PLANNED"),
        v.literal("ON_HOLD"),
        v.literal("DROPPED"),
        v.literal("REWATCHING")
      ),
      currentEpisode: v.optional(v.number()),
      currentSeason: v.optional(v.number()),
      currentRuntime: v.optional(v.number()),
      isFavourite: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("history")
      .withIndex("by_user_id_title_id", (q) =>
        q.eq("userId", args.userId).eq("titleId", args.titleId)
      )
      .first();
  },
});

export const createHistory = internalMutation({
  args: {
    userId: v.id("users"),
    titleId: v.id("title"),
    status: v.union(
      v.literal("FINISHED"),
      v.literal("WATCHING"),
      v.literal("PLANNED"),
      v.literal("ON_HOLD"),
      v.literal("DROPPED"),
      v.literal("REWATCHING")
    ),
    isFavourite: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("history", {
      titleId: args.titleId,
      userId: args.userId,
      status: args.status,
      currentEpisode: undefined,
      currentSeason: undefined,
      currentRuntime: undefined,
      isFavourite: args.isFavourite,
      createdAt: args.createdAt,
      updatedAt: args.updatedAt,
    });
    return null;
  },
});

export const updateHistory = internalMutation({
  args: {
    historyId: v.id("history"),
    status: v.union(
      v.literal("FINISHED"),
      v.literal("WATCHING"),
      v.literal("PLANNED"),
      v.literal("ON_HOLD"),
      v.literal("DROPPED"),
      v.literal("REWATCHING")
    ),
    isFavourite: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { historyId, ...updates } = args;
    await ctx.db.patch(historyId, updates);
    return null;
  },
});
