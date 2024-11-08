"use server";

import e, { type $infer } from "@edgedb/edgeql-js";

import { db } from "@/lib/edgedb";
import { actionClient } from "@/lib/safe-action";

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
			genres: e.select(e.Hive, (hive) => ({
				title: {
					genres: true,
				},
				filter: e.op(hive.addedBy.username, "=", user.username),
			})),
			total_followers: e.count(user.followers),
			total_following: e.count(user.following),
			followers: e.select(e.Follow, (follow) => ({
				follower: {
					username: true,
					avatar: true,
					name: true,
				},
				filter: e.op(follow.followed.username, "=", user.username),
			})),
			following: e.select(e.Follow, (follow) => ({
				followed: {
					username: true,
					avatar: true,
					name: true,
				},
				filter: e.op(follow.follower.username, "=", user.username),
			})),
			filter: e.op("exists", user.username),
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

export const getHiveProfiles = actionClient
	.schema(HiveProfilesSchema)
	.action(async ({ parsedInput: { limit } }) => {
		const hive = await HiveProfilesQuery.run(db, {
			limit,
		});

		if (hive) {
			return { success: true, data: { hive } };
		}
		return {
			success: false,
			error: {
				reason: "Faild finding hive profiles",
			},
		};
	});
