"use server";

import { revalidatePath } from "next/cache";
import e from "@edgedb/edgeql-js";
import { z } from "zod";

import { auth, db } from "@/lib/edgedb";
import { authAction } from "@/lib/safe-action";

import {
  GeneralSettingsDisplayNameFormSchema,
  GeneralSettingsStatusFormSchema,
  GeneralSettingsUsernameFormSchema,
} from "./validations";

export const saveUsername = authAction(
  GeneralSettingsUsernameFormSchema,
  async ({ username }) => {
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
        filter: e.op(user.id, "=", e.global.CurrentUser.id),
        set: {
          username: e.str_trim(username.toLocaleLowerCase()),
        },
      }))
      .run(client);

    revalidatePath("/hive/settings");
    return { success: true, data: { username } };
  },
);

export const saveDisplayName = authAction(
  GeneralSettingsDisplayNameFormSchema,
  async ({ name }) => {
    const client = auth.getSession().client;

    try {
      await e
        .update(e.User, (user) => ({
          filter: e.op(user.id, "=", e.global.CurrentUser.id),
          set: {
            name: e.str(name),
          },
        }))
        .run(client);
    } catch (error) {
      return {
        success: false,
        error: {
          reason: JSON.stringify(error),
        },
      };
    }

    revalidatePath("/hive/settings");

    return { success: true, data: { name } };
  },
);

export const saveStatus = authAction(
  GeneralSettingsStatusFormSchema,
  async ({ status }) => {
    const client = auth.getSession().client;

    try {
      await e
        .update(e.User, (user) => ({
          filter: e.op(user.id, "=", e.global.CurrentUser.id),
          set: {
            status,
          },
        }))
        .run(client);
    } catch (error) {
      return {
        success: false,
        error: {
          reason: JSON.stringify(error),
        },
      };
    }

    revalidatePath("/hive/settings");

    return { success: true, data: { status } };
  },
);

export const deleteAccount = authAction(
  z.object({
    confirm: z.boolean(),
  }),
  async ({ confirm }) => {
    if (!confirm)
      return { success: false, error: { reason: "Confirmation required!" } };
    const client = auth.getSession().client;
    await e
      .delete(e.Hive, (hive) => ({
        filter: e.op(hive.addedBy.id, "=", e.global.CurrentUser.id),
      }))
      .run(client)
      .catch((error) => {
        console.error(error);
      });

    const userData = await e
      .select(e.User, (user) => ({
        identity: true,
        id: true,
        filter_single: e.op(user.id, "=", e.global.CurrentUser.id),
      }))
      .run(client)
      .catch((error) => {
        console.error(error);
      });

    if (!userData?.identity.id) {
      return {
        success: false,
        error: {
          reason: "Session not found!",
        },
      };
    }

    await e
      .delete(e.User, (user) => ({
        filter: e.op(user.id, "=", e.uuid(userData.id)),
      }))
      .run(db)
      .catch((error) => {
        console.error(error);
      });

    await e
      .delete(e.ext.auth.Identity, (identity) => ({
        filter: e.op(identity.id, "=", e.uuid(userData.identity.id)),
      }))
      .run(db)
      .catch((error) => {
        console.error(error);
      });

    revalidatePath("/hive/settings/danger");

    return { success: true, data: { confirm: true } };
  },
);
