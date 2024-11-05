import { z } from "zod";

export const FollowSchema = z.object({
	username: z.string(),
	total: z.number().default(0),
});

export const TotalFollowersSchema = z.object({
	username: z.string(),
});
