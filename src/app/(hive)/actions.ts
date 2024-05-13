"use server";

import e from "@edgedb/edgeql-js";

import { auth } from "@/lib/edgedb";
import { authAction } from "@/lib/safe-action";

import { SearchProfile } from "./validations";

export interface UserSearch {
  avatar: string | null;
  username: string | null;
  name: string;
}

export const searchUsers = authAction(SearchProfile, async ({ search }) => {
  const client = auth.getSession().client;

  const users = await e
    .select(e.User, (user) => ({
      username: true,
      avatar: true,
      name: true,
      filter: e.op(user.username, "like", `%${search}%`),
    }))
    .run(client);

  return users;
});
