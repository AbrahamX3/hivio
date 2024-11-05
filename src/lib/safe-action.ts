import { createSafeActionClient } from "next-safe-action";

import { auth } from "./edgedb";

export const actionClient = createSafeActionClient();

export const authAction = createSafeActionClient().use(async ({ next }) => {
	const isSignedIn = await auth.getSession().isSignedIn();

	if (!isSignedIn) {
		throw new Error("Session not found!");
	}

	return next();
});
