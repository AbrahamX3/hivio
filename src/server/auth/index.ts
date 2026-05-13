import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { lastLoginMethod } from "better-auth/plugins";

import { db } from "@/db";
import { authSchema } from "@/db/auth-schema";
import { env } from "@/env";
import {
  ResetPasswordEmail,
  sendEmail,
  VerificationEmail,
} from "@/server/email";
import { render } from "react-email";

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
      maxAge: 5 * 60, // 5 minutes
    },
  },
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const verifyUrl = new URL(url);
      verifyUrl.searchParams.set(
        "callbackURL",
        `${env.NEXT_PUBLIC_SITE_URL}/dashboard`
      );
      const body = await render(
        VerificationEmail({ username: user.name, url: verifyUrl.toString() })
      );
      sendEmail({
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
        `${env.NEXT_PUBLIC_SITE_URL}/dashboard`
      );
      const body = await render(
        ResetPasswordEmail({
          username: user.name,
          url: resetUrl.toString(),
        })
      );
      sendEmail({
        to: user.email,
        subject: "Restablece tu contraseña",
        body,
      });
    },
  },
  plugins: [nextCookies(), lastLoginMethod()],
});
