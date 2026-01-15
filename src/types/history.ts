import { z } from "zod";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import type { HistoryStatus, MediaType } from "../../convex/types";

export type { HistoryStatus, MediaType };

export const historyStatusSchema = z.enum([
  "FINISHED",
  "WATCHING",
  "PLANNED",
  "ON_HOLD",
  "DROPPED",
  "REWATCHING",
]);

export const mediaTypeSchema = z.enum(["MOVIE", "SERIES"]);

export const addTitleFormSchema = z.object({
  status: historyStatusSchema,
  currentEpisode: z.string(),
  currentSeason: z.string(),
  currentRuntime: z.string(),
  isFavourite: z.boolean(),
});

export type AddTitleFormValues = z.infer<typeof addTitleFormSchema>;

export const editHistoryFormSchema = z.object({
  status: historyStatusSchema,
  currentEpisode: z.string(),
  currentSeason: z.string(),
  currentRuntime: z.string(),
  isFavourite: z.boolean(),
});

export type EditHistoryFormValues = z.infer<typeof editHistoryFormSchema>;

export type HistoryDoc = Doc<"history">;
export type TitleDoc = Doc<"title">;
export type HistoryId = Id<"history">;
export type TitleId = Id<"title">;

export type Title = TitleDoc;

export type HistoryItem = HistoryDoc & {
  title: Title | null;
};

export type SearchResult = {
  id: number;
  name: string;
  posterUrl: string | undefined;
  backdropUrl: string | undefined;
  description: string | undefined;
  mediaType: MediaType;
  releaseDate: string;
  genres: string;
};

export type TitleDetails = {
  imdbId: string;
  directors: string[];
  runtime: number | null;
  seasons: Array<{
    seasonNumber: number;
    episodeCount: number;
    name: string;
    airDate: string | null;
  }> | null;
};

export type Episode = {
  episodeNumber: number;
  name: string;
  airDate: string | null;
};

export type HistoryUpdateData = {
  status?: HistoryStatus;
  currentEpisode?: number;
  currentSeason?: number;
  currentRuntime?: number;
  isFavourite?: boolean;
};
