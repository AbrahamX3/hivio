"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, tmdbImageLoader } from "@/lib/utils";
import { useAction } from "convex/react";
import { ChevronDown, ExternalLink, Play, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";

type TitleData = {
  name: string;
  posterUrl?: string;
  backdropUrl?: string;
  description?: string;
  directors?: string[];
  tmdbId: number;
  mediaType: "MOVIE" | "SERIES";
  releaseDate?: string;
  genres?: string;
};

interface TitleDetailsDialogProps {
  title: TitleData;
  triggerImage?: {
    width: number;
    height: number;
    className?: string;
    loading?: "eager" | "lazy";
  };
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAddToWatchlist?: (tmdbId: number) => void | Promise<void>;
  showAddToWatchlist?: boolean;
}

type DetailedInfo = {
  runtime: number | null;
  seasons: Array<{
    seasonNumber: number;
    episodeCount: number;
    name: string;
    airDate: string | null;
  }> | null;
  directors: string[];
  description: string | null;
  imdbId: string | null;
};

type WatchProvider = {
  logo_path: string;
  provider_name: string;
};

export function TitleDetailsDialog({
  title,
  triggerImage,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onAddToWatchlist,
  showAddToWatchlist = false,
}: TitleDetailsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(
    new Set()
  );
  const [seasonEpisodes, setSeasonEpisodes] = useState<
    Record<
      number,
      Array<{
        episodeNumber: number;
        name: string;
        airDate: string | null;
        runtime: number | null;
        overview: string | null;
      }>
    >
  >({});
  const [loadingSeasons, setLoadingSeasons] = useState<Set<number>>(new Set());

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const [details, setDetails] = useState<DetailedInfo | null>(null);
  const [providers, setProviders] = useState<WatchProvider[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [videos, setVideos] = useState<
    Array<{
      key: string;
      name: string;
      site: string;
      type: string;
    }>
  >([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);

  const getDetails = useAction(api.tmdb.getDetails);
  const getWatchProviders = useAction(api.tmdb.getWatchProviders);
  const getSeasonEpisodes = useAction(api.tmdb.getSeasonEpisodes);
  const getVideos = useAction(api.tmdb.getVideos);

  const genresList = title.genres
    ? (() => {
        try {
          const parsed = JSON.parse(title.genres);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })()
    : [];

  useEffect(() => {
    if (!open) {
      setDetails(null);
      setProviders([]);
      return;
    }

    const fetchDetails = async () => {
      setIsLoadingDetails(true);
      try {
        const result = await getDetails({
          tmdbId: title.tmdbId,
          mediaType: title.mediaType,
        });
        setDetails(result);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Failed to load title details:", error.message);
        }
      } finally {
        setIsLoadingDetails(false);
      }
    };

    const fetchProviders = async () => {
      setIsLoadingProviders(true);
      try {
        const result = await getWatchProviders({
          tmdbId: title.tmdbId,
          mediaType: title.mediaType,
        });
        setProviders(result);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Failed to load watch providers:", error.message);
        }
      } finally {
        setIsLoadingProviders(false);
      }
    };

    const fetchVideos = async () => {
      setIsLoadingVideos(true);
      try {
        const result = await getVideos({
          tmdbId: title.tmdbId,
          mediaType: title.mediaType,
        });
        setVideos(result);
      } catch (error) {
        console.error("Failed to load videos:", error);
      } finally {
        setIsLoadingVideos(false);
      }
    };

    fetchDetails();
    fetchProviders();
    fetchVideos();
  }, [
    open,
    title.tmdbId,
    title.mediaType,
    getDetails,
    getWatchProviders,
    getVideos,
  ]);

  const handleSeasonToggle = async (
    seasonNumber: number,
    isExpanding: boolean
  ) => {
    if (!isExpanding) {
      setExpandedSeasons((prev) => {
        const newSet = new Set(prev);
        newSet.delete(seasonNumber);
        return newSet;
      });
      return;
    }

    setExpandedSeasons((prev) => new Set(prev).add(seasonNumber));

    if (seasonEpisodes[seasonNumber]) {
      return;
    }

    setLoadingSeasons((prev) => new Set(prev).add(seasonNumber));
    try {
      const episodes = await getSeasonEpisodes({
        tmdbId: title.tmdbId,
        seasonNumber,
      });
      setSeasonEpisodes((prev) => ({
        ...prev,
        [seasonNumber]: episodes,
      }));
    } catch (error) {
      console.error(
        `Failed to load episodes for season ${seasonNumber}:`,
        error
      );
    } finally {
      setLoadingSeasons((prev) => {
        const newSet = new Set(prev);
        newSet.delete(seasonNumber);
        return newSet;
      });
    }
  };

  const displayDescription = details?.description || title.description;
  const displayDirectors = details?.directors || title.directors || [];
  const releaseYear = title.releaseDate
    ? new Date(title.releaseDate).getFullYear()
    : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          {children || (
            <Image
              width={triggerImage?.width || 32}
              height={triggerImage?.height || 48}
              loader={tmdbImageLoader}
              src={title.posterUrl || ""}
              alt={title.name}
              className={cn(
                "cursor-pointer rounded object-cover",
                triggerImage?.className
              )}
              loading={triggerImage?.loading || "lazy"}
            />
          )}
        </DialogTrigger>
      )}
      <DialogContent className="flex h-[95vh] flex-col overflow-hidden p-0 sm:max-w-5xl">
        <DialogTitle className="sr-only">{title.name}</DialogTitle>
        <DialogDescription className="sr-only">
          Details and information about {title.name}
        </DialogDescription>
        <ScrollArea className="flex-1">
          <div className="relative pb-20">
            {/* Optional Backdrop */}
            {title.backdropUrl && (
              <div className="absolute inset-0 -z-10 h-[500px] overflow-hidden">
                <Image
                  loader={tmdbImageLoader}
                  src={title.backdropUrl}
                  alt=""
                  fill
                  className="object-cover opacity-40 blur-sm"
                  priority
                />
                <div className="via-background/80 to-background absolute inset-0 bg-linear-to-b from-transparent" />
              </div>
            )}

            {/* Fallback Gradient if no backdrop */}
            {!title.backdropUrl && (
              <div className="from-primary/5 via-background to-background absolute inset-0 -z-10 bg-linear-to-b" />
            )}

            <div className="p-6 md:p-10">
              {/* Hero section: Poster + Basic Info */}
              <div className="mb-12 flex flex-col items-start gap-10 md:flex-row">
                {title.posterUrl && (
                  <div className="relative aspect-2/3 w-full shrink-0 overflow-hidden rounded-2xl shadow-2xl md:w-64 lg:w-72">
                    <Image
                      loader={tmdbImageLoader}
                      src={title.posterUrl}
                      alt={title.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                )}

                <div className="flex flex-1 flex-col pt-2">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mb-4 w-fit px-3 py-1 text-xs font-bold tracking-wider uppercase">
                    {title.mediaType === "MOVIE" ? "Movie" : "TV Series"}
                  </Badge>
                  <h2 className="mb-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
                    {title.name}
                  </h2>
                  <div className="text-muted-foreground mb-8 flex items-center gap-4 text-base font-medium">
                    {releaseYear && <span>{releaseYear}</span>}
                    {releaseYear && <span className="text-primary/40">•</span>}
                    {title.mediaType === "MOVIE" && (
                      <>
                        {isLoadingDetails ? (
                          <Skeleton className="h-4 w-16" />
                        ) : details?.runtime ? (
                          <span>
                            {Math.floor(details.runtime / 60)}h{" "}
                            {details.runtime % 60}m
                          </span>
                        ) : null}
                      </>
                    )}
                  </div>

                  {displayDescription && (
                    <div className="max-w-3xl">
                      <h3 className="text-primary/70 mb-3 text-xs font-bold tracking-[0.2em] uppercase">
                        Overview
                      </h3>
                      <p className="text-foreground/80 text-lg leading-relaxed">
                        {displayDescription}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px]">
                {/* Left Column: Trailer and Seasons */}
                <div className="space-y-12">
                  {/* Trailer Section */}
                  {isLoadingVideos ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-8 w-48" />
                      </div>
                      <Skeleton className="aspect-video w-full rounded-3xl" />
                    </div>
                  ) : (
                    videos.length > 0 && (
                      <div className="space-y-6">
                        <h3 className="flex items-center gap-3 text-2xl font-bold">
                          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                            <Play className="fill-primary text-primary h-5 w-5" />
                          </div>
                          Official Trailer
                        </h3>
                        <div className="group border-primary/10 hover:border-primary/30 relative aspect-video w-full overflow-hidden rounded-3xl border bg-black shadow-2xl transition-all">
                          <iframe
                            src={`https://www.youtube.com/embed/${videos[0].key}`}
                            title={videos[0].name}
                            className="absolute inset-0 h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )
                  )}

                  {/* Seasons Section */}
                  {title.mediaType === "SERIES" && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold">Explore Seasons</h3>
                      {isLoadingDetails ? (
                        <div className="space-y-3">
                          <Skeleton className="h-16 w-full rounded-2xl" />
                          <Skeleton className="h-16 w-full rounded-2xl" />
                        </div>
                      ) : details?.seasons && details.seasons.length > 0 ? (
                        <div className="grid gap-4">
                          {details.seasons.map((season) => {
                            const isSeasonExpanded = expandedSeasons.has(
                              season.seasonNumber
                            );
                            const isLoadingSeason = loadingSeasons.has(
                              season.seasonNumber
                            );
                            const episodes =
                              seasonEpisodes[season.seasonNumber] || [];

                            return (
                              <Collapsible
                                key={season.seasonNumber}
                                open={isSeasonExpanded}
                                onOpenChange={(open) =>
                                  handleSeasonToggle(season.seasonNumber, open)
                                }
                                className="group bg-muted/20 hover:bg-muted/30 overflow-hidden rounded-2xl border transition-all"
                              >
                                <CollapsibleTrigger className="flex w-full items-center justify-between p-5 text-left">
                                  <div>
                                    <p className="text-lg font-bold">
                                      {season.name}
                                    </p>
                                    <p className="text-muted-foreground text-sm">
                                      {season.episodeCount} episodes
                                      {season.airDate &&
                                        ` • ${new Date(season.airDate).getFullYear()}`}
                                    </p>
                                  </div>
                                  <div className="bg-primary/5 flex h-8 w-8 items-center justify-center rounded-full transition-transform group-data-[state=open]:rotate-180">
                                    <ChevronDown className="h-5 w-5" />
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="bg-background/50 border-t p-4">
                                    {isLoadingSeason ? (
                                      <div className="space-y-2 py-2">
                                        <Skeleton className="h-10 w-full rounded-lg" />
                                        <Skeleton className="h-10 w-full rounded-lg" />
                                      </div>
                                    ) : episodes.length > 0 ? (
                                      <div className="grid gap-3">
                                        {episodes.map((episode) => (
                                          <div
                                            key={episode.episodeNumber}
                                            className="hover:bg-primary/5 group/episode rounded-xl border border-transparent p-4 transition-all hover:border-primary/10"
                                          >
                                            <div className="flex items-start gap-4">
                                              <span className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold">
                                                {episode.episodeNumber}
                                              </span>
                                              <div className="flex-1 space-y-2">
                                                <div className="flex items-start justify-between gap-4">
                                                  <div className="flex-1">
                                                    <h4 className="font-semibold leading-tight">
                                                      {episode.name}
                                                    </h4>
                                                    <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-3 text-xs">
                                                      {episode.airDate && (
                                                        <span>
                                                          {new Date(
                                                            episode.airDate
                                                          ).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                              month: "short",
                                                              day: "numeric",
                                                              year: "numeric",
                                                            }
                                                          )}
                                                        </span>
                                                      )}
                                                      {episode.runtime && (
                                                        <>
                                                          {episode.airDate && (
                                                            <span className="text-primary/40">
                                                              •
                                                            </span>
                                                          )}
                                                          <span>
                                                            {episode.runtime}m
                                                          </span>
                                                        </>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                                {episode.overview && (
                                                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 group-hover/episode:line-clamp-none">
                                                    {episode.overview}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-muted-foreground py-4 text-center text-sm">
                                        No episodes available
                                      </p>
                                    )}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-muted-foreground rounded-3xl border-2 border-dashed py-8 text-center">
                          No season information available
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column: Metadata Sidebar */}
                <div className="space-y-12">
                  {/* Metadata */}
                  <div className="bg-muted/10 space-y-8 rounded-3xl border p-8 shadow-sm">
                    {displayDirectors.length > 0 && (
                      <div>
                        <h3 className="text-primary/70 mb-2 text-xs font-bold tracking-[0.2em] uppercase">
                          {title.mediaType === "MOVIE"
                            ? "Directors"
                            : "Creators"}
                        </h3>
                        <p className="text-base font-semibold">
                          {displayDirectors.join(", ")}
                        </p>
                      </div>
                    )}

                    {genresList.length > 0 && (
                      <div>
                        <h3 className="text-primary/70 mb-2 text-xs font-bold tracking-[0.2em] uppercase">
                          Genres
                        </h3>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {genresList.map((genreId) => (
                            <Badge key={genreId} variant="secondary">
                              {getGenreName(genreId, title.mediaType)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Providers */}
                    <div className="space-y-4">
                      <h3 className="text-primary/70 text-xs font-bold tracking-[0.2em] uppercase">
                        Where to Watch
                      </h3>
                      {isLoadingProviders ? (
                        <div className="flex gap-3">
                          <Skeleton className="h-12 w-12 rounded-xl" />
                          <Skeleton className="h-12 w-12 rounded-xl" />
                        </div>
                      ) : providers.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {providers.map((provider, index) => (
                            <div
                              key={index}
                              className="group bg-background hover:border-primary/20 relative overflow-hidden rounded-xl border-2 border-transparent shadow-sm transition-all hover:scale-110"
                            >
                              <Image
                                loader={tmdbImageLoader}
                                src={provider.logo_path}
                                alt={provider.provider_name}
                                width={48}
                                height={48}
                                className="h-12 w-12 object-cover"
                              />
                              <div className="bg-primary/5 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm italic">
                          Streaming info unavailable
                        </p>
                      )}
                    </div>

                    {/* External Links */}
                    {details?.imdbId && (
                      <div className="pt-4">
                        <Button
                          variant="outline"
                          className="group h-10 w-full justify-start rounded-xl px-4 font-bold shadow-sm transition-all hover:shadow-md"
                          asChild
                        >
                          <a
                            href={`https://www.imdb.com/title/${details.imdbId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              xlinkHref="http://www.w3.org/1999/xlink"
                              viewBox="0 0 575 289.83"
                            >
                              <defs>
                                <path
                                  id="a"
                                  d="M575 24.91C573.44 12.15 563.97 1.98 551.91 0H23.32C10.11 2.17 0 14.16 0 28.61v232.25c0 16 12.37 28.97 27.64 28.97h519.95c14.06 0 25.67-11.01 27.41-25.26V24.91Z"
                                />
                                <path
                                  id="b"
                                  d="M69.35 58.24h45.63v175.65H69.35V58.24Z"
                                />
                                <path
                                  id="c"
                                  d="M201.2 139.15c-3.92-26.77-6.1-41.65-6.53-44.62-1.91-14.33-3.73-26.8-5.47-37.44h-59.16v175.65h39.97l.14-115.98 16.82 115.98h28.47l15.95-118.56.15 118.56h39.84V57.09h-59.61l-10.57 82.06Z"
                                />
                                <path
                                  id="d"
                                  d="M346.71 93.63c.5 2.24.76 7.32.76 15.26v68.1c0 11.69-.76 18.85-2.27 21.49-1.52 2.64-5.56 3.95-12.11 3.95V87.13c4.97 0 8.36.53 10.16 1.57 1.8 1.05 2.96 2.69 3.46 4.93Zm20.61 137.32c5.43-1.19 9.99-3.29 13.69-6.28 3.69-3 6.28-7.15 7.76-12.46 1.49-5.3 2.37-15.83 2.37-31.58v-61.68c0-16.62-.65-27.76-1.66-33.42-1.02-5.67-3.55-10.82-7.6-15.44-4.06-4.62-9.98-7.94-17.76-9.96-7.79-2.02-20.49-3.04-42.58-3.04H287.5v175.65h55.28c12.74-.4 20.92-.99 24.54-1.79Z"
                                />
                                <path
                                  id="e"
                                  d="M464.76 204.7c-.84 2.23-4.52 3.36-7.3 3.36-2.72 0-4.53-1.08-5.45-3.25-.92-2.16-1.37-7.09-1.37-14.81v-46.42c0-8 .4-12.99 1.21-14.98.8-1.97 2.56-2.97 5.28-2.97 2.78 0 6.51 1.13 7.47 3.4.95 2.27 1.43 7.12 1.43 14.55v45.01c-.29 9.25-.71 14.62-1.27 16.11Zm-58.08 26.51h41.08c1.71-6.71 2.65-10.44 2.84-11.19 3.72 4.5 7.81 7.88 12.3 10.12 4.47 2.25 11.16 3.37 16.34 3.37 7.21 0 13.43-1.89 18.68-5.68 5.24-3.78 8.58-8.26 10-13.41 1.42-5.16 2.13-13 2.13-23.54V141.6c0-10.6-.24-17.52-.71-20.77s-1.87-6.56-4.2-9.95c-2.33-3.39-5.72-6.02-10.16-7.9-4.44-1.88-9.68-2.82-15.72-2.82-5.25 0-11.97 1.05-16.45 3.12-4.47 2.07-8.53 5.21-12.17 9.42V55.56h-43.96v175.65Z"
                                />
                              </defs>
                              <use xlinkHref="#a" fill="#f6c700" />
                              <use
                                xlinkHref="#a"
                                fillOpacity="0"
                                stroke="#000"
                                strokeOpacity="0"
                              />
                              <use xlinkHref="#b" />
                              <use
                                xlinkHref="#b"
                                fillOpacity="0"
                                stroke="#000"
                                strokeOpacity="0"
                              />
                              <use xlinkHref="#c" />
                              <use
                                xlinkHref="#c"
                                fillOpacity="0"
                                stroke="#000"
                                    strokeOpacity="0"
                              />
                              <use xlinkHref="#d" />
                              <use
                                xlinkHref="#d"
                                fillOpacity="0"
                                stroke="#000"
                                strokeOpacity="0"
                              />
                              <use xlinkHref="#e" />
                              <use
                                xlinkHref="#e"
                                fillOpacity="0"
                                stroke="#000"
                                strokeOpacity="0"
                              />
                            </svg>
                            <span className="flex-1">View on IMDb</span>
                            <ExternalLink className="size-5 opacity-50 transition-transform group-hover:translate-x-1" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {showAddToWatchlist && onAddToWatchlist && (
          <div className="bg-background/80 sticky bottom-0 flex justify-end border-t p-6 backdrop-blur-md">
            <Button
              onClick={async () => {
                setIsAdding(true);
                try {
                  await onAddToWatchlist(title.tmdbId);
                  setOpen(false);
                } catch (error) {
                  console.error("Failed to add to watchlist:", error);
                } finally {
                  setIsAdding(false);
                }
              }}
              disabled={isAdding}
              className="flex items-center gap-2"
            >
              {isAdding ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add to Watchlist
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Genre mapping helper (TMDB genre IDs)
function getGenreName(genreId: number, mediaType: "MOVIE" | "SERIES"): string {
  const movieGenres: Record<number, string> = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
  };

  const tvGenres: Record<number, string> = {
    10759: "Action & Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    10762: "Kids",
    9648: "Mystery",
    10763: "News",
    10764: "Reality",
    10765: "Sci-Fi & Fantasy",
    10766: "Soap",
    10767: "Talk",
    10768: "War & Politics",
    37: "Western",
  };

  const genres = mediaType === "MOVIE" ? movieGenres : tvGenres;
  return genres[genreId] || `Genre ${genreId}`;
}
