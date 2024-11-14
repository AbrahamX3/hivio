import { z } from "zod";

export const getUserProfilesSchema = z.object({
	limit: z.number().min(1, {
		message: "Limit must be greater than 0",
	}),
});
