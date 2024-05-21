"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type UserSession } from "@/types/auth";

import { type HiveData } from "../actions";
import AddTitleToHive from "./add-title/add-to-hive";

interface DashboardHeaderProps {
  user: UserSession;
  hive: HiveData;
}

export default function DashboardHeader({ user, hive }: DashboardHeaderProps) {
  const currentlyWatching = hive?.filter((hive) => hive.status === "WATCHING");
  const finishedTitles = hive?.filter((hive) => hive.status === "FINISHED");

  const finishedMoviesThisMonth = finishedTitles
    ?.filter((hive) => hive.title.type === "MOVIE")
    .filter(
      (hive) =>
        hive.finishedAt &&
        new Date(hive.finishedAt).getMonth() === new Date().getMonth(),
    );

  const finishedSeriesThisMonth = finishedTitles
    ?.filter((hive) => hive.title.type === "SERIES")
    .filter(
      (hive) =>
        hive.finishedAt &&
        new Date(hive.finishedAt).getMonth() === new Date().getMonth(),
    );

  const currentWatchingMovies = currentlyWatching?.filter(
    (hive) => hive.title.type === "MOVIE",
  );

  const currentWatchingSeries = currentlyWatching?.filter(
    (hive) => hive.title.type === "SERIES",
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
      <Card className="sm:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle>Your Hive Dashboard</CardTitle>
          <CardDescription className="max-w-lg text-balance leading-relaxed">
            Your go-to hub for tracking your movies and series. Store, manage,
            and track your favorite titles.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <AddTitleToHive user={user} />
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Currently Watching</CardDescription>
          <CardTitle className="text-4xl">
            {currentlyWatching.length}{" "}
            {currentlyWatching.length > 1 ? "titles" : "title"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="flex-1 text-xs text-muted-foreground">
            Currently watching {currentWatchingMovies.length}{" "}
            {currentWatchingMovies.length > 1 ? "movies" : "movie"} and{" "}
            {currentWatchingSeries.length}{" "}
            {currentWatchingSeries.length > 1 ? "series" : "series"} in total
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Finished Titles</CardDescription>
          <CardTitle className="text-4xl">
            {finishedTitles.length}{" "}
            {finishedTitles.length > 1 ? "titles" : "title"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {finishedSeriesThisMonth.length}{" "}
            {finishedSeriesThisMonth.length > 1 ? "series" : "series"} finished
            this month and {finishedMoviesThisMonth.length}{" "}
            {finishedMoviesThisMonth.length > 1 ? "movies" : "movie"} finished
            this month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
