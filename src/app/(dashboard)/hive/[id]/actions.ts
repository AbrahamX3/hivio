"use server";

import e from "@edgedb/edgeql-js";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/edgedb";
import { withAuthActionClient } from "@/lib/safe-action";

import { GetTitleFromHiveSchema, saveTitleFormSchema } from "./validations";

export const getTitleFromHive = withAuthActionClient
	.schema(GetTitleFromHiveSchema)
	.action(async ({ parsedInput: { id } }) => {
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
	});

export const getTitleFromHiveMetadata = withAuthActionClient
	.schema(GetTitleFromHiveSchema)
	.action(async ({ parsedInput: { id } }) => {
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
	});

export const updateTitleFromHive = withAuthActionClient
	.schema(saveTitleFormSchema)
	.action(async ({ parsedInput: { form, id } }) => {
		const client = auth.getSession().client;

		if (form.status === "FINISHED") {
			const result = await e
				.update(e.Hive, (hive) => ({
					set: {
						status: form.status,
						currentEpisode: form.currentEpisode ? form.currentEpisode : null,
						currentSeason: form.currentSeason ? form.currentSeason : null,
						finishedAt: form.finishedAt ? form.finishedAt : null,
						rating: form.rating ? form.rating : null,
						startedAt: form.startedAt ? form.startedAt : null,
						isFavorite: form.isFavorite ?? false,
					},
					filter_single: e.op(
						e.op(hive.id, "=", e.uuid(id)),
						"and",
						e.op(hive.addedBy.id, "=", e.global.CurrentUser.id),
					),
				}))
				.run(client);

			revalidatePath("/hive");
			return {
				success: true,
				data: result,
			};
		}
		if (form.status === "PENDING") {
			const result = await e
				.update(e.Hive, (hive) => ({
					set: {
						status: form.status,
					},
					filter_single: e.op(
						e.op(hive.id, "=", e.uuid(id)),
						"and",
						e.op(hive.addedBy.id, "=", e.global.CurrentUser.id),
					),
				}))
				.run(client);

			revalidatePath("/hive");
			return {
				success: true,
				data: result,
			};
		}
		if (form.status === "UNFINISHED") {
			const result = await e
				.update(e.Hive, (hive) => ({
					set: {
						status: form.status,
						currentEpisode: form.currentEpisode ? form.currentEpisode : null,
						currentSeason: form.currentSeason ? form.currentSeason : null,
						startedAt: form.startedAt ? form.startedAt : null,
						isFavorite: e.bool(form.isFavorite ?? false),
					},
					filter_single: e.op(
						e.op(hive.id, "=", e.uuid(id)),
						"and",
						e.op(hive.addedBy.id, "=", e.global.CurrentUser.id),
					),
				}))
				.run(client);

			revalidatePath("/hive");
			return {
				success: true,
				data: result,
			};
		}
		if (form.status === "WATCHING") {
			const result = await e
				.update(e.Hive, (hive) => ({
					set: {
						status: form.status,
						currentEpisode: form.currentEpisode ? form.currentEpisode : null,
						currentSeason: form.currentSeason ? form.currentSeason : null,
						startedAt: form.startedAt ? form.startedAt : null,
						isFavorite: e.bool(form.isFavorite ?? false),
					},
					filter_single: e.op(
						e.op(hive.id, "=", e.uuid(id)),
						"and",
						e.op(hive.addedBy.id, "=", e.global.CurrentUser.id),
					),
				}))
				.run(client);

			revalidatePath("/hive");
			return {
				success: true,
				data: result,
			};
		}

		return {
			success: false,
			error: {
				reason: "Error updating title",
			},
		};
	});
