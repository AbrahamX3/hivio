"use server";

import { revalidatePath } from "next/cache";
import e from "@edgedb/edgeql-js";

import { auth, db } from "@/lib/edgedb";
import { action, authAction } from "@/lib/safe-action";

import { FollowSchema, TotalFollowersSchema } from "./validation";

export const followUser = authAction(
  FollowSchema,
  async ({ username, total }) => {
    const client = auth.getSession().client;

    const isFollowing = await e
      .select(e.Follower, (follower) => ({
        id: true,
        follower: {
          username: true,
        },
        filter_single: e.op(
          e.op(follower.follower.id, "=", e.global.CurrentUser.id),
          "and",
          e.op(follower.followed.username, "=", username),
        ),
      }))
      .run(client);

    if (isFollowing?.follower.username === username) {
      return { following: false, totalFollowers: total };
    }

    if (isFollowing?.id) {
      await e
        .delete(e.Follower, (follower) => ({
          filter_single: e.op(follower.id, "=", e.uuid(isFollowing.id)),
        }))
        .run(client);
      revalidatePath(`/profile/${username}`);
      return { following: false, totalFollowers: total - 1 };
    } else if (!isFollowing?.id) {
      const user = e.select(e.User, (user) => ({
        filter_single: e.op(user.username, "=", e.str(username)),
      }));

      await e
        .insert(e.Follower, {
          follower: e.global.CurrentUser,
          followed: user,
        })
        .run(client);

      revalidatePath(`/profile/${username}`);
      return { following: true, totalFollowers: total + 1 };
    }

    return { following: false, totalFollowers: total };
  },
);

export const totalFollowers = action(
  TotalFollowersSchema,
  async ({ username }) => {
    const followers = await e
      .select(e.Follower, (follower) => ({
        id: true,
        filter: e.op(follower.followed.username, "=", e.str(username)),
      }))
      .run(db);

    const total = followers.length;

    return total;
  },
);

export const isFollowingUser = authAction(
  TotalFollowersSchema,
  async ({ username }) => {
    const client = auth.getSession().client;
    const isFollowing = await e
      .select(e.Follower, (follower) => ({
        id: true,
        follower: {
          username: true,
        },
        filter_single: e.op(
          e.op(follower.follower.id, "=", e.global.CurrentUser.id),
          "and",
          e.op(follower.followed.username, "=", username),
        ),
      }))
      .run(client);

    return isFollowing?.id ? true : false;
  },
);

export interface UserFollower {
  avatar: string | null;
  username: string | null;
  name: string;
}

export const getFollowers = action(FollowSchema, async ({ username }) => {
  const client = auth.getSession().client;
  const result = await e
    .select(e.Follower, (follower) => ({
      follower: {
        username: true,
        name: true,
        avatar: true,
      },
      filter: e.op(follower.followed.username, "=", e.str(username)),
    }))
    .run(client);

  const followers = result.map((follower) => ({
    avatar: follower.follower.avatar,
    username: follower.follower.username,
    name: follower.follower.name,
  }));

  return { followers };
});
