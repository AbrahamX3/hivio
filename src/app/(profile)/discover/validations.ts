import { z } from "zod";

export const HiveProfilesSchema = z.object({
	limit: z.number().min(1, {
		message: "Limit must be greater than 0",
	}),
});
