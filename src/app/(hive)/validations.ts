import { z } from "zod";

export const SearchProfile = z.object({
  search: z.string(),
});
