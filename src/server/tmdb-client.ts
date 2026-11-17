import { TMDB } from "tmdb-ts";

import { env } from "@/env";

export function getTmdbClient() {
	const apiKey = env.TMDB_API_KEY;
	if (!apiKey) throw new Error("TMDB_API_KEY not configured");
	return new TMDB(apiKey);
}
