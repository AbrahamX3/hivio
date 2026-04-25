import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { deleteAvatarObject, getAvatarKey, getAvatarUploadUrl } from "@/lib/r2";

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

	getAvatarUploadUrl: protectedProcedure
		.input(
			z.object({
				contentType: z
					.string()
					.refine((type) => type.startsWith("image/"), "File must be an image"),
			}),
		)
		.handler(async ({ input, context }) => {
			const ext = input.contentType.split("/")[1] || "png";
			const key = getAvatarKey(context.session!.userId, ext);
			const uploadUrl = await getAvatarUploadUrl(key, input.contentType);
			return { uploadUrl, key };
		}),

	updateAvatar: protectedProcedure
		.input(z.object({ imageUrl: z.string().min(1) }))
		.handler(async ({ input, context }) => {
			const [user] = await db
				.select()
				.from(users)
				.where(eq(users.id, context.session!.userId))
				.limit(1);

			// Delete old avatar if it was stored in R2 (not an external URL)
			if (user?.image && !user.image.startsWith("http")) {
				await deleteAvatarObject(user.image).catch(() => {});
			}

			const [updated] = await db
				.update(users)
				.set({ image: input.imageUrl, updatedAt: new Date() })
				.where(eq(users.id, context.session!.userId))
				.returning();
			return updated;
		}),

	removeAvatar: protectedProcedure.handler(async ({ context }) => {
		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.id, context.session!.userId))
			.limit(1);

		// Delete old avatar if it was stored in R2 (not an external URL)
		if (user?.image && !user.image.startsWith("http")) {
			await deleteAvatarObject(user.image).catch(() => {});
		}

		const [updated] = await db
			.update(users)
			.set({ image: null, updatedAt: new Date() })
			.where(eq(users.id, context.session!.userId))
			.returning();
		return updated;
	}),
};
