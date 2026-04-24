import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { titles } from "@/db/schema";

import { publicProcedure } from "../procedures";

export const titleRouter = {
	getByTmdbId: publicProcedure
		.input(
			z.object({ tmdbId: z.number(), mediaType: z.enum(["MOVIE", "SERIES"]) }),
		)
		.handler(async ({ input }) => {
			const [titleData] = await db
				.select()
				.from(titles)
				.where(
					and(
						eq(titles.tmdbId, input.tmdbId),
						eq(titles.mediaType, input.mediaType),
					),
				)
				.limit(1);
			return titleData ?? null;
		}),
};
