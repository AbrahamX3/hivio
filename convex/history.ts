import { v } from "convex/values";
import { TMDB } from "tmdb-ts";

import { api, internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { action, internalQuery, mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

type HistoryWithTitle = Doc<"history"> & { title: Doc<"title"> | null };
type HistoryWithRequiredTitle = Doc<"history"> & { title: Doc<"title"> };

type Filter = {
  id: string;
  value: string | string[];
  operator: string;
};

type Sort = {
  id: string;
  desc: boolean;
};

export type UserRecord = {
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
};

const historyStatusValidator = v.union(
  v.literal("FINISHED"),
  v.literal("WATCHING"),
  v.literal("PLANNED"),
  v.literal("ON_HOLD"),
  v.literal("DROPPED"),
  v.literal("REWATCHING")
);

const mediaTypeValidator = v.union(v.literal("MOVIE"), v.literal("SERIES"));

async function attachTitles(
  ctx: {
    db: {
      get: (table: "title", id: Id<"title">) => Promise<Doc<"title"> | null>;
    };
  },
  historyItems: Doc<"history">[]
): Promise<HistoryWithTitle[]> {
  const uniqueTitleIds = Array.from(
    new Set(historyItems.map((item) => item.titleId))
  );

  const titles = await Promise.all(
    uniqueTitleIds.map(async (titleId) => {
      const title = await ctx.db.get("title", titleId);
      return [titleId, title] as const;
    })
  );

  const titleById = new Map<Id<"title">, Doc<"title"> | null>(titles);

  return historyItems.map((item) => ({
    ...item,
    title: titleById.get(item.titleId) ?? null,
  }));
}

function applyFilters(
  items: HistoryWithTitle[],
  filters: Filter[]
): HistoryWithTitle[] {
  if (filters.length === 0) {
    return items;
  }

  let filtered = items;

  for (const filter of filters) {
    if (filter.id === "title" && typeof filter.value === "string") {
      const searchValue = filter.value.toLowerCase();
      filtered = filtered.filter((item) =>
        item.title?.name?.toLowerCase().includes(searchValue)
      );
    } else if (filter.id === "status" && Array.isArray(filter.value)) {
      const statusValues = filter.value as string[];
      filtered = filtered.filter((item) => statusValues.includes(item.status));
    } else if (filter.id === "type" && Array.isArray(filter.value)) {
      const typeValues = filter.value as string[];
      filtered = filtered.filter(
        (item) =>
          item.title?.mediaType && typeValues.includes(item.title.mediaType)
      );
    } else if (filter.id === "isFavourite" && Array.isArray(filter.value)) {
      const favouriteValues = filter.value as string[];
      filtered = filtered.filter((item) => {
        const isFavourite = item.isFavourite ? "true" : "false";
        return favouriteValues.includes(isFavourite);
      });
    } else if (filter.id === "genre" && Array.isArray(filter.value)) {
      const genreIds = filter.value.map((v) => Number(v));
      filtered = filtered.filter((item) => {
        if (!item.title?.genres) return false;
        try {
          const itemGenres = JSON.parse(item.title.genres) as number[];
          return genreIds.some((genreId) => itemGenres.includes(genreId));
        } catch {
          return false;
        }
      });
    }
  }

  return filtered;
}

function applySorting(
  items: HistoryWithTitle[],
  sort: Sort[]
): HistoryWithTitle[] {
  const sorted = [...items];
  const hasStatusSort = sort.some((s) => s.id === "status");
  const statusOrder: Record<string, number> = {
    WATCHING: 0,
    REWATCHING: 1,
    PLANNED: 2,
    ON_HOLD: 3,
    FINISHED: 4,
    DROPPED: 5,
  };

  sorted.sort((a, b) => {
    if (!hasStatusSort && sort.length === 0) {
      const aStatusOrder = statusOrder[a.status] ?? 999;
      const bStatusOrder = statusOrder[b.status] ?? 999;

      if (aStatusOrder !== bStatusOrder) {
        return aStatusOrder - bStatusOrder;
      }

      const aDate = a.title?.releaseDate
        ? new Date(a.title.releaseDate).getTime()
        : 0;
      const bDate = b.title?.releaseDate
        ? new Date(b.title.releaseDate).getTime()
        : 0;

      if (aDate !== bDate) {
        return bDate - aDate;
      }
    }

    if (sort.length > 0) {
      for (const sortItem of sort) {
        const aValue = getSortValue(a, sortItem.id);
        const bValue = getSortValue(b, sortItem.id);

        if (aValue !== bValue) {
          return aValue < bValue
            ? sortItem.desc
              ? 1
              : -1
            : sortItem.desc
              ? -1
              : 1;
        }
      }
    }

    return 0;
  });

  return sorted;
}

function getSortValue(item: HistoryWithTitle, sortId: string): string | number {
  if (sortId === "title") {
    return item.title?.name || "";
  }
  if (sortId === "type") {
    return item.title?.mediaType || "";
  }
  if (sortId === "status") {
    const statusOrder: Record<string, number> = {
      WATCHING: 0,
      REWATCHING: 1,
      PLANNED: 2,
      ON_HOLD: 3,
      FINISHED: 4,
      DROPPED: 5,
    };
    return statusOrder[item.status] ?? 999;
  }
  if (sortId === "releaseDate" || sortId === "Release Date") {
    return item.title?.releaseDate
      ? new Date(item.title.releaseDate).getTime()
      : 0;
  }
  return 0;
}

async function getAuthenticatedUserId(ctx: unknown): Promise<Id<"users">> {
  const authCtx = ctx as {
    db: {
      query: (table: "users") => {
        withIndex: (
          index: "by_auth_id",
          cb: (q: {
            eq: (field: "authId", value: string) => unknown;
          }) => unknown
        ) => { first: () => Promise<UserRecord | null> };
      };
    };
  };

  const authUser = await authComponent.safeGetAuthUser(authCtx as never);
  if (!authUser) {
    throw new Error("Not authenticated");
  }

  const user = await authCtx.db
    .query("users")
    .withIndex("by_auth_id", (q) => q.eq("authId", authUser._id))
    .first();

  if (!user) {
    throw new Error("User record not found");
  }

  return (user as UserRecord)._id;
}

export const getDashboardData = query({
  args: {
    _refresh: v.optional(v.string()),
  },
  returns: v.object({
    stats: v.object({
      total: v.number(),
      watching: v.number(),
      finished: v.number(),
      planned: v.number(),
      favourites: v.number(),
      progressValue: v.number(),
    }),
    watchingItems: v.array(
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
          mediaType: v.union(v.literal("MOVIE"), v.literal("SERIES")),
          releaseDate: v.string(),
          genres: v.string(),
          createdAt: v.number(),
          updatedAt: v.number(),
        }),
      })
    ),
  }),
  handler: async (ctx) => {
    const currentUser: UserRecord | null = await ctx.runQuery(
      internal.auth.getCurrentUserRecord
    );
    if (!currentUser) {
      return {
        stats: {
          total: 0,
          watching: 0,
          finished: 0,
          planned: 0,
          favourites: 0,
          progressValue: 0,
        },
        watchingItems: [],
      };
    }

    const userId: Id<"users"> = currentUser._id;

    const [
      watchingItems,
      finishedItems,
      plannedItems,
      onHoldItems,
      droppedItems,
      rewatchingItems,
    ] = await Promise.all([
      ctx.db
        .query("history")
        .withIndex("by_user_id_and_status", (q) =>
          q.eq("userId", userId).eq("status", "WATCHING")
        )
        .collect(),
      ctx.db
        .query("history")
        .withIndex("by_user_id_and_status", (q) =>
          q.eq("userId", userId).eq("status", "FINISHED")
        )
        .collect(),
      ctx.db
        .query("history")
        .withIndex("by_user_id_and_status", (q) =>
          q.eq("userId", userId).eq("status", "PLANNED")
        )
        .collect(),
      ctx.db
        .query("history")
        .withIndex("by_user_id_and_status", (q) =>
          q.eq("userId", userId).eq("status", "ON_HOLD")
        )
        .collect(),
      ctx.db
        .query("history")
        .withIndex("by_user_id_and_status", (q) =>
          q.eq("userId", userId).eq("status", "DROPPED")
        )
        .collect(),
      ctx.db
        .query("history")
        .withIndex("by_user_id_and_status", (q) =>
          q.eq("userId", userId).eq("status", "REWATCHING")
        )
        .collect(),
    ]);

    const watching = watchingItems.length;
    const finished = finishedItems.length;
    const planned = plannedItems.length;
    const total =
      watching +
      finished +
      planned +
      onHoldItems.length +
      droppedItems.length +
      rewatchingItems.length;
    const favourites =
      watchingItems.filter((item) => item.isFavourite).length +
      finishedItems.filter((item) => item.isFavourite).length +
      plannedItems.filter((item) => item.isFavourite).length +
      onHoldItems.filter((item) => item.isFavourite).length +
      droppedItems.filter((item) => item.isFavourite).length +
      rewatchingItems.filter((item) => item.isFavourite).length;
    const progressValue = total > 0 ? Math.round((finished / total) * 100) : 0;

    const watchingWithTitles: HistoryWithTitle[] = await attachTitles(
      ctx,
      watchingItems
    );

    const watchingItemsResult = watchingWithTitles.filter(
      (item): item is HistoryWithRequiredTitle => item.title !== null
    );

    return {
      stats: {
        total,
        watching,
        finished,
        planned,
        favourites,
        progressValue,
      },
      watchingItems: watchingItemsResult,
    };
  },
});

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
    page: v.optional(v.number()),
    perPage: v.optional(v.number()),
    _refresh: v.optional(v.string()),
  },
  returns: v.object({
    data: v.array(
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
        title: v.union(
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
      })
    ),
    total: v.number(),
  }),
  handler: async (ctx, args) => {
    const currentUser: UserRecord | null = await ctx.runQuery(
      internal.auth.getCurrentUserRecord
    );
    if (!currentUser) {
      return { data: [], total: 0 };
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

    let historyWithTitles: HistoryWithTitle[] = await attachTitles(
      ctx,
      historyItems
    );

    if (args.filters && args.filters.length > 0) {
      historyWithTitles = applyFilters(historyWithTitles, args.filters);
    }

    historyWithTitles = applySorting(historyWithTitles, args.sort || []);

    const total = historyWithTitles.length;
    const page = args.page ?? 1;
    const perPage = args.perPage ?? 10;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedData = historyWithTitles.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total,
    };
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
    const dbUserId = await getAuthenticatedUserId(ctx);

    const historyItem = await ctx.db.get("history", args.id);
    if (!historyItem) {
      throw new Error("History item not found");
    }

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

    const updatedHistory = await ctx.db.get("history", args.id);
    if (!updatedHistory) {
      throw new Error("History item not found after update");
    }
    return updatedHistory;
  },
});

