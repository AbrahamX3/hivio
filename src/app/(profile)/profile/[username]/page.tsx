import { Suspense } from "react";
import { type Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ExternalLinkIcon, SquareArrowOutUpRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { convertMinutesToHrMin } from "@/lib/utils";

import { hiveMetadataInfo, hiveProfile, type HiveProfile } from "../../actions";
import { EmptyCard } from "./_components/empty-card";
import Follow from "./_components/follow/follow";
import { ProfileHeader } from "./_components/follow/profile-header";
import StatsCards from "./_components/stats-cards";
import TableTabs from "./_components/table-tabs";
import ViewDetailsButton from "./_components/view-details-button";

interface Props {
  params: { username: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const username = params.username;

  const { data } = await hiveMetadataInfo({ username });

  if (!data?.success && data) {
    return {
      title: "User not found",
    };
  }

  const title = `${data?.data.user.name} (@${data?.data.user.username})`;

  return {
    title,
  };
}

export default async function PublicUserProfile({ params }: Props) {
  const result = await hiveProfile({ username: params.username });

  if (!result.data?.success) {
    notFound();
  }

  const { hive, user } = result.data?.data;

  if (!user) {
    notFound();
  }

  const currentlyWatching = hive?.filter((hive) => hive.status === "WATCHING");

  function calculateProgress(hive: HiveProfile[0]) {
    const currentSeasonNumber = hive.currentSeason ?? 0;
    const currentEpisodeNumber = hive.currentEpisode ?? 0;
    const currentTitle = hive.title;

    const totalEpisodes = currentTitle.seasons.reduce(
      (acc, season) => acc + season.episodes,
      0,
    );

    let episodesWatched = 0;
    for (const season of currentTitle.seasons) {
      if (season.season < currentSeasonNumber) {
        episodesWatched += season.episodes;
      } else if (season.season === currentSeasonNumber) {
        episodesWatched += currentEpisodeNumber;
        break;
      }
    }

    const progress = (episodesWatched / totalEpisodes) * 100;

    return progress;
  }

  return (
    <>
      <div className="flex w-full items-center justify-between align-middle">
        <ProfileHeader
          avatar={user?.avatar}
          name={user?.name}
          username={user?.username}
          joinedDate={user?.createdAt}
        />
        {user.username && <Follow hiveUserProfile={user} />}
      </div>
      <StatsCards data={JSON.parse(JSON.stringify(hive)) as HiveProfile} />
      <h3 className="text-2xl font-semibold">Currently Watching</h3>
      <Suspense fallback={<div>Loading...</div>}>
        {currentlyWatching?.length > 0 ? (
          <div className="w-full rounded-md border border-dashed p-4">
            <div className="lg:min-w-5xl mx-auto max-w-lg md:max-w-2xl lg:max-w-[83rem]">
              <Carousel>
                <CarouselContent>
                  {currentlyWatching?.map((hive) => (
                    <CarouselItem
                      key={hive.id}
                      className="relative sm:basis-2/4 md:basis-1/4 lg:basis-1/3"
                    >
                      <Card>
                        <CardContent className="flex aspect-[500/750] items-center justify-center p-0">
                          <Image
                            unoptimized
                            loading="lazy"
                            blurDataURL={hive.title.posterBlur ?? ""}
                            placeholder="blur"
                            alt={hive.title.name}
                            className="aspect-[2/3] w-full rounded-t-lg object-cover"
                            src={`https://image.tmdb.org/t/p/original${hive.title.poster}`}
                            height={750}
                            width={500}
                          />
                        </CardContent>
                        <TooltipProvider>
                          <CardFooter className="relative h-full w-full flex-col gap-4 pt-6">
                            <div className="flex w-full items-center gap-2 justify-self-start align-middle">
                              <Badge>{hive.title.type}</Badge>
                              <Badge variant="outline">
                                {hive.title.release_date.year}
                              </Badge>
                            </div>
                            <div className="flex w-full items-center justify-between">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="line-clamp-1 w-2/3 text-sm font-medium">
                                    {hive.title.name}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-sm font-medium">
                                    {hive.title.name}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                              <div className="flex items-center gap-2">
                                <ViewDetailsButton
                                  data={
                                    JSON.parse(
                                      JSON.stringify(hive),
                                    ) as HiveProfile[0]
                                  }
                                />
                                {hive?.title.imdbId ?? hive?.title.tmdbId ? (
                                  <DropdownMenu>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            size="icon"
                                            className="size-8"
                                            variant="outline"
                                          >
                                            <SquareArrowOutUpRightIcon className="size-3.5" />
                                            <span className="sr-only">
                                              View Title on External Platforms
                                            </span>
                                          </Button>
                                        </DropdownMenuTrigger>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        View Title on External Platforms
                                      </TooltipContent>
                                    </Tooltip>
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-fit"
                                    >
                                      {hive?.title.tmdbId && (
                                        <DropdownMenuItem asChild>
                                          <a
                                            href={`https://www.themoviedb.org/${hive?.title.type === "MOVIE" ? "movie" : "tv"}/${hive?.title.tmdbId}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-between gap-4"
                                          >
                                            View on TMDb
                                            <ExternalLinkIcon className="size-3" />
                                          </a>
                                        </DropdownMenuItem>
                                      )}
                                      {hive?.title.imdbId && (
                                        <DropdownMenuItem asChild>
                                          <a
                                            className="flex items-center justify-between gap-4"
                                            href={`https://www.imdb.com/title/${hive?.title.imdbId}`}
                                            target="_blank"
                                            rel="noreferrer"
                                          >
                                            View on IMDb
                                            <ExternalLinkIcon className="size-3" />
                                          </a>
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                ) : null}
                              </div>
                            </div>
                            {hive.title.type === "SERIES" ? (
                              <div className="flex h-4 w-full items-center justify-between gap-2 text-center align-middle">
                                <div className="flex items-center gap-2 align-middle text-xs">
                                  <span className="font-medium">
                                    S{hive.currentSeason}E{hive.currentEpisode}
                                  </span>
                                  <span className="text-muted-foreground">
                                    (
                                    {calculateProgress(
                                      JSON.parse(
                                        JSON.stringify(hive),
                                      ) as HiveProfile[0],
                                    ).toFixed(2)}
                                    %)
                                  </span>
                                </div>
                                <Progress
                                  className="h-2"
                                  value={calculateProgress(
                                    JSON.parse(
                                      JSON.stringify(hive),
                                    ) as HiveProfile[0],
                                  )}
                                />
                              </div>
                            ) : (
                              <div className="flex h-4 w-full items-center justify-center gap-2 text-center align-middle text-xs">
                                <span className="font-semibold">Runtime: </span>
                                <span>
                                  {hive.title.runtime
                                    ? convertMinutesToHrMin(hive.title.runtime)
                                    : "Unknown"}
                                </span>
                              </div>
                            )}
                          </CardFooter>
                        </TooltipProvider>
                      </Card>
                    </CarouselItem>
                  ))}

                  {currentlyWatching?.length === 1 ? (
                    <>
                      <EmptyCard mobile={false} tablet={true} desktop={true} />
                      <EmptyCard mobile={false} tablet={true} desktop={true} />
                      <EmptyCard mobile={false} tablet={true} desktop={false} />
                    </>
                  ) : currentlyWatching?.length == 2 ? (
                    <>
                      <EmptyCard mobile={false} tablet={false} desktop={true} />
                    </>
                  ) : null}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </div>
        ) : (
          <div className="flex w-full items-center justify-center rounded-md border p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span> @{user.username}</span> is currently not watching anything
            </div>
          </div>
        )}
      </Suspense>
      <TableTabs data={JSON.parse(JSON.stringify(hive)) as HiveProfile} />
    </>
  );
}
