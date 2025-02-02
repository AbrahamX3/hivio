import { fromZonedTime } from "date-fns-tz";
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
	status: z.enum(["PENDING", "WATCHING", "UNFINISHED", "FINISHED"]),
	avatar: z.string().url().optional(),
});

export const RefreshTitleDataSchema = z.object({
	id: z.string().min(1, {
		message: "Title ID is required",
	}),
});

export const DeleteTitleFromHiveSchema = z.object({
	id: z.string().min(1, {
		message: "Title ID is required",
	}),
});

export const FindTitleSeasonsSchema = z.object({
	tmdbId: z.number().min(1, {
		message: "tmdbId is required",
	}),
});

export const FindTitleDetails = z.object({
	tmdbId: z.number().min(1, {
		message: "tmdbId is required",
	}),
	type: z.enum(["movie", "tv"]),
});

export const basehiveFormSchema = z.object({
	currentSeason: z.coerce.number().min(1).optional(),
	currentEpisode: z.coerce.number().min(1).optional(),
	currentRuntimeHours: z.coerce.number().optional(),
	currentRuntimeMinutes: z.coerce.number().optional(),
	startedAt: z.date().optional(),
});

export const hiveFormSchema = z
	.discriminatedUnion("status", [
		z
			.object({
				status: z.literal("FINISHED"),
				finishedAt: z.date().optional(),
				isFavorite: z.boolean().optional(),
				rating: z.coerce.number().min(0).max(10).default(0).optional(),
			})
			.merge(basehiveFormSchema),
		z
			.object({
				isFavorite: z.boolean().optional(),
				status: z.enum(["WATCHING", "UNFINISHED"]),
			})
			.merge(basehiveFormSchema),
		z
			.object({
				status: z.enum(["PENDING"]),
			})
			.merge(basehiveFormSchema),
	])
	.transform((data) => {
		if (data.status === "FINISHED" && data.startedAt && data.finishedAt) {
			return {
				...data,
				startedAt: fromZonedTime(
					data.startedAt,
					Intl.DateTimeFormat().resolvedOptions().timeZone,
				),
				finishedAt: fromZonedTime(
					data.finishedAt,
					Intl.DateTimeFormat().resolvedOptions().timeZone,
				),
			};
		}
		if (data.startedAt) {
			return {
				...data,
				startedAt: fromZonedTime(
					data.startedAt,
					Intl.DateTimeFormat().resolvedOptions().timeZone,
				),
			};
		}

		return data;
	});

export type HiveFormValues = z.infer<typeof hiveFormSchema>;

export const titleFormSchema = z.object({
	tmdbId: z.coerce.number().min(1, {
		message: "Select a movie or series by clicking on a card.",
	}),
	type: z.enum(["movie", "tv"]),
});

export type TitleFormValues = z.infer<typeof titleFormSchema>;

export const AddTitleToHiveSchema = z.object({
	hiveFormValues: hiveFormSchema,
	titleFormValues: titleFormSchema,
});

export type SearchFormValues = z.infer<typeof searchFormSchema>;

export const searchFormSchema = z.object({
	query: z.string().min(1, {
		message: "Search query is required",
	}),
});

export const saveTitleFormSchema = z.object({
	form: hiveFormSchema,
	id: z.string().min(1, {
		message: "Title ID is required",
	}),
});
