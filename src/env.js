import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";
import { z } from "zod";

export const env = createEnv({
	extends: [vercel()],
	server: {
		TMDB_API_KEY: z.string().min(1),
		UPSTASH_REDIS_REST_URL: z.string().url(),
		UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
		NODE_ENV: z
			.union([
				z.literal("production"),
				z.literal("development"),
				z.literal("test"),
			])
			.default("production"),
	},
	client: {
		NEXT_PUBLIC_BASE_URL: z.string().min(1),
		NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().min(1),
	},
	experimental__runtimeEnv: {
		NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
		NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
	},
});
