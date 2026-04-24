import { ORPCError, os } from "@orpc/server";

export interface AppContext {
	session: {
		userId: string;
		sessionId: string;
		user: {
			id: string;
			name: string;
			email: string;
			image: string | null;
		};
	} | null;
}

export const publicProcedure = os.$context<AppContext>();

export const protectedProcedure = publicProcedure.use(({ context, next }) => {
	if (!context.session) {
		throw new ORPCError("UNAUTHORIZED");
	}
	return next({ context });
});
