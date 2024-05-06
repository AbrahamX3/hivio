"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { format, formatDate } from "date-fns";
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  DotIcon,
  ExternalLinkIcon,
  SquareArrowOutUpRightIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTitleDetails } from "@/context/title-details-context";
import { genreOptions } from "@/lib/options";
import { cn } from "@/lib/utils";

import DeleteHiveTitle from "./delete-title";
import { HiveRowData } from "./hive-table/table-view";

const USD = Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumSignificantDigits: 3,
});

export default function TitleDetails({ data }: { data?: HiveRowData }) {
  const {
    setSelectedTitle,
    movieCredits,
    seriesCredits,
    selectedTitle,
    movieDetails,
    seriesDetails,
    isGetMovieDetailsPending,
    isGetSeriesDetailsPending,
    isGetMovieCreditsPending,
    isGetSeriesCreditsPending,
  } = useTitleDetails();

  function handleClose() {
    setSelectedTitle(null);
  }

  const genres = genreOptions
    .filter((genre) => data?.title.genres.includes(genre.value))
    .map((genre) => genre.label);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [selectedTitle]);

  console.log(movieDetails);

  return (
    <>
      <div id="scroll-view" ref={scrollRef}></div>
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col items-start bg-muted/50">
          <div className="grid gap-0.5">
            <CardTitle className="group flex items-center gap-2 text-lg">
              {data?.title.name}
              {data?.title.name && (
                <Button
                  size="icon"
                  variant="outline"
                  onClick={async () => {
                    toast.promise(
                      navigator.clipboard.writeText(data?.title.name),
                      {
                        loading: "Copying title name...",
                        success: "Title name copied to clipboard!",
                        error: "Failed to copy title name!",
                      },
                    );
                  }}
                  className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <CopyIcon className="h-3 w-3" />
                  <span className="sr-only">Copy Title Name</span>
                </Button>
              )}
            </CardTitle>
          </div>
          <div className="flex w-full items-center justify-between gap-1 align-middle">
            {data?.title.date && (
              <div className="flex flex-col align-middle text-sm text-muted-foreground">
                <span className="font-medium">Release Date</span>
                <span className="text-sm">
                  {formatDate(data?.title.date.toString(), "PPP")}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <TooltipProvider>
                {data?.id && <DeleteHiveTitle id={data?.id} />}
                {data?.title.imdbId || data?.title.tmdbId ? (
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="outline"
                            className="size-8"
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
                    <DropdownMenuContent align="end" className="w-fit">
                      {data?.title.tmdbId && (
                        <DropdownMenuItem asChild>
                          <a
                            href={`https://www.themoviedb.org/${data?.title.type === "MOVIE" ? "movie" : "tv"}/${data?.title.tmdbId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between gap-4"
                          >
                            View on TMDb
                            <ExternalLinkIcon className="size-3" />
                          </a>
                        </DropdownMenuItem>
                      )}
                      {data?.title.imdbId && (
                        <DropdownMenuItem asChild>
                          <a
                            className="flex items-center justify-between gap-4"
                            href={`https://www.imdb.com/title/${data?.title.imdbId}`}
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

                <DotIcon className="h-4 w-4 text-muted-foreground" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleClose}
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Close Panel</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-sm">
          <div className="grid gap-3">
            <div className="flex w-full justify-between gap-4">
              <div className="flex w-full flex-col justify-between align-middle">
                <h2 className="text-xl font-semibold">General Details</h2>
                <dl className="flex w-full flex-col justify-between gap-3">
                  <dt className="font-semibold text-muted-foreground">Type</dt>
                  <dd className="capitalize">
                    {data?.title.type?.toLocaleLowerCase()}
                  </dd>
                  <dt className="font-semibold text-muted-foreground">
                    Genres
                  </dt>
                  <dd>{genres.join(", ")}</dd>
                </dl>
              </div>
              {data?.title.poster && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Image
                      unoptimized
                      src={`https://image.tmdb.org/t/p/w154${data?.title.poster}`}
                      alt={data?.title.name}
                      width={154}
                      height={231}
                      className="h-40 w-auto cursor-pointer rounded-md transition-all hover:scale-105 lg:h-20 xl:h-40"
                    />
                  </DialogTrigger>
                  <DialogContent className="h-[90vh]">
                    <div className="max-h-[85vh] w-full p-6">
                      <Image
                        src={`https://image.tmdb.org/t/p/w780${data?.title.poster}`}
                        alt={data?.title.name}
                        unoptimized
                        width={780}
                        height={1170}
                        className="h-full rounded-md"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
          <Separator className="my-4" />
          {selectedTitle?.type === "MOVIE" ? (
            !movieCredits && isGetMovieCreditsPending ? (
              <Skeleton className="h-36 w-full animate-pulse flex-col items-center justify-center rounded-md border border-dashed p-8 font-semibold" />
            ) : (
              <div>
                <h2 className="pb-4 text-xl font-semibold">Meet the Cast</h2>
                <Carousel
                  className="xs:max-w-[300px] mx-auto w-full max-w-[380px] overflow-hidden sm:max-w-[400px] md:max-w-[600px]"
                  opts={{
                    align: "start",
                  }}
                  orientation="horizontal"
                >
                  <CarouselContent>
                    {movieCredits?.cast.map((cast) => (
                      <CarouselItem
                        key={cast.id}
                        className="basis-1/2 md:basis-1/4 lg:basis-11/12 xl:basis-1/2"
                      >
                        <div className="relative h-[400px] overflow-hidden rounded-lg sm:h-[300px]">
                          <Image
                            unoptimized
                            alt={cast.name}
                            className="aspect-[231/154] h-full w-full object-cover"
                            src={`https://image.tmdb.org/t/p/w200${cast.profile_path}`}
                            height={231}
                            width={154}
                          />
                          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-gray-900/80 to-transparent p-2">
                            <div className="flex flex-col justify-start gap-2">
                              <div className="flex flex-col items-start gap-[4px]">
                                <h3 className="text-balance text-xl font-bold text-white">
                                  {cast.name}
                                </h3>
                                <p className="text-balance text-sm text-foreground">
                                  {cast.character}
                                </p>
                              </div>
                              <a
                                className={cn(
                                  buttonVariants({
                                    size: "sm",
                                    variant: "outline",
                                  }),
                                  "group flex justify-between gap-4 align-middle",
                                )}
                                href={`https://www.themoviedb.org/person/${cast.id}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <span>View on TMDb</span>
                                <ExternalLinkIcon className="size-4 group-hover:hidden" />
                                <ArrowRightIcon className="hidden size-4 group-hover:block" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            )
          ) : !seriesCredits && isGetSeriesCreditsPending ? (
            <Skeleton className="h-36 w-full animate-pulse flex-col items-center justify-center rounded-md border border-dashed p-8 font-semibold" />
          ) : (
            <div>
              <h2 className="pb-4 text-xl font-semibold">Meet the Cast</h2>
              <Carousel
                className="xs:max-w-[300px] mx-auto w-full max-w-[380px] overflow-hidden sm:max-w-[400px] md:max-w-[600px]"
                opts={{
                  align: "start",
                }}
                orientation="horizontal"
              >
                <CarouselContent>
                  {seriesCredits?.cast.map((cast) => (
                    <CarouselItem
                      key={cast.id}
                      className="basis-1/2 md:basis-1/4 lg:basis-11/12 xl:basis-1/2"
                    >
                      <div className="relative h-[400px] overflow-hidden rounded-lg sm:h-[300px]">
                        <Image
                          unoptimized
                          alt={cast.name}
                          className="aspect-[231/154] h-full w-full object-cover"
                          src={`https://image.tmdb.org/t/p/w200${cast.profile_path}`}
                          height={231}
                          width={154}
                        />
                        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-gray-900/80 to-transparent p-2">
                          <div className="flex flex-col justify-start gap-2">
                            <div className="flex flex-col items-start gap-[4px]">
                              <h3 className="text-balance text-xl font-bold text-white">
                                {cast.name}
                              </h3>
                              <p className="text-balance text-sm text-foreground">
                                {cast.character}
                              </p>
                            </div>
                            <a
                              className={cn(
                                buttonVariants({
                                  size: "sm",
                                  variant: "outline",
                                }),
                                "group flex justify-between gap-4 align-middle",
                              )}
                              href={`https://www.themoviedb.org/person/${cast.id}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <span>View on TMDb</span>
                              <ExternalLinkIcon className="size-4 group-hover:hidden" />
                              <ArrowRightIcon className="hidden size-4 group-hover:block" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          )}
          <Separator className="my-4" />
          {selectedTitle?.type === "MOVIE" &&
            (movieDetails && !isGetMovieDetailsPending ? (
              <div className="grid gap-3">
                <h2 className="pb-2 text-xl font-semibold">
                  Production Companies
                </h2>
                <div className="flex flex-wrap items-center justify-center gap-4 rounded-md border border-dashed p-2">
                  {movieDetails?.production_companies.map(
                    (company) =>
                      company.logo_path && (
                        <a
                          key={company.id}
                          className={cn(
                            "group flex items-center justify-center p-1",
                          )}
                          href={`https://www.themoviedb.org/company/${company.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Image
                            unoptimized
                            src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                            alt={company.name}
                            width={154}
                            height={50}
                            className="h-auto w-16 opacity-70 grayscale transition duration-200 group-hover:opacity-100 dark:invert"
                          />
                        </a>
                      ),
                  )}
                </div>
              </div>
            ) : (
              <Skeleton className="h-36 w-full animate-pulse flex-col items-center justify-center rounded-md border border-dashed p-8 font-semibold" />
            ))}

          {selectedTitle?.type === "SERIES" &&
            (seriesDetails && !isGetSeriesDetailsPending ? (
              <div className="grid gap-3">
                <h2 className="pb-2 text-xl font-semibold">
                  Production Companies
                </h2>
                <div className="flex flex-wrap items-center justify-center gap-4 rounded-md border border-dashed p-2">
                  {seriesDetails?.production_companies.map(
                    (company) =>
                      company.logo_path && (
                        <a
                          key={company.id}
                          className={cn(
                            "group flex items-center justify-center p-1",
                          )}
                          href={`https://www.themoviedb.org/company/${company.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Image
                            unoptimized
                            src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                            alt={company.name}
                            width={154}
                            height={50}
                            className="h-auto w-16 opacity-70 grayscale transition duration-200 group-hover:opacity-100 dark:invert"
                          />
                        </a>
                      ),
                  )}
                </div>
              </div>
            ) : (
              <Skeleton className="h-36 w-full animate-pulse flex-col items-center justify-center rounded-md border border-dashed p-8 font-semibold" />
            ))}

          {selectedTitle?.type === "MOVIE" &&
            (movieDetails && !isGetMovieDetailsPending ? (
              <div>
                <Separator className="my-4" />
                <h2 className="pb-4 text-xl font-semibold">
                  Financial Details
                </h2>
                <ul className="grid gap-3">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Budget</span>
                    <span>
                      {movieDetails?.budget && USD.format(movieDetails?.budget)}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Revenue</span>
                    <span>
                      {movieDetails?.budget &&
                        USD.format(movieDetails?.revenue)}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Profit</span>
                    <span
                      className={cn(
                        movieDetails?.revenue - movieDetails?.budget >=
                          movieDetails?.budget
                          ? "text-green-500"
                          : "text-red-500",
                      )}
                    >
                      {movieDetails?.budget &&
                        USD.format(
                          movieDetails?.revenue - movieDetails?.budget,
                        )}
                    </span>
                  </li>
                </ul>
              </div>
            ) : (
              <Skeleton className="h-36 w-full animate-pulse flex-col items-center justify-center rounded-md border border-dashed p-8 font-semibold" />
            ))}
        </CardContent>
        <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
          {data?.title.updated && (
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold">Last Updated: </span>{" "}
              {format(data?.title.updated, "PPPP p")}
            </div>
          )}
          <Pagination className="ml-auto mr-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <Button size="icon" variant="outline" className="h-6 w-6">
                  <ChevronLeftIcon className="h-3.5 w-3.5" />
                  <span className="sr-only">Previous Order</span>
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button size="icon" variant="outline" className="h-6 w-6">
                  <ChevronRightIcon className="h-3.5 w-3.5" />
                  <span className="sr-only">Next Order</span>
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
    </>
  );
}
