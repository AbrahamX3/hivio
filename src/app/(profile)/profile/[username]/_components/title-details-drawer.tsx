import { useEffect, useRef } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { formatDate } from "date-fns";
import {
  ArrowRightIcon,
  CopyIcon,
  DotIcon,
  ExternalLinkIcon,
  SquareArrowOutUpRightIcon,
  XIcon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import {
  getMovieCredits,
  getMovieDetails,
  getSeriesCredits,
  getSeriesDetails,
} from "@/app/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useTitleDetails,
  type SelectedTitle,
} from "@/context/title-details-context";
import { genreOptions } from "@/lib/options";
import { cn } from "@/lib/utils";
import { type HiveRowData } from "@/types/hive";

interface Props {
  id: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  data: HiveRowData;
}

const USD = Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumSignificantDigits: 3,
});

export function TitleDetailsDrawer({ setOpen, open, data }: Props) {
  const { setSelectedTitle, selectedTitle } = useTitleDetails();

  const {
    execute: getMovieDetailsAction,
    status: movieDetailsStatus,
    result: movieDetailsResult,
    reset: resetMovieDetails,
  } = useAction(getMovieDetails, {
    onError: (error) => {
      toast.error("Error getting movie details", {
        description: JSON.stringify(error),
      });
    },
  });

  const {
    execute: getSeriesDetailsAction,
    status: seriesDetailsStatus,
    result: seriesDetailsResult,
    reset: resetSeriesDetails,
  } = useAction(getSeriesDetails, {
    onError: (error) => {
      toast.error("Error getting series details", {
        description: JSON.stringify(error),
      });
    },
  });

  const {
    execute: getSeriesCreditsAction,
    status: seriesCreditsStatus,
    result: seriesCreditsResult,
    reset: resetSeriesCredits,
  } = useAction(getSeriesCredits, {
    onError: (error) => {
      toast.error("Error getting series credits", {
        description: JSON.stringify(error),
      });
    },
  });

  const {
    execute: getMovieCreditsAction,
    status: movieCreditsStatus,
    result: movieCreditsResult,
    reset: resetMovieCredits,
  } = useAction(getMovieCredits, {
    onError: (error) => {
      toast.error("Error getting movie credits", {
        description: JSON.stringify(error),
      });
    },
  });

  function handleClose() {
    setSelectedTitle(null);
    setOpen(false);
  }

  const pathname = usePathname();
  const username = pathname.split("/")[2];

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

  useEffect(() => {
    function handleReset() {
      resetMovieDetails();
      resetSeriesDetails();
      resetMovieCredits();
      resetSeriesCredits();
    }

    function handleSelectedTitle(value: SelectedTitle | null) {
      setSelectedTitle(value);
      handleReset();

      if (value?.type === "MOVIE") {
        getMovieDetailsAction({
          tmdbId: value.tmdbId,
        });

        getMovieCreditsAction({
          tmdbId: value.tmdbId,
        });
      } else if (value?.type === "SERIES") {
        getSeriesDetailsAction({
          tmdbId: value.tmdbId,
        });

        getSeriesCreditsAction({
          tmdbId: value.tmdbId,
        });
      }

      return value;
    }

    if (selectedTitle) {
      handleSelectedTitle(selectedTitle);
    }
  }, [
    getMovieCreditsAction,
    getMovieDetailsAction,
    getSeriesCreditsAction,
    getSeriesDetailsAction,
    resetMovieCredits,
    resetMovieDetails,
    resetSeriesCredits,
    resetSeriesDetails,
    selectedTitle,
    setSelectedTitle,
  ]);

  const isDone =
    selectedTitle?.type === "MOVIE"
      ? movieCreditsStatus === "hasSucceeded" &&
        movieDetailsStatus === "hasSucceeded"
      : seriesCreditsStatus === "hasSucceeded" &&
        seriesDetailsStatus === "hasSucceeded";

  if (!selectedTitle && isDone) return null;

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerContent
        direction="right"
        className="left-auto right-0 top-0 mr-2 mt-0 h-screen w-full rounded-none pb-4 md:w-[600px]"
      >
        <div className="mx-auto grid w-full gap-0.5 px-5 pt-6">
          <DrawerTitle className="group flex items-center gap-5 align-middle">
            <span className="w-5/6 text-2xl">{data?.title.name}</span>
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
                className="size-8 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <CopyIcon className="h-3 w-3" />
                <span className="sr-only">Copy Title Name</span>
              </Button>
            )}
          </DrawerTitle>
        </div>
        <div className="mx-auto flex w-full items-center justify-between gap-1 px-5 pb-4 pt-2 align-middle">
          {data?.title.date && (
            <div className="flex flex-col align-middle text-sm text-muted-foreground">
              <span className="font-medium">Release Date</span>
              <span className="text-lg font-semibold">
                {formatDate(data?.title.date.toString(), "PPP")}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <TooltipProvider>
              {data?.title.imdbId ?? data?.title.tmdbId ? (
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

              <DotIcon className="size-4 text-muted-foreground" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleClose}
                    size="icon"
                    variant="outline"
                    className="size-8"
                  >
                    <XIcon className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close Panel</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <ScrollArea className="h-screen">
          <div className="mx-auto w-full p-5">
            <div className="grid gap-3">
              <div className="flex w-full justify-between gap-4">
                <div className="flex w-full flex-col justify-between align-middle">
                  <h2 className="text-xl font-semibold">General Details</h2>
                  <dl className="flex w-full flex-col justify-between gap-3">
                    <dt className="font-semibold text-muted-foreground">
                      Type
                    </dt>
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
                        src={`https://image.tmdb.org/t/p/w500${data?.title.poster}`}
                        alt={data?.title.name}
                        blurDataURL={data.title.posterBlur ?? ""}
                        placeholder="blur"
                        width={154}
                        height={231}
                        className="h-40 w-auto cursor-pointer rounded-md transition-all hover:scale-105 lg:h-20 xl:h-40"
                      />
                    </DialogTrigger>
                    <DialogContent className="h-[90vh]">
                      <div className="max-h-[85vh] w-full p-6">
                        <Image
                          src={`https://image.tmdb.org/t/p/original${data?.title.poster}`}
                          alt={data?.title.name}
                          blurDataURL={data.title.posterBlur ?? ""}
                          placeholder="blur"
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
              <div className="w-full py-4">
                <h4 className="pb-2 text-xl font-semibold">Description</h4>
                <p className="w-full text-pretty text-sm leading-relaxed tracking-wide">
                  {data?.title.description}
                </p>
              </div>
              <div className="flex w-full flex-col justify-between align-middle">
                <h4 className="pb-2 text-xl font-semibold">Rating</h4>
                <dl className="flex w-full justify-between gap-3">
                  <dt className="font-semibold text-muted-foreground">
                    @{username}&apos;s Rating
                  </dt>
                  <dd className="capitalize">
                    {data?.rating?.toFixed(1) ?? 0} / 10
                  </dd>
                  <dt className="font-semibold text-muted-foreground">
                    Public Rating
                  </dt>
                  <dd>
                    {selectedTitle?.type === "MOVIE"
                      ? movieDetailsResult.data?.vote_average.toFixed(1) ?? 0
                      : movieDetailsResult.data?.vote_average.toFixed(1) ??
                        0}{" "}
                    / 10
                  </dd>
                </dl>
              </div>
            </div>
            <Separator className="my-4" />
            {selectedTitle?.type === "MOVIE" ? (
              !movieDetailsResult.data && movieDetailsStatus === "executing" ? (
                <Skeleton className="h-36 w-full animate-pulse flex-col items-center justify-center rounded-md border border-dashed p-8 font-semibold" />
              ) : (
                <div>
                  <h2 className="pb-4 text-xl font-semibold">Meet the Cast</h2>
                  <Carousel
                    className="mx-auto w-full max-w-[380px] overflow-hidden xs:max-w-[300px] sm:max-w-[400px] md:max-w-[550px]"
                    opts={{
                      align: "start",
                    }}
                    orientation="horizontal"
                  >
                    <CarouselContent>
                      {movieCreditsResult.data?.cast.map((cast) => (
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
            ) : !seriesCreditsResult.data &&
              seriesCreditsStatus === "executing" ? (
              <Skeleton className="h-36 w-full animate-pulse flex-col items-center justify-center rounded-md border border-dashed p-8 font-semibold" />
            ) : (
              <div>
                <h2 className="pb-4 text-xl font-semibold">Meet the Cast</h2>
                <Carousel
                  className="mx-auto w-full max-w-[380px] overflow-hidden xs:max-w-[300px] sm:max-w-[400px] md:max-w-[550px]"
                  opts={{
                    align: "start",
                  }}
                  orientation="horizontal"
                >
                  <CarouselContent>
                    {seriesCreditsResult.data?.cast.map((cast) => (
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
              (movieDetailsResult.data &&
              movieDetailsStatus === "hasSucceeded" &&
              movieDetailsResult.data?.production_companies.length > 0 ? (
                <div className="grid gap-3">
                  <h2 className="pb-2 text-xl font-semibold">
                    Production Companies
                  </h2>
                  <div className="flex flex-wrap items-center justify-center gap-4 rounded-md border border-dashed p-2">
                    {movieDetailsResult.data?.production_companies.map(
                      (company) =>
                        company.logo_path ? (
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
                        ) : (
                          <a
                            key={company.id}
                            className={cn(
                              "group flex items-center justify-center p-1",
                            )}
                            href={`https://www.themoviedb.org/company/${company.id}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span className="text-sm opacity-70 transition duration-200 group-hover:opacity-100">
                              {company.name}
                            </span>
                          </a>
                        ),
                    )}
                  </div>
                </div>
              ) : (
                <Skeleton className="h-36 w-full animate-pulse flex-col items-center justify-center rounded-md border border-dashed p-8 font-semibold" />
              ))}
            {selectedTitle?.type === "SERIES" &&
              (seriesDetailsResult.data &&
              seriesDetailsStatus === "hasSucceeded" &&
              seriesDetailsResult.data?.production_companies.length > 0 ? (
                <div className="grid gap-3">
                  <h2 className="pb-2 text-xl font-semibold">
                    Production Companies
                  </h2>
                  <div className="flex flex-wrap items-center justify-center gap-4 rounded-md border border-dashed p-2">
                    {seriesDetailsResult.data?.production_companies.map(
                      (company) =>
                        company.logo_path ? (
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
                        ) : (
                          <a
                            key={company.id}
                            className={cn(
                              "group flex items-center justify-center p-1",
                            )}
                            href={`https://www.themoviedb.org/company/${company.id}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span className="text-sm opacity-70 transition duration-200 group-hover:opacity-100">
                              {company.name}
                            </span>
                          </a>
                        ),
                    )}
                  </div>
                </div>
              ) : (
                <Skeleton className="h-36 w-full animate-pulse flex-col items-center justify-center rounded-md border border-dashed p-8 font-semibold" />
              ))}
            {selectedTitle?.type === "MOVIE" &&
              (movieDetailsResult.data &&
              movieDetailsStatus === "hasSucceeded" ? (
                <div>
                  <Separator className="my-4" />
                  <h2 className="pb-4 text-xl font-semibold">
                    Financial Details
                  </h2>
                  <ul className="grid gap-3">
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Budget</span>
                      <span>
                        {movieDetailsResult.data?.budget &&
                          USD.format(movieDetailsResult.data?.budget)}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Revenue</span>
                      <span>
                        {movieDetailsResult.data?.revenue &&
                          USD.format(movieDetailsResult.data?.revenue)}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Profit</span>
                      <span
                        className={cn(
                          movieDetailsResult.data?.revenue -
                            movieDetailsResult.data?.budget >=
                            movieDetailsResult.data?.budget
                            ? "text-green-500"
                            : "text-red-500",
                        )}
                      >
                        {movieDetailsResult.data?.budget &&
                          USD.format(
                            movieDetailsResult.data?.revenue -
                              movieDetailsResult.data?.budget,
                          )}
                      </span>
                    </li>
                  </ul>
                </div>
              ) : (
                <Skeleton className="h-36 w-full animate-pulse flex-col items-center justify-center rounded-md border border-dashed p-8 font-semibold" />
              ))}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
