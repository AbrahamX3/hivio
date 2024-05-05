"use server";

import e from "@edgedb/edgeql-js";

import { auth } from "@/lib/edgedb";

import { ProfileSetupForm } from "../../_components/profile-setup";

export async function ProfileOnboarding(
  values: ProfileSetupForm,
): Promise<string> {
  const { username, name, status } = values;
  const client = auth.getSession().client;

  const user = await e
    .select(e.User, (user) => ({
      username: true,
      filter: e.op(user.username, "=", username),
    }))
    .run(client);

  if (user.length > 0) {
    throw new Error("Username already taken");
  }

  await e
    .update(e.User, (user) => ({
      filter: e.op(user.email, "=", e.global.CurrentUser.email),
      set: {
        username: e.str_trim(username.toLocaleLowerCase()),
        name: e.str_trim(name),
        status: status,
      },
    }))
    .run(client);

  return username;
}