export const remove = mutation({
  args: {
    id: v.id("history"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const dbUserId = await getAuthenticatedUserId(ctx);

    const historyItem = await ctx.db.get("history", args.id);
    if (!historyItem) {
      throw new Error("History item not found");
    }

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
    const dbUserId = await getAuthenticatedUserId(ctx);

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
      const updatedHistory = await ctx.db.get("history", existingHistory._id);
      if (!updatedHistory) {
        throw new Error("History item not found after update");
      }
      return {
        ...updatedHistory,
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

    const newHistory = await ctx.db.get("history", historyId);
    if (!newHistory) {
      throw new Error("Failed to create history item");
    }
    return {
      ...newHistory,
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

export const add = action({
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
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error("TMDB_API_KEY environment variable is not set");
    }
    const tmdb = new TMDB(apiKey);

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

export const getUserWatchedTmdbIds = internalQuery({
  args: {
    authId: v.string(),
  },
  returns: v.array(v.number()),
  handler: async (ctx, args): Promise<number[]> => {
    const userRecord = await ctx.runQuery(
      internal.auth.getCurrentUserRecordByAuthId,
      { authId: args.authId }
    );

    if (!userRecord) {
      return [];
    }

    const historyItems = await ctx.db
      .query("history")
      .withIndex("by_user_id", (q) => q.eq("userId", userRecord._id))
      .collect();

    const uniqueTitleIds = Array.from(
      new Set(historyItems.map((item) => item.titleId))
    );

    const titles = await Promise.all(
      uniqueTitleIds.map(async (titleId) => {
        const title = await ctx.db.get("title", titleId);
        return title?.tmdbId;
      })
    );

    return titles.filter((tmdbId): tmdbId is number => tmdbId !== undefined);
  },
});

export const getHistoryItems = internalQuery({
  args: {
    authId: v.string(),
  },
  returns: v.array(
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
      title: v.union(
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
    })
  ),
  handler: async (ctx, args): Promise<HistoryWithTitle[]> => {
    const userRecord = await ctx.runQuery(
      internal.auth.getCurrentUserRecordByAuthId,
      { authId: args.authId }
    );

    if (!userRecord) {
      return [];
    }

    const query = ctx.db
      .query("history")
      .withIndex("by_user_id", (q) => q.eq("userId", userRecord._id));

    const historyItems = await query.collect();

    const historyWithTitles: HistoryWithTitle[] = await attachTitles(
      ctx,
      historyItems
    );

    return historyWithTitles;
  },
});
