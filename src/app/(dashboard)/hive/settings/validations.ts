import { z } from "zod";

export type GeneralSettingsStatusForm = z.infer<
  typeof GeneralSettingsStatusFormSchema
>;

export const GeneralSettingsStatusFormSchema = z.object({
  status: z.enum(["PENDING", "WATCHING", "UNFINISHED", "FINISHED"]),
});

export type GeneralSettingsUsernameForm = z.infer<
  typeof GeneralSettingsUsernameFormSchema
>;

export const GeneralSettingsUsernameFormSchema = z.object({
  username: z
    .string()
    .min(4, {
      message: "Username must be at least 4 characters",
    })
    .max(50, {
      message: "Username must be less than 50 characters",
    }),
});

export type GeneralSettingsDisplayNameForm = z.infer<
  typeof GeneralSettingsDisplayNameFormSchema
>;

export const GeneralSettingsDisplayNameFormSchema = z.object({
  name: z
    .string()
    .min(4, {
      message: "Display name must be at least 4 characters",
    })
    .max(50, {
      message: "Display name must be less than 50 characters",
    }),
});
