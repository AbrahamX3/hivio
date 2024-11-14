"use server";

import { db } from "@/lib/edgedb";
import { withoutAuthActionClient } from "@/lib/safe-action";
import {
	getUserProfileQuery as getUserByUsernameQuery,
	getUserDetailsQuery,
	getUserHiveProfileByUsernameQuery,
} from "./queries";
import { getProfileSchema } from "./schemas";

export const getProfileAction = withoutAuthActionClient
	.schema(getProfileSchema)
	.action(async ({ parsedInput: { username } }) => {
		const hive = await getUserHiveProfileByUsernameQuery.run(db, {
			username,
		});

		const user = await getUserByUsernameQuery.run(db, {
			username,
		});

		const dataUsername = user?.username;
		const dataName = user?.name;

		if (!dataUsername || !dataName) {
			return {
				success: false,
				error: { reason: "Username or name not found" },
			};
		}

		return { success: true, data: { hive, user } };
	});

export const getProfileMetadataInfoAction = withoutAuthActionClient
	.schema(getProfileSchema)
	.action(async ({ parsedInput: { username } }) => {
		const user = await getUserDetailsQuery.run(db, {
			username,
		});

		if (user === null) {
			return { success: false, error: { reason: "Username not found" } };
		}

		return { success: true, data: { user } };
	});
