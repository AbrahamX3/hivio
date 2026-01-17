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
import { internalQuery, query } from "./_generated/server";
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
});

export const getCurrentUser = query({
  args: {},
  returns: v.union(v.null(), authUserValidator),
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      return null;
    }
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      image: user.image,
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
