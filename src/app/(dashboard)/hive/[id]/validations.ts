import { z } from "zod";

export const GetTitleFromHiveSchema = z.object({
  id: z.string().min(1, {
    message: "Title ID is required",
  }),
});
