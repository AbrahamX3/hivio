"use server";

import e from "@edgedb/edgeql-js";
import { TitleType } from "@edgedb/edgeql-js/modules/default";
import { getPlaiceholder } from "plaiceholder";

import { env } from "@/env";
import { auth } from "@/lib/edgedb";
import {
  type MultiSearch,
  type SearchResult,
  type SeriesDetails,
} from "@/types/tmdb";

import { type HiveFormValues } from "../_components/add-title/stepper/steps/hive-form-step";
import { type TitleFormValues } from "../_components/add-title/stepper/steps/title-form-step";

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

async function fetchPosterBlur(path: string) {
  const buffer = await fetch(path).then(async (res) =>
    Buffer.from(await res.arrayBuffer()),
  );

  const { base64 } = await getPlaiceholder(buffer);

  return base64;
}

export interface SeasonData {
  season: number;
  episodes: number;
  date: string;
}

export async function fetchSeriesData(tmdbId: number): Promise<SeasonData[]> {
  const response = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${env.TMDB_API_KEY}`,
    },
  });

  const data = (await response.json()) as SeriesDetails;

  if (!response.ok) {
    throw new Error("Failed to fetch series data");
  }

  const seasons = data.seasons.map((details) => ({
    season: details.season_number,
    episodes: details.episode_count,
    date: details.air_date,
  }));

  return seasons;
}

export async function addTitleToHive({
  hiveFormValues,
  selectedTitleData,
  titleFormValues,
}: AddTitleProps) {
  const client = auth.getSession().client;
  const tmdbId = titleFormValues.tmdbId;
  const TypeEnum =
    selectedTitleData.media_type === "movie"
      ? TitleType.MOVIE
      : TitleType.SERIES;
  const isTitleAdded = await e
    .select(e.Title, (title) => ({
      filter_single: e.op(
        e.op(title.tmdbId, "=", e.int32(tmdbId)),
        "and",
        e.op(title.type, "=", TypeEnum),
      ),
    }))
    .run(client);

  if (isTitleAdded) {
    const isTitleInUserHive = await e
      .select(e.Hive, (hive) => ({
        filter_single: e.op(
          e.op(
            e.op(hive.title.tmdbId, "=", tmdbId),
            "and",
            e.op(hive.title.type, "=", TypeEnum),
          ),
          "and",
          e.op(hive.addedBy.id, "=", e.global.CurrentUser.id),
        ),
      }))
      .run(client);

    if (isTitleInUserHive) {
      throw new Error("Title is already added to your hive!");
    } else {
      const titleToAdd = e.select(e.Title, (title) => ({
        filter_single: e.op(title.tmdbId, "=", e.int32(tmdbId)),
      }));

      const status = hiveFormValues.status;

      if (status === "FINISHED") {
        const insert = await e
          .insert(e.Hive, {
            addedBy: e.global.CurrentUser,
            title: e.set(titleToAdd),
            status: hiveFormValues.status,
            finishedAt: hiveFormValues.finishedAt
              ? e.datetime(hiveFormValues.finishedAt)
              : undefined,
            startedAt: hiveFormValues.startedAt
              ? e.datetime(hiveFormValues.startedAt)
              : undefined,
            currentEpisode: hiveFormValues.currentEpisode,
            currentSeason: hiveFormValues.currentSeason,
            rating: e.float32(hiveFormValues.rating),
            isFavorite: e.bool(hiveFormValues.isFavorite ?? false),
          })
          .run(client);

        return insert.id;
      } else {
        const insert = await e
          .insert(e.Hive, {
            addedBy: e.global.CurrentUser,
            title: e.set(titleToAdd),
            currentEpisode: hiveFormValues.currentEpisode,
            currentSeason: hiveFormValues.currentSeason,
            status: hiveFormValues.status,
          })
          .run(client);

        return insert.id;
      }
    }
  } else {
    const name =
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

    const posterBlur = await fetchPosterBlur(
      `https://image.tmdb.org/t/p/original${selectedTitleData.poster_path}`,
    );

    const insertTitle = await e
      .insert(e.Title, {
        tmdbId: e.int32(id),
        name: e.str(name),
        description: e.str(overview),
        date: e.cal.local_date(date),
        poster: e.str(selectedTitleData.poster_path),
        posterBlur: posterBlur,
        type: TypeEnum,
        genres: genre_ids,
        imdbId: imdbId ?? null,
      })
      .run(client);

    const titleId = e.select(e.Title, (title) => ({
      filter_single: e.op(title.id, "=", e.uuid(insertTitle.id)),
    }));

    if (type === "SERIES") {
      const seasons = await fetchSeriesData(selectedTitleData.id);

      const query = e.params(
        {
          seasons: e.array(
            e.tuple({
              season: e.int32,
              episodes: e.int32,
              date: e.str,
            }),
          ),
        },
        ({ seasons }) => {
          return e.for(
            e.array_unpack(seasons),
            ({ date, season, episodes }) => {
              return e.insert(e.Season, {
                title: e.set(titleId),
                season: season,
                episodes: episodes,
                date: e.cast(e.cal.local_date, date),
              });
            },
          );
        },
      );

      await query.run(client, {
        seasons,
      });
    }

    const status = hiveFormValues.status;

    if (status === "FINISHED") {
      const insert = await e
        .insert(e.Hive, {
          addedBy: e.global.CurrentUser,
          title: e.set(titleId),
          status: hiveFormValues.status,
          finishedAt: hiveFormValues.finishedAt
            ? e.datetime(hiveFormValues.finishedAt)
            : undefined,
          startedAt: hiveFormValues.startedAt
            ? e.datetime(hiveFormValues.startedAt)
            : undefined,
          currentEpisode: hiveFormValues.currentEpisode,
          currentSeason: hiveFormValues.currentSeason,
          rating: e.float32(hiveFormValues.rating),
          isFavorite: e.bool(hiveFormValues.isFavorite ?? false),
        })
        .run(client);

      return insert.id;
    } else {
      const insert = await e
        .insert(e.Hive, {
          addedBy: e.global.CurrentUser,
          title: e.set(titleId),
          currentEpisode: hiveFormValues.currentEpisode,
          currentSeason: hiveFormValues.currentSeason,
          status: hiveFormValues.status,
        })
        .run(client);

      return insert.id;
    }
  }
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
