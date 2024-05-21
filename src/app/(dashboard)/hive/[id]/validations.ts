import { z } from "zod";

import { hiveFormSchema } from "../validations";

export const GetTitleFromHiveSchema = z.object({
  id: z.string().min(1, {
    message: "Title ID is required",
  }),
});

export const saveTitleFormSchema = z.object({
  form: hiveFormSchema,
  id: z.string().min(1, {
    message: "Title ID is required",
  }),
});
