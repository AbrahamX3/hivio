import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import {
	deleteAvatarObject,
	getAvatarKey,
	getAvatarUploadUrl,
	isOwnedAvatarKey,
	MAX_AVATAR_SIZE,
} from "@/lib/r2";

import { protectedProcedure, publicProcedure } from "../procedures";

function isAllowedAvatarValue(value: string, userId: string): boolean {
	if (!value.startsWith("http")) {
		return isOwnedAvatarKey(value, userId);
	}
	try {
		const url = new URL(value);
		return url.protocol === "http:" || url.protocol === "https:";
	} catch {
		return false;
	}
}

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
				contentLength: z
					.number()
					.int()
					.positive()
					.max(MAX_AVATAR_SIZE, "File must be less than 5MB"),
			}),
		)
		.handler(async ({ input, context }) => {
			const ext = input.contentType.split("/")[1] || "png";
			const key = getAvatarKey(context.session!.userId, ext);
			const uploadUrl = await getAvatarUploadUrl(
				key,
				input.contentType,
				input.contentLength,
			);
			return { uploadUrl, key };
		}),

	updateAvatar: protectedProcedure
		.input(z.object({ imageUrl: z.string().min(1).max(2048) }))
		.handler(async ({ input, context }) => {
			const userId = context.session!.userId;
			if (!isAllowedAvatarValue(input.imageUrl, userId)) {
				throw new ORPCError("BAD_REQUEST", {
					message: "Invalid avatar image value",
				});
			}

			const [user] = await db
				.select()
				.from(users)
				.where(eq(users.id, userId))
				.limit(1);

			// Only delete objects the user actually owns in R2.
			if (user?.image && isOwnedAvatarKey(user.image, userId)) {
				await deleteAvatarObject(user.image).catch(() => {});
			}

			const [updated] = await db
				.update(users)
				.set({ image: input.imageUrl, updatedAt: new Date() })
				.where(eq(users.id, userId))
				.returning();
			return updated;
		}),

	removeAvatar: protectedProcedure.handler(async ({ context }) => {
		const userId = context.session!.userId;
		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		// Only delete objects the user actually owns in R2.
		if (user?.image && isOwnedAvatarKey(user.image, userId)) {
			await deleteAvatarObject(user.image).catch(() => {});
		}

		const [updated] = await db
			.update(users)
			.set({ image: null, updatedAt: new Date() })
			.where(eq(users.id, userId))
			.returning();
		return updated;
	}),
};
