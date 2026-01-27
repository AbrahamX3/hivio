import {
  AuthFunctions,
  createClient,
  type GenericCtx,
} from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth/minimal";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import { DataModel, Id } from "./_generated/dataModel";
import { internalQuery, mutation, query } from "./_generated/server";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL!;

const authFunctions: AuthFunctions = internal.auth;

export const authComponent = createClient<DataModel>(components.betterAuth, {
  triggers: {
    user: {
      onCreate: async (ctx, user) => {
        await ctx.db.insert("users", {
          email: user.email,
          authId: user._id,
          defaultStatus: "WATCHING",
          createdAt: Date.now(),
        });
      },
      onUpdate: async (ctx, user, oldUser) => {
        await ctx.db.patch("users", oldUser._id as Id<"users">, {
          email: user.email,
          updatedAt: Date.now(),
        });
      },
      onDelete: async (ctx, user) => {
        await ctx.db.delete("users", user._id as Id<"users">);
      },
    },
  },
  authFunctions,
});

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    secret: process.env.BETTER_AUTH_SECRET!,
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minutes
      },
    },
    socialProviders: {
      discord: {
        clientId: process.env.DISCORD_CLIENT_ID!,
        clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      },
    },
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: false,
    },
    plugins: [convex({ authConfig })],
  });
};

const authUserValidator = v.object({
  _id: v.string(),
  email: v.string(),
  name: v.string(),
  image: v.optional(v.union(v.string(), v.null())),
  imageStorageId: v.optional(v.id("_storage")),
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
});

export const getCurrentUser = query({
  args: {},
  returns: v.union(v.null(), authUserValidator),
  handler: async (ctx) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      return null;
    }

    const userRecord = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", authUser._id))
      .first();

    let image: string | null | undefined = authUser.image;
    let imageStorageId: Id<"_storage"> | undefined = undefined;

    if (
      typeof image === "string" &&
      !image.startsWith("http://") &&
      !image.startsWith("https://") &&
      !image.startsWith("data:")
    ) {
      imageStorageId = image as Id<"_storage">;
      const url = await ctx.storage.getUrl(imageStorageId);
      if (url) {
        image = url;
      } else {
        imageStorageId = undefined;
      }
    }

    return {
      _id: authUser._id,
      email: authUser.email,
      name: authUser.name,
      image,
      imageStorageId,
      defaultStatus: userRecord?.defaultStatus,
    };
  },
});

export const getCurrentUserRecord = internalQuery({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      email: v.string(),
      name: v.optional(v.string()),
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
    })
  ),
  handler: async (ctx) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", authUser._id))
      .first();

    if (!user) {
      return null;
    }

    return user;
  },
});

export const getCurrentUserRecordByAuthId = internalQuery({
  args: {
    authId: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      email: v.string(),
      name: v.optional(v.string()),
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
    })
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", args.authId))
      .first();

    if (!user) {
      return null;
    }

    return user;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateDefaultStatus = mutation({
  args: {
    defaultStatus: v.union(
      v.literal("FINISHED"),
      v.literal("WATCHING"),
      v.literal("PLANNED"),
      v.literal("ON_HOLD"),
      v.literal("DROPPED"),
      v.literal("REWATCHING")
    ),
  },
  handler: async (ctx, { defaultStatus }) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const userRecord = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", authUser._id))
      .first();

    if (!userRecord) {
      throw new Error("User record not found");
    }

    await ctx.db.patch(userRecord._id, {
      defaultStatus,
      updatedAt: Date.now(),
    });
  },
});

export const getStorageUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

export const updateAuthProfile = mutation({
  args: {
    name: v.optional(v.string()),
    image: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, { name, image }) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const oldImage = authUser.image;
    if (
      typeof oldImage === "string" &&
      !oldImage.startsWith("http://") &&
      !oldImage.startsWith("https://") &&
      !oldImage.startsWith("data:") &&
      typeof image === "string" &&
      !image.startsWith("http://") &&
      !image.startsWith("https://") &&
      !image.startsWith("data:") &&
      image !== oldImage
    ) {
      try {
        await ctx.storage.delete(oldImage as Id<"_storage">);
      } catch (error) {
        console.error("Failed to delete old image", error);
      }
    }

    await ctx.runMutation(components.betterAuth.adapter.updateOne, {
      input: {
        model: "user",
        update: {
          ...(name !== undefined ? { name } : {}),
          ...(image !== undefined ? { image } : {}),
          updatedAt: Date.now(),
        },
        where: [
          {
            field: "_id",
            operator: "eq",
            value: authUser._id,
          },
        ],
      },
    });
  },
});

export const deleteStorageFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");
    await ctx.storage.delete(storageId);
  },
});
