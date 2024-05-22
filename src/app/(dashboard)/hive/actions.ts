"use server";

import { revalidatePath } from "next/cache";
import e, { type $infer } from "@edgedb/edgeql-js";
import { TitleType } from "@edgedb/edgeql-js/modules/default";
import { subDays } from "date-fns";
import { getPlaiceholder } from "plaiceholder";

import { env } from "@/env";
import { auth } from "@/lib/edgedb";
import { action, authAction } from "@/lib/safe-action";
import {
  type MovieDetails,
  type MultiSearch,
  type SeriesDetails,
} from "@/types/tmdb";

import {
  AddTitleToHiveSchema,
  DeleteTitleFromHiveSchema,
  FindTitleDetails,
  FindTitleSeasonsSchema,
  ProfileSetupFormSchema,
} from "./validations";

export const profileOnboarding = authAction(
  ProfileSetupFormSchema,
  async ({ username, name, status }) => {
    const client = auth.getSession().client;

    const user = await e
      .select(e.User, (user) => ({
        username: true,
        filter: e.op(user.username, "=", username),
      }))
      .run(client);

    if (user.length > 0) {
      return {
        success: false,
        error: {
          reason: "Username already taken, please try another one!",
        },
      };
    }

    await e
      .update(e.User, (user) => ({
        filter: e.op(user.email, "=", e.global.CurrentUser.email),
        set: {
          username: e.str_trim(username.toLocaleLowerCase()),
          name: e.str_trim(name),
          status: status,
        },
      }))
      .run(client);

    revalidatePath("/hive");
    return { success: true, data: { username } };
  },
);

export const deleteTitle = authAction(
  DeleteTitleFromHiveSchema,
  async ({ id }) => {
    const client = auth.getSession().client;

    const deleteTitle = await e
      .delete(e.Hive, (hive) => ({
        filter_single: e.op(
          e.op(hive.id, "=", e.uuid(id)),
          "and",
          e.op(hive.addedBy.id, "=", e.global.CurrentUser.id),
        ),
      }))
      .run(client);

    revalidatePath("/hive");
    return { success: true, data: { id: deleteTitle?.id } };
  },
);

export const findTitleSeasons = authAction(
  FindTitleSeasonsSchema,
  async ({ tmdbId }) => {
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

    const seasons = data.seasons
      .map((details) => ({
        season: details.season_number,
        episodes: details.episode_count,
        date: details.air_date,
      }))
      .filter((season) => season.season !== 0);

    return seasons;
  },
);

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

export async function fetchPosterBlur(path: string) {
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

  const seasons = data.seasons
    .map((details) => ({
      season: details.season_number,
      episodes: details.episode_count,
      date: details.air_date,
    }))
    .filter((season) => season.season !== 0);

  return seasons;
}

export async function fetchMovieDetails(tmdbId: number): Promise<MovieDetails> {
  const response = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${env.TMDB_API_KEY}`,
    },
  });

  const data = (await response.json()) as MovieDetails;

  if (!response.ok) {
    throw new Error("Failed to fetch movie details");
  }

  return data;
}

export const findTitleDetails = action(
  FindTitleDetails,
  async ({ tmdbId, type }) => {
    const result = await fetch(
      `https://api.themoviedb.org/3/${type}/${tmdbId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${env.TMDB_API_KEY}`,
        },
      },
    );

    if (!result.ok) {
      throw new Error("Failed to fetch title details");
    }

    if (type === "tv") {
      const data = (await result.json()) as SeriesDetails;

      return { ...data, type: "tv" };
    } else {
      const data = (await result.json()) as MovieDetails;

      return { ...data, type: "movie" };
    }
  },
);

async function updateTitle({
  tmdbId,
  type,
}: {
  tmdbId: number;
  type: "MOVIE" | "SERIES";
}) {
  const titleDetails = await findTitleDetails({
    tmdbId,
    type: type === "MOVIE" ? "movie" : "tv",
  });

  const data = titleDetails.data;

  if (!data) {
    throw new Error("Failed to fetch title details");
  }

  const TypeEnum = type === "MOVIE" ? TitleType.MOVIE : TitleType.SERIES;
  const name = data?.type === "movie" ? data.title : data.name;
  const release_date =
    data.type === "movie" ? data.release_date : data.first_air_date;
  const { overview, poster_path } = data;
  const genre_ids = data.genres.map((genre) => genre.id);
  const posterBlurhash = await fetchPosterBlur(
    `https://image.tmdb.org/t/p/original${poster_path}`,
  );

  const client = auth.getSession().client;

  await e
    .update(e.Title, (title) => ({
      filter_single: e.op(
        e.op(title.tmdbId, "=", e.int32(tmdbId)),
        "and",
        e.op(title.type, "=", TypeEnum),
      ),
      set: {
        name: e.str(name),
        description: e.str(overview),
        release_date: e.cal.local_date(release_date),
        poster: e.str(poster_path),
        posterBlur: posterBlurhash,
        runtime: data.type === "movie" ? e.int32(data.runtime) : undefined,
        rating: data.vote_average ? e.float32(data.vote_average) : undefined,
        genres: genre_ids,
      },
    }))
    .run(client);
}

