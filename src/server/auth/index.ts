import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { lastLoginMethod } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { render } from "react-email";

import { db } from "@/db";
import { authSchema } from "@/db/auth-schema";
import { verifications } from "@/db/schema";
import { env } from "@/env";
import { deleteAvatarObject, isOwnedAvatarKey } from "@/lib/r2";
import { rateLimitStorage } from "@/lib/rate-limit-storage";
import {
	DeleteAccountEmail,
	ResetPasswordEmail,
	sendEmail,
	VerificationEmail,
} from "@/server/email";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: authSchema,
		usePlural: true,
	}),
	socialProviders: {
		discord: {
			clientId: env.DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET,
		},
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
			prompt: "select_account",
		},
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 60, // 1 minute — bounds the window for stale sessions after revocation
		},
	},
	// Shared across Vercel instances via the existing Upstash Redis. Rate
	// limiting stays production-only (Better Auth's default) and uses a
	// dedicated customStorage, so sessions and verification tokens remain in
	// the database.
	rateLimit: {
		customStorage: rateLimitStorage,
		customRules: {
			"/send-verification-email": { window: 60, max: 5 },
			"/request-password-reset": { window: 60, max: 5 },
			"/sign-in/email": { window: 60, max: 10 },
			"/sign-up/email": { window: 60, max: 5 },
		},
	},
	account: {
		accountLinking: {
			enabled: true,
			// Never auto-link a social identity by email match during sign-in.
			// Linking requires an authenticated, explicit linkSocial() flow.
			disableImplicitLinking: true,
			trustedProviders: ["google", "discord"],
		},
	},
	user: {
		deleteUser: {
			enabled: true,
			sendDeleteAccountVerification: async ({ user, url }) => {
				const body = await render(
					DeleteAccountEmail({
						username: user.name,
						url,
						email: user.email,
					}),
				);
				await sendEmail({
					to: user.email,
					subject: "Confirma la eliminación de tu cuenta",
					body,
				});
			},
			afterDelete: async (user) => {
				// Only remove objects under the user's own R2 prefix. The image
				// field can be set through Better Auth's updateUser endpoint, so
				// it must not be trusted as an owned key without this check.
				if (user.image && isOwnedAvatarKey(user.image, user.id)) {
					await deleteAvatarObject(user.image).catch((error) => {
						console.error("Failed to delete avatar object", error);
					});
				}

				// Password-reset and account-deletion tokens store the user id as
				// their value and are not linked by a foreign key.
				await db
					.delete(verifications)
					.where(eq(verifications.value, user.id))
					.catch((error) => {
						console.error("Failed to delete verification tokens", error);
					});
			},
		},
	},
	emailVerification: {
		sendVerificationEmail: async ({ user, url }) => {
			const verifyUrl = new URL(url);
			verifyUrl.searchParams.set(
				"callbackURL",
				`${env.NEXT_PUBLIC_SITE_URL}/dashboard`,
			);
			const body = await render(
				VerificationEmail({ username: user.name, url: verifyUrl.toString() }),
			);
			await sendEmail({
				to: user.email,
				subject: "Verifica tu correo electrónico",
				body,
			});
		},
		sendOnSignIn: true,
		autoSignInAfterVerification: true,
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }) => {
			const resetUrl = new URL(url);
			resetUrl.searchParams.set(
				"callbackURL",
				`${env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
			);
			const body = await render(
				ResetPasswordEmail({
					username: user.name,
					url: resetUrl.toString(),
				}),
			);
			await sendEmail({
				to: user.email,
				subject: "Restablece tu contraseña",
				body,
			});
		},
	},
	plugins: [lastLoginMethod(), nextCookies()],
});
