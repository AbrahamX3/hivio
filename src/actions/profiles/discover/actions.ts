"use server";

import { db } from "@/lib/edgedb";
import { withoutAuthActionClient } from "@/lib/safe-action";
import { getUserProfilesQuery } from "./queries";
import { getUserProfilesSchema } from "./schemas";

export const getUserProfilesAction = withoutAuthActionClient
	.schema(getUserProfilesSchema)
	.action(async ({ parsedInput: { limit } }) => {
		const profiles = await getUserProfilesQuery.run(db, {
			limit,
		});

		if (profiles) {
			return { success: true, data: { hive: profiles } };
		}

		return {
			success: false,
			error: {
				reason: "Faild finding hive profiles",
			},
		};
	});
