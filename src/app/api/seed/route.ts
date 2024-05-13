import e from "@edgedb/edgeql-js";
import { TitleType } from "@edgedb/edgeql-js/modules/default";

import { db } from "@/lib/edgedb";

import { titles } from "./data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") as string;

  const user = e.select(e.User, (user) => ({
    filter_single: e.op(user.username, "=", e.str(username)),
  }));

  const addedTitles = titles.map(async (title) => {
    const tmdbId = title.tmdbId;
    const TypeEnum =
      title.type === "MOVIE" ? TitleType.MOVIE : TitleType.SERIES;

    const isTitleAdded = await e
      .select(e.Title, (title) => ({
        filter_single: e.op(
          e.op(title.tmdbId, "=", e.int32(tmdbId)),
          "and",
          e.op(title.type, "=", TypeEnum),
        ),
      }))
      .run(db);

    if (isTitleAdded) {
      const isTitleInUserHive = await e
        .select(e.Hive, (hive) => ({
          filter_single: e.op(
            e.op(hive.title.tmdbId, "=", tmdbId),
            "and",
            e.op(hive.addedBy.username, "=", e.str(username)),
          ),
        }))
        .run(db);

      if (isTitleInUserHive) {
        return isTitleInUserHive.id;
      } else {
        const titleToAdd = e.select(e.Title, (title) => ({
          filter_single: e.op(title.tmdbId, "=", e.int32(tmdbId)),
        }));

        const insert = await e
          .insert(e.Hive, {
            addedBy: user,
            isFavorite: false,
            title: e.set(titleToAdd),
            status: title.status,
          })
          .run(db);

        return insert.id;
      }
    } else {
      const titleId = e.insert(e.Title, {
        tmdbId: e.int32(title.tmdbId),
        name: e.str(title.title),
        description: e.str(title.description),
        date: e.cal.local_date(title.date),
        poster: e.str(title.poster),
        type: TypeEnum,
        genres: title.genres,
        imdbId: title.imdbId ?? null,
      });

      const insert = await e
        .insert(e.Hive, {
          addedBy: user,
          title: e.set(titleId),
          status: title.status,
          isFavorite: false,
        })
        .run(db);

      return insert.id;
    }
  });

  return Response.json({ addedTitles });
}
