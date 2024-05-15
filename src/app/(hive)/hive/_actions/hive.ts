"use server";

import e from "@edgedb/edgeql-js";
import { TitleType } from "@edgedb/edgeql-js/modules/default";
import { getPlaiceholder } from "plaiceholder";

import { env } from "@/env";
import { auth } from "@/lib/edgedb";
import { MultiSearch, SearchResult, SeriesDetails } from "@/types/tmdb";

import { HiveFormValues } from "../_components/add-title/stepper/steps/hive-form-step";
import { TitleFormValues } from "../_components/add-title/stepper/steps/title-form-step";

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

async function fetchSeriesData(tmdbId: number) {
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

  return data;
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
            addedBy: e.global.CurrentUser,
            title: e.set(titleToAdd),
            status: hiveFormValues.status,
          })
          .run(client)
          .catch((error) => {
            throw new Error(error);
          });

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
      const seriesData = await fetchSeriesData(selectedTitleData.id);

      // seriesData.seasons.forEach(async (details) => {
      //   if (details.season_number === 0) return;
      //   const season = details.season_number;
      //   const episodes = details.episode_count;
      //   const date = details.air_date;

      //   await e
      //     .insert(e.Season, {
      //       title: e.set(titleId),
      //       date: e.cal.local_date(date),
      //       season: e.int32(season),
      //       episodes: e.int32(episodes),
      //     })
      //     .run(client);
      // });

      const seasons = seriesData.seasons.map((details) => {
        return {
          season: details.season_number,
          episodes: details.episode_count,
          date: details.air_date,
        };
      });

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
          addedBy: e.global.CurrentUser,
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
