"use client";

import {
  CheckCircleIcon,
  ClapperboardIcon,
  FilmIcon,
  PlayCircleIcon,
} from "lucide-react";

import { type HiveProfile } from "@/app/(profile)/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  data: HiveProfile;
}

export default function StatsCards({ data }: Props) {
  const finishedTitles = data?.filter((hive) => hive.status === "FINISHED");

  const finishedTitlesThisYear = finishedTitles?.filter(
    (hive) =>
      hive.finishedAt &&
      new Date(hive.finishedAt).getFullYear() === new Date().getFullYear(),
  );

  const finishedMovies = finishedTitles?.filter(
    (hive) => hive.title.type === "MOVIE",
  );
  const finishedMoviesThisMonth = finishedTitles
    ?.filter((hive) => hive.title.type === "MOVIE")
    .filter(
      (hive) =>
        hive.finishedAt &&
        new Date(hive.finishedAt).getMonth() === new Date().getMonth(),
    );

  const finishedSeries = finishedTitles?.filter(
    (hive) => hive.title.type === "SERIES",
  );

  const finishedSeriesThisMonth = finishedTitles
    ?.filter((hive) => hive.title.type === "SERIES")
    .filter(
      (hive) =>
        hive.finishedAt &&
        new Date(hive.finishedAt).getMonth() === new Date().getMonth(),
    );

  const currentlyWatching = data?.filter((hive) => hive.status === "WATCHING");

  const currentWatchingMovies = currentlyWatching?.filter(
    (hive) => hive.title.type === "MOVIE",
  );

  const currentWatchingSeries = currentlyWatching?.filter(
    (hive) => hive.title.type === "SERIES",
  );

  const currentWatchingMoviesText =
    currentWatchingMovies.length === 0
      ? "0 movies"
      : `${currentWatchingMovies.length} ${currentWatchingMovies.length === 1 ? "movie" : "movies"}`;

  const currentWatchingSeriesText =
    currentWatchingSeries.length === 0
      ? "0 series"
      : `${currentWatchingSeries.length} ${currentWatchingSeries.length === 1 ? "series" : "series"}`;

  const finishedSeriesThisMonthText =
    finishedSeriesThisMonth.length === 0
      ? "0 series"
      : `${finishedSeriesThisMonth.length} ${finishedSeriesThisMonth.length === 1 ? "series" : "series"}`;

  const finishedMoviesThisMonthText =
    finishedMoviesThisMonth.length === 0
      ? "0 movies"
      : `${finishedMoviesThisMonth.length} ${finishedMoviesThisMonth.length === 1 ? "movie" : "movies"}`;

  const finishedTitlesThisYearText =
    finishedTitles.length === 0
      ? "0 titles"
      : `${finishedTitlesThisYear.length} ${finishedTitlesThisYear.length === 1 ? "title" : "titles"}`;

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
            {finishedTitlesThisYearText} finished in {new Date().getFullYear()}
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
            {finishedMoviesThisMonthText} finished this month
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
            {finishedSeriesThisMonthText} finished this month
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
            {currentWatchingMoviesText} and {currentWatchingSeriesText} in total
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
