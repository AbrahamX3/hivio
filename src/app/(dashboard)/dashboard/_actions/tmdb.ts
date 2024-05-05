"use server";

import { env } from "@/env";
import { MovieCredits, SeriesCredits } from "@/types/tmdb";

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

export async function getMovieCredits({ tmdbId }: { tmdbId: number }) {
  try {
    const url = new URL(`https://api.themoviedb.org/3/movie/${tmdbId}/credits`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${env.TMDB_API_KEY}`,
      },
    });

    const data = (await response.json()) as MovieCredits;

    if (!response.ok) {
      throw new Error("Failed to get similar movies");
    }

    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function getSeriesCredits({ tmdbId }: { tmdbId: number }) {
  try {
    const url = new URL(`https://api.themoviedb.org/3/tv/${tmdbId}/credits`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${env.TMDB_API_KEY}`,
      },
    });

    const data = (await response.json()) as SeriesCredits;

    if (!response.ok) {
      throw new Error("Failed to get similar movies");
    }

    return data;
  } catch (error) {
    console.error(error);
  }
}
