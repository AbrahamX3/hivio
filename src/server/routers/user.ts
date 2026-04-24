import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";

import { protectedProcedure, publicProcedure } from "../procedures";

export const userRouter = {
	getCurrentUser: publicProcedure.handler(async ({ context }) => {
		const userId = context.session?.userId;
		if (!userId) return null;

		const [userData] = await db
			.select()
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);
		return userData ?? null;
	}),

	updateDefaultStatus: protectedProcedure
		.input(
			z.object({
				defaultStatus: z.enum([
					"FINISHED",
					"WATCHING",
					"PLANNED",
					"ON_HOLD",
					"DROPPED",
					"REWATCHING",
				]),
			}),
		)
		.handler(async ({ input, context }) => {
			const [updated] = await db
				.update(users)
				.set({ defaultStatus: input.defaultStatus, updatedAt: new Date() })
				.where(eq(users.id, context.session!.userId))
				.returning();
			return updated;
		}),
};
