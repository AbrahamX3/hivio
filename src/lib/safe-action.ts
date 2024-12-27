import { createSafeActionClient } from "next-safe-action";

import { getSession } from "./auth";
import { auth } from "./edgedb";

export const withoutAuthActionClient = createSafeActionClient();

export const withAuthActionClient = createSafeActionClient().use(
	async ({ next }) => {
		const isSignedIn = await auth.getSession().isSignedIn();

		if (!isSignedIn) {
			throw new Error("Session not found!");
		}

		const session = await getSession();

		if (!session) {
			throw new Error("Session not found!");
		}

		return next({ ctx: { session } });
	},
);
