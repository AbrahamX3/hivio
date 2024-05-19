"use client";

import {
  CheckCircleIcon,
  ClapperboardIcon,
  FilmIcon,
  PlayCircleIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type HiveRowData } from "@/types/hive";

interface Props {
  data: HiveRowData[];
}

export default function StatsCards({ data }: Props) {
  const finishedTitles = data?.filter((hive) => hive.status === "FINISHED");
  const finishedTitlesTotal = data?.filter(
    (hive) => hive.status === "FINISHED",
  );

  const finishedMovies = data?.filter(
    (hive) => hive.status === "FINISHED" && hive.title.type === "MOVIE",
  );
  const finishedMoviesThisMonth = data
    ?.filter(
      (hive) => hive.status === "FINISHED" && hive.title.type === "MOVIE",
    )
    .filter(
      (hive) =>
        hive.finishedAt &&
        new Date(hive.finishedAt).getMonth() === new Date().getMonth(),
    );

  const finishedSeries = data?.filter(
    (hive) => hive.status === "FINISHED" && hive.title.type === "SERIES",
  );
  const finishedSeriesThisMonth = data
    ?.filter(
      (hive) => hive.status === "FINISHED" && hive.title.type === "SERIES",
    )
    .filter(
      (hive) =>
        hive.finishedAt &&
        new Date(hive.finishedAt).getMonth() === new Date().getMonth(),
    );

  const currentlyWatching = data?.filter((hive) => hive.status === "WATCHING");

  const currentWatchingMovies = data
    ?.filter(
      (hive) => hive.status === "WATCHING" && hive.title.type === "MOVIE",
    )
    .filter(
      (hive) =>
        hive.finishedAt &&
        new Date(hive.finishedAt)?.getMonth() === new Date().getMonth(),
    );

  const currentWatchingSeries = data
    ?.filter(
      (hive) => hive.status === "WATCHING" && hive.title.type === "SERIES",
    )
    .filter((hive) => hive.finishedAt?.getMonth() === new Date().getMonth());

  return (
    <div className="grid w-full gap-4 pt-6 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Finished Titles</CardTitle>
          <CheckCircleIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{finishedTitles.length}</div>
          <p className="text-xs text-muted-foreground">
            {finishedTitlesTotal.length} titles finished in total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Finished Movies</CardTitle>
          <FilmIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{finishedMovies.length}</div>
          <p className="text-xs text-muted-foreground">
            {finishedMoviesThisMonth.length} movies finished this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Finished Series</CardTitle>
          <ClapperboardIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{finishedSeries.length}</div>
          <p className="text-xs text-muted-foreground">
            {finishedSeriesThisMonth.length} series finished this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Currently Watching
          </CardTitle>
          <PlayCircleIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentlyWatching.length}</div>
          <p className="text-xs text-muted-foreground">
            {currentWatchingMovies.length} movies and{" "}
            {currentWatchingSeries.length} series
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
