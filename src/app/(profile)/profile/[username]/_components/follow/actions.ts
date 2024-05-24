"use server";

import { revalidatePath } from "next/cache";
import e from "@edgedb/edgeql-js";

import { auth } from "@/lib/edgedb";
import { authAction } from "@/lib/safe-action";

import { FollowSchema } from "./validation";

export const followUser = authAction(
  FollowSchema,
  async ({ username, total }) => {
    const client = auth.getSession().client;

    const isFollowing = await e
      .select(e.Follow, (follower) => ({
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
        .delete(e.Follow, (follower) => ({
          filter_single: e.op(follower.id, "=", e.uuid(isFollowing.id)),
        }))
        .run(client);
      revalidatePath(`/profile/${username}`);
      revalidatePath("/discover");
      return { following: false, totalFollowers: total - 1 };
    } else if (!isFollowing?.id) {
      const user = e.select(e.User, (user) => ({
        filter_single: e.op(user.username, "=", e.str(username)),
      }));

      await e
        .insert(e.Follow, {
          follower: e.global.CurrentUser,
          followed: user,
        })
        .run(client);

      revalidatePath(`/profile/${username}`);
      revalidatePath("/discover");
      return { following: true, totalFollowers: total + 1 };
    }

    return { following: false, totalFollowers: total };
  },
);
