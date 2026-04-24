import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const env = createEnv({
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
	shared: {
		NODE_ENV: z
			.union([
				z.literal("production"),
				z.literal("development"),
				z.literal("test"),
			])
			.prefault("production"),
	},
	server: {
		DATABASE_URL: z.url(),
		TMDB_API_KEY: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(1),
		DISCORD_CLIENT_ID: z.string().min(1),
		DISCORD_CLIENT_SECRET: z.string().min(1),
		UPSTASH_REDIS_REST_URL: z.url(),
		UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
	},
	client: {
		NEXT_PUBLIC_SITE_URL: z.url(),
		NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().min(1),
	},
	experimental__runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
		NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
	},
});
