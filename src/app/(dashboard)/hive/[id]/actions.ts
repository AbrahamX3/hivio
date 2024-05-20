"use server";

import e from "@edgedb/edgeql-js";

import { auth } from "@/lib/edgedb";
import { authAction } from "@/lib/safe-action";

import { GetTitleFromHiveSchema } from "./validations";

export const getTitleFromHive = authAction(
  GetTitleFromHiveSchema,
  async ({ id }) => {
    const client = auth.getSession().client;

    const data = await e
      .select(e.Hive, (hive) => ({
        ...e.Hive["*"],
        title: {
          ...e.Title["*"],
          seasons: {
            ...e.Season["*"],
          },
        },
        filter_single: e.op(
          e.op(hive.id, "=", e.uuid(id)),
          "and",
          e.op(hive.addedBy.id, "=", e.global.CurrentUser.id),
        ),
      }))
      .run(client);

    if (!data) {
      return { success: false, error: { reason: "Title not found" } };
    }

    return {
      success: true,
      data,
    };
  },
);

export const getTitleFromHiveMetadata = authAction(
  GetTitleFromHiveSchema,
  async ({ id }) => {
    const client = auth.getSession().client;

    const data = await e
      .select(e.Hive, (hive) => ({
        title: {
          name: true,
        },
        status: true,
        filter_single: e.op(
          e.op(hive.id, "=", e.uuid(id)),
          "and",
          e.op(hive.addedBy.id, "=", e.global.CurrentUser.id),
        ),
      }))
      .run(client);

    if (!data) {
      return { success: false, error: { reason: "Title not found" } };
    }

    return {
      success: true,
      data: {
        name: data.title.name,
        status: data.status,
      },
    };
  },
);
