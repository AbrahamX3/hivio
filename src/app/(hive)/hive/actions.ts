"use server";

import { revalidatePath } from "next/cache";
import e from "@edgedb/edgeql-js";

import { auth } from "@/lib/edgedb";
import { authAction } from "@/lib/safe-action";

import {
  DeleteTitleFromHiveSchema,
  ProfileSetupFormSchema,
} from "./validations";

export const profileOnboarding = authAction(
  ProfileSetupFormSchema,
  async ({ username, name, status }) => {
    const client = auth.getSession().client;

    const user = await e
      .select(e.User, (user) => ({
        username: true,
        filter: e.op(user.username, "=", username),
      }))
      .run(client);

    if (user.length > 0) {
      return {
        success: false,
        error: {
          reason: "Username already taken, please try another one!",
        },
      };
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

    revalidatePath("/hive");
    return { success: true, data: { username } };
  },
);

export const deleteTitle = authAction(
  DeleteTitleFromHiveSchema,
  async ({ id }) => {
    const client = auth.getSession().client;

    const deleteTitle = await e
      .delete(e.Hive, (hive) => ({
        filter_single: e.op(
          e.op(hive.id, "=", e.uuid(id)),
          "and",
          e.op(hive.createdBy.id, "=", e.global.CurrentUser.id),
        ),
      }))
      .run(client);

    revalidatePath("/hive");
    return { success: true, data: { id: deleteTitle?.id } };
  },
);
