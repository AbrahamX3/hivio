"use server";

import { env } from "@/env";
import { action } from "@/lib/safe-action";
import {
  type MovieCredits,
  type MovieDetails,
  type SeriesCredits,
  type SeriesDetails,
} from "@/types/tmdb";

import { TitleDetailsSchema } from "./validations";

export async function getIMDBId(tmdbId: number, type: "MOVIE" | "SERIES") {
  const media_type = type === "MOVIE" ? "movie" : "tv";
  const url = `https://api.themoviedb.org/3/${media_type}/${tmdbId}/external_ids`;

  const resposne = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${env.TMDB_API_KEY}`,
    },
  });

  if (!resposne.ok) {
    return null;
  }

  const data = (await resposne.json()) as {
    id: string;
    imdb_id: string;
  };

  return data.imdb_id;
}

export const getMovieDetails = action(
  TitleDetailsSchema,
  async ({ tmdbId }) => {
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
  },
);

export const getSeriesDetails = action(
  TitleDetailsSchema,
  async ({ tmdbId }) => {
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
  },
);

export const getSeriesCredits = action(
  TitleDetailsSchema,
  async ({ tmdbId }) => {
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
  },
);

export const getMovieCredits = action(
  TitleDetailsSchema,
  async ({ tmdbId }) => {
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
  },
);
