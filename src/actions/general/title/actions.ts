"use server";

import { env } from "@/env";
import { withoutAuthActionClient } from "@/lib/safe-action";
import type {
	MovieCredits,
	MovieDetails,
	SeriesCredits,
	SeriesDetails,
} from "@/types/tmdb";
import { findTitleDetailsSchema } from "./schemas";

export const findMovieDetailsAction = withoutAuthActionClient
	.schema(findTitleDetailsSchema)
	.action(async ({ parsedInput: { tmdbId } }) => {
		const url = new URL(`https://api.themoviedb.org/3/movie/${tmdbId}`);

		const response = await fetch(url, {
			method: "GET",
			headers: {
				Accept: "application/json",
				Authorization: `Bearer ${env.TMDB_API_KEY}`,
			},
		});

		if (!response.ok) {
			throw new Error("Failed to get movie details");
		}

		const data = (await response.json()) as MovieDetails;

		return data;
	});

export const findSeriesDetailsAction = withoutAuthActionClient
	.schema(findTitleDetailsSchema)
	.action(async ({ parsedInput: { tmdbId } }) => {
		const url = new URL(`https://api.themoviedb.org/3/tv/${tmdbId}`);

		const response = await fetch(url, {
			method: "GET",
			headers: {
				Accept: "application/json",
				Authorization: `Bearer ${env.TMDB_API_KEY}`,
			},
		});

		if (!response.ok) {
			throw new Error("Failed to get series details");
		}
		const data = (await response.json()) as SeriesDetails;

		return data;
	});

export const findSeriesCreditsAction = withoutAuthActionClient
	.schema(findTitleDetailsSchema)
	.action(async ({ parsedInput: { tmdbId } }) => {
		const url = new URL(`https://api.themoviedb.org/3/tv/${tmdbId}/credits`);

		const response = await fetch(url, {
			method: "GET",
			headers: {
				Accept: "application/json",
				Authorization: `Bearer ${env.TMDB_API_KEY}`,
			},
		});

		if (!response.ok) {
			throw new Error("Failed to get series credits");
		}
		const data = (await response.json()) as SeriesCredits;

		return data;
	});

export const findMovieCreditsAction = withoutAuthActionClient
	.schema(findTitleDetailsSchema)
	.action(async ({ parsedInput: { tmdbId } }) => {
		const url = new URL(`https://api.themoviedb.org/3/movie/${tmdbId}/credits`);

		const response = await fetch(url, {
			method: "GET",
			headers: {
				Accept: "application/json",
				Authorization: `Bearer ${env.TMDB_API_KEY}`,
			},
		});

		if (!response.ok) {
			throw new Error("Failed to get movie credits");
		}
		const data = (await response.json()) as MovieCredits;

		return data;
	});
