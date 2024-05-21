"use server";

import e, { type $infer } from "@edgedb/edgeql-js";

import { db } from "@/lib/edgedb";
import { action } from "@/lib/safe-action";

import { HiveProfilesSchema } from "./validations";

export type HiveProfiles = $infer<typeof HiveProfilesQuery>;

const HiveProfilesQuery = e.params(
  {
    limit: e.int16,
  },
  ({ limit }) => {
    return e.select(e.User, (user) => ({
      id: true,
      username: true,
      name: true,
      createdAt: true,
      avatar: true,
      follows: e.select(e.Follower, (follow) => ({
        follower: {
          username: true,
        },
        filter: e.op(follow.followed.username, "=", user.username),
      })),
      genres: e.select(e.Hive, (hive) => ({
        title: {
          genres: true,
        },
        filter: e.op(hive.addedBy.username, "=", user.username),
      })),
      total_followers: e.count(
        e.select(e.Follower, (follow) => ({
          follower: {
            username: true,
          },
          filter: e.op(follow.followed.username, "=", user.username),
        })),
      ),
      order_by: [
        {
          expression: user.createdAt,
          direction: e.ASC,
        },
      ],
      limit: limit,
    }));
  },
);

export const getHiveProfiles = action(HiveProfilesSchema, async ({ limit }) => {
  const hive = await HiveProfilesQuery.run(db, {
    limit,
  });

  if (hive) {
    return { success: true, data: { hive } };
  } else {
    return {
      success: false,
      error: {
        reason: "Faild finding hive profiles",
      },
    };
  }
});