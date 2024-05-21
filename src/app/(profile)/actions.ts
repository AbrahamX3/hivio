"use server";

import e, { type $infer } from "@edgedb/edgeql-js";

import { db } from "@/lib/edgedb";
import { action } from "@/lib/safe-action";

import { UserProfile } from "./validations";

export type HiveProfile = $infer<typeof HiveProfile>;

const HiveProfile = e.params(
  {
    username: e.str,
  },
  ({ username }) => {
    return e.select(e.Hive, (hive) => ({
      ...e.Hive["*"],
      title: {
        ...e.Title["*"],
        seasons: {
          ...e.Season["*"],
        },
      },
      order_by: [
        {
          expression: hive.createdAt,
          direction: e.DESC,
        },
      ],
      filter: e.op(hive.addedBy.username, "=", username),
    }));
  },
);

export const hiveProfile = action(UserProfile, async ({ username }) => {
  const hive = await HiveProfile.run(db, {
    username,
  });

  const user = await e
    .select(e.User, (user) => ({
      avatar: true,
      username: true,
      name: true,
      createdAt: true,
      filter_single: e.op(user.username, "=", e.str(username)),
    }))
    .run(db);

  const dataUsername = user?.username;
  const dataName = user?.name;

  if (!dataUsername || !dataName) {
    return { success: false, error: { reason: "Username or name not found" } };
  }

  return { success: true, data: { hive, user } };
});

export const hiveMetadataInfo = action(UserProfile, async ({ username }) => {
  const user = await e
    .select(e.User, (user) => ({
      username: true,
      name: true,
      filter_single: e.op(user.username, "=", e.str(username)),
    }))
    .run(db);

  if (user === null) {
    return { success: false, error: { reason: "Username not found" } };
  }

  return { success: true, data: { user } };
});
