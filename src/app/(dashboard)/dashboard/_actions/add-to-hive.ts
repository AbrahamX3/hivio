"use server";

import { env } from "@/env";
import { auth } from "@/lib/edgedb";
import { MultiSearch, SearchResult } from "@/types/tmdb";
import e from "@edgedb/edgeql-js";

import { HiveFormValues } from "../_components/add-title/steps/hive-form-step";
import { TitleFormValues } from "../_components/add-title/steps/title-form-step";

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

    if (!response.ok) {
      throw new Error("Failed to search title");
    }

    return data;
  } catch (error) {
    console.error(error);
  }
}

interface AddTitleProps {
  hiveFormValues: HiveFormValues;
  titleFormValues: TitleFormValues;
  selectedTitleData: SearchResult;
}

export async function addTitle({
  hiveFormValues,
  selectedTitleData,
  titleFormValues,
}: AddTitleProps) {
  const client = auth.getSession().client;
  const tmdbId = titleFormValues.tmdbId;

  const isTitleAdded = await e
    .select(e.Title, (title) => ({
      filter_single: e.op(title.tmdbId, "=", e.int32(tmdbId)),
    }))
    .run(client);

  if (isTitleAdded) {
    const isTitleInUserHive = await e
      .select(e.Hive, (hive) => ({
        filter_single: e.op(
          e.op(hive.title.tmdbId, "=", tmdbId),
          "and",
          e.op(hive.createdBy.id, "=", e.global.CurrentUser.id),
        ),
      }))
      .run(client);

    if (isTitleInUserHive) {
      throw new Error("Title is already added to your hive!");
    }
  } else {
    const title =
      selectedTitleData.media_type === "movie"
        ? selectedTitleData.title
        : selectedTitleData.name;
    const date =
      selectedTitleData.media_type === "movie"
        ? selectedTitleData.release_date
        : selectedTitleData.first_air_date;
    const type = selectedTitleData.media_type === "movie" ? "MOVIE" : "SERIES";
    const { overview, genre_ids, id } = selectedTitleData;

    const imdbId = await getIMDBId(id, type);

    const titleId = e.insert(e.Title, {
      tmdbId: e.int32(id),
      title: e.str(title),
      description: e.str(overview),
      date: e.cal.local_date(date),
      poster: e.str(selectedTitleData.poster_path),
      type: type,
      genres: genre_ids,
      imdbId: imdbId ?? null,
    });

    const status = hiveFormValues.status;

    if (status === "FINISHED") {
      const insert = await e
        .insert(e.Hive, {
          createdBy: e.global.CurrentUser,
          title: e.set(titleId),
          status: hiveFormValues.status,
          finishedAt: e.datetime(hiveFormValues.date),
          rating: e.float32(hiveFormValues.rating),
          isFavorite: e.bool(hiveFormValues.isFavorite ?? false),
        })
        .run(client)
        .catch((error) => {
          throw new Error(error);
        });

      return insert.id;
    } else {
      const insert = await e
        .insert(e.Hive, {
          createdBy: e.global.CurrentUser,
          title: e.set(titleId),
          status: hiveFormValues.status,
        })
        .run(client)
        .catch((error) => {
          throw new Error(error);
        });

      return insert.id;
    }
  }

  console.log(hiveFormValues, titleFormValues, selectedTitleData);
}

async function getIMDBId(tmdbId: number, type: "MOVIE" | "SERIES") {
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
