import { z } from "zod";

export type ProfileSetupForm = z.infer<typeof ProfileSetupFormSchema>;

export const ProfileSetupFormSchema = z.object({
  username: z
    .string()
    .min(4, {
      message: "Username must be at least 4 characters",
    })
    .max(50, {
      message: "Username must be less than 50 characters",
    }),
  name: z
    .string()
    .min(4, {
      message: "Display name must be at least 4 characters",
    })
    .max(50, {
      message: "Display name must be less than 50 characters",
    }),
  status: z.enum(["UPCOMING", "PENDING", "WATCHING", "UNFINISHED", "FINISHED"]),
});

export const DeleteTitleFromHiveSchema = z.object({
  id: z.string().min(1, {
    message: "Title ID is required",
  }),
});
