import { z } from "zod";

export const findTitleDetailsSchema = z.object({
	tmdbId: z.number().min(1, {
		message: "tmdbId is required",
	}),
});