export const addTitleHive = authAction(
  AddTitleToHiveSchema,
  async ({ hiveFormValues, titleFormValues }) => {
    const client = auth.getSession().client;
    const tmdbId = titleFormValues.tmdbId;
    const TypeEnum =
      titleFormValues.type === "movie" ? TitleType.MOVIE : TitleType.SERIES;
    const isTitleAdded = await e
      .select(e.Title, (title) => ({
        tmdbId: true,
        type: true,
        updatedAt: true,
        filter_single: e.op(
          e.op(title.tmdbId, "=", e.int32(tmdbId)),
          "and",
          e.op(title.type, "=", TypeEnum),
        ),
      }))
      .run(client);

    // If title isn't in title collection, add since if it's
    // not in the collection, nobody can have it yet in their hive.
    if (!isTitleAdded) {
      const titleDetails = await findTitleDetails({
        tmdbId: titleFormValues.tmdbId,
        type: titleFormValues.type,
      });

      const data = titleDetails.data;

      if (!data) {
        throw new Error("Failed to fetch title details");
      }

      const name = data?.type === "movie" ? data.title : data.name;
      const date =
        data.type === "movie" ? data.release_date : data.first_air_date;
      const type = data.type === "movie" ? "MOVIE" : "SERIES";
      const { overview, id, poster_path } = data;
      const genre_ids = data.genres.map((genre) => genre.id);
      const imdbId = await getIMDBId(id, type);
      const posterBlurhash = await fetchPosterBlur(
        `https://image.tmdb.org/t/p/original${poster_path}`,
      );

      const insertTitle = await e
        .insert(e.Title, {
          tmdbId: e.int32(id),
          name: e.str(name),
          description: e.str(overview),
          release_date: e.cal.local_date(date),
          poster: e.str(poster_path),
          posterBlur: posterBlurhash,
          type: TypeEnum,
          runtime: data.type === "movie" ? e.int32(data.runtime) : undefined,
          rating: data.vote_average ? e.float32(data.vote_average) : undefined,
          genres: genre_ids,
          imdbId: imdbId ?? undefined,
        })
        .run(client);

      if (data.type === "tv") {
        const titleId = e.select(e.Title, (title) => ({
          filter_single: e.op(title.id, "=", e.uuid(insertTitle.id)),
        }));

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
                  air_date: e.cast(e.cal.local_date, date),
                });
              },
            );
          },
        );

        const seasons = data.seasons
          .filter(
            (season) =>
              season.season_number !== 0 &&
              season.episode_count !== 0 &&
              season.air_date !== null,
          )
          .map((details) => ({
            season: details.season_number,
            episodes: details.episode_count,
            date: details.air_date,
          }));

        await query.run(client, {
          seasons,
        });
      }
    } else {
      // update title if last update has been more than 3 days ago
      if (isTitleAdded.updatedAt) {
        const updatedAt = isTitleAdded.updatedAt;
        const threeDaysAgo = subDays(new Date(), 1);
        if (updatedAt < threeDaysAgo) {
          await updateTitle({
            tmdbId: isTitleAdded.tmdbId,
            type: isTitleAdded.type,
          });
        }
      }
    }

    const isTitleInHive = await e
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

    if (isTitleInHive) {
      return {
        success: false,
        error: {
          reason: "Title is already added to your hive!",
        },
      };
    } else {
      const titleToAdd = e.select(e.Title, (title) => ({
        filter_single: e.op(
          e.op(title.tmdbId, "=", tmdbId),
          "and",
          e.op(title.type, "=", TypeEnum),
        ),
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

        return {
          success: true,
          data: insert.id,
        };
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

        return {
          success: true,
          data: insert.id,
        };
      }
    }
  },
);

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

export type HiveData = $infer<typeof getHiveDataQuery>;

const getHiveDataQuery = e.select(e.Hive, (hive) => ({
  ...e.Hive["*"],
  title: {
    ...e.Title["*"],
    seasons: {
      ...e.Season["*"],
    },
  },
  order_by: [
    {
      expression: hive.createdAt,
      direction: e.DESC,
    },
  ],
  filter: e.op(hive.addedBy.id, "=", e.global.CurrentUser.id),
}));

export async function getHiveData() {
  const client = auth.getSession().client;

  return await getHiveDataQuery.run(client);
}
