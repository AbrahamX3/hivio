"use server";

import e from "@edgedb/edgeql-js";

import { auth } from "@/lib/edgedb";
import { actionClient } from "@/lib/safe-action";

import { SearchProfile } from "./validations";

export interface UserSearch {
	avatar: string | null;
	username: string | null;
	name: string;
}

export const searchUsers = actionClient
	.schema(SearchProfile)
	.action(async ({ parsedInput: { search } }) => {
		const client = auth.getSession().client;

		const users = await e
			.select(e.User, (user) => ({
				username: true,
				avatar: true,
				name: true,
				filter: e.op(
					e.op(user.username, "ilike", `%${search}%`),
					"or",
					e.op(user.name, "ilike", `%${search}%`),
				),
			}))
			.run(client);

		return users;
	});
