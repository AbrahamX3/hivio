import { z } from "zod";

export const getProfileSchema = z.object({
	username: z.string().min(1, {
		message: "Username is required",
	}),
});
