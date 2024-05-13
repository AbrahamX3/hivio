"use server";

import e from "@edgedb/edgeql-js";

import { db } from "@/lib/edgedb";
import { action } from "@/lib/safe-action";

import { UserProfile } from "./validations";

export const hiveProfile = action(UserProfile, async ({ username }) => {
  const hive = await e
    .select(e.Hive, (hive) => ({
      ...e.Hive["*"],
      title: {
        ...e.Title["*"],
      },
      filter: e.op(hive.addedBy.username, "=", e.str(username)),
    }))
    .run(db);

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
