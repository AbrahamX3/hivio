import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    defaultStatus: v.optional(
      v.union(
        v.literal("FINISHED"),
        v.literal("WATCHING"),
        v.literal("PLANNED"),
        v.literal("ON_HOLD"),
        v.literal("DROPPED"),
        v.literal("REWATCHING"),
      ),
    ),
  }),
  title: defineTable({
    id: v.string(),
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
  })
    .index("by_tmdb_id", ["tmdbId"])
    .index("by_imdb_id", ["imdbId"])
    .index("by_tmdb_id_media_type", ["tmdbId", "mediaType"]),
  history: defineTable({
    id: v.string(),
    titleId: v.string(),
    userId: v.string(),
    status: v.union(
      v.literal("FINISHED"),
      v.literal("WATCHING"),
      v.literal("PLANNED"),
      v.literal("ON_HOLD"),
      v.literal("DROPPED"),
      v.literal("REWATCHING"),
    ),
    currentEpisode: v.optional(v.number()),
    currentSeason: v.optional(v.number()),
    currentRuntime: v.optional(v.number()),
    isFavourite: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_title_id", ["titleId"])
    .index("by_user_id_title_id", ["userId", "titleId"])
    .index("by_status", ["status"])
    .index("by_is_favourite", ["isFavourite"]),
});
