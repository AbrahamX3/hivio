"use server";

import { env } from "@/env";
import { MultiSearch } from "@/types/tmdb";

export async function searchTitle({ query }: { query: string }) {
  try {
    const url = new URL("https://api.themoviedb.org/3/search/multi");
    url.searchParams.append("query", query);
    url.searchParams.append("include_adult", "false");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${env.TMDB_API_KEY}`,
      },
    });

    const data = (await response.json()) as MultiSearch;
    console.log(data);
    if (!response.ok) {
      throw new Error("Failed to search title");
    }

    return data;
  } catch (error) {
    console.log(error);
  }
}
export async function addTitle() {}
