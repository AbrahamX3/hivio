"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { convertMinutesToHrMin } from "@/lib/utils";
import type { HistoryItem } from "@/types/history";
import {
  Preloaded,
  useAction,
  useMutation,
  usePreloadedQuery,
  useQuery,
} from "convex/react";
import { Calendar, MoreHorizontal } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { api } from "../../../convex/_generated/api";
import { EditHistoryDialog } from "../../app/dashboard/_components/edit-history-dialog";
import { TitleDetailsDialog } from "../title-details-dialog";

type WatchingShowData = {
  item: HistoryItem;
  nextEpisode?: {
    episodeNumber: number;
    name: string;
    airDate: string;
  };
  seasonProgress?: {
    current: number;
    total: number;
  };
  movieRuntime?: number;
  isLoading?: boolean;
};

interface CurrentlyWatchingProps {
  shows: WatchingShowData[];
  emptyState?: {
    title: string;
    description: string;
  };
}

function formatReleaseDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function WatchingShowCard({
  show,
  onUpdate,
}: {
  show: WatchingShowData;
  onUpdate?: () => void;
}) {
  const { item, nextEpisode, seasonProgress, movieRuntime, isLoading } = show;
  const title = item.title;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const updateHistory = useMutation(api.history.update);

  if (isLoading || !title) {
    return (
      <Card className="bg-card rounded-xl border p-4">
        <div className="flex gap-4">
          <Skeleton className="h-20 w-14 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-2 w-full" />
          </div>
        </div>
      </Card>
    );
  }

  const isSeries = title.mediaType === "SERIES";
  const isMovie = title.mediaType === "MOVIE";

  let progressValue = 0;
  let progressLabel = "";

  if (isSeries && seasonProgress) {
    progressValue = Math.round(
      (seasonProgress.current / seasonProgress.total) * 100
    );
    progressLabel = `S${String(item.currentSeason || 0).padStart(2, "0")} • E${String(item.currentEpisode || 0).padStart(2, "0")} of ${seasonProgress.total}`;
  } else if (isMovie && item.currentRuntime && movieRuntime) {
    progressValue = Math.round((item.currentRuntime / movieRuntime) * 100);
    progressLabel = `${convertMinutesToHrMin(item.currentRuntime)} / ${convertMinutesToHrMin(movieRuntime)}`;
  }

  return (
    <Card className="bg-card rounded-xl border p-4">
      <div className="flex gap-4">
        {title.posterUrl ? (
          <TitleDetailsDialog
            title={{
              name: title.name,
              posterUrl: title.posterUrl,
              backdropUrl: title.backdropUrl,
              description: title.description,
              directors: title.directors,
              tmdbId: title.tmdbId,
              mediaType: title.mediaType,
              releaseDate: title.releaseDate,
              genres: title.genres,
            }}
            triggerImage={{
              width: 56,
              height: 80,
              className: "h-20 w-14 shrink-0 rounded object-cover",
            }}
          />
        ) : (
          <div className="bg-muted h-20 w-14 shrink-0 rounded" />
        )}

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className="truncate font-semibold">{title.name}</h4>
              {isSeries && item.currentSeason && item.currentEpisode ? (
                <p className="text-muted-foreground text-sm">
                  S{String(item.currentSeason).padStart(2, "0")} • E
                  {String(item.currentEpisode).padStart(2, "0")}
                </p>
              ) : isMovie && item.currentRuntime ? (
                <p className="text-muted-foreground text-sm">
                  {convertMinutesToHrMin(item.currentRuntime)} logged
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                Watching
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsDialogOpen(true)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {progressValue > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{progressLabel}</span>
                <span className="font-medium">{progressValue}%</span>
              </div>
              <Progress value={progressValue} className="h-1.5" />
            </div>
          )}

          {nextEpisode && (
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(nextEpisode.airDate) >= new Date()
                  ? "Next Episode: "
                  : "Last Aired: "}
                {formatReleaseDate(nextEpisode.airDate)}
              </span>
            </div>
          )}
        </div>
      </div>
      <EditHistoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        item={item}
        onSave={async (id, data) => {
          await updateHistory({
            id,
            ...data,
          });
          onUpdate?.();
        }}
      />
    </Card>
  );
}

export function CurrentlyWatching({
  shows,
  emptyState,
}: CurrentlyWatchingProps) {
  if (emptyState) {
    return (
      <Card className="bg-card rounded-2xl border p-6">
        <div className="space-y-3">
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            Currently watching
          </p>
          <h3 className="text-xl font-semibold">{emptyState.title}</h3>
          <p className="text-muted-foreground text-sm">
            {emptyState.description}
          </p>
        </div>
      </Card>
    );
  }

  if (shows.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card rounded-2xl border p-6">
      <div className="space-y-4">
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            Currently watching
          </p>
          <h3 className="mt-1 text-xl font-semibold">
            {shows.length} {shows.length === 1 ? "title" : "titles"}
          </h3>
        </div>

        <div className="space-y-3">
          {shows.map((show) => (
            <WatchingShowCard key={show.item._id} show={show} />
          ))}
        </div>
      </div>
    </Card>
  );
}

function CurrentlyWatchingDataFetcher({
  items,
  onUpdate,
}: {
  items: HistoryItem[];
  onUpdate?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [showData, setShowData] = useState<WatchingShowData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getNextEpisodeInfo = useAction(api.tmdb.getNextEpisodeInfo);
  const getDetails = useAction(api.tmdb.getDetails);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);

      try {
        const dataPromises = items.map(async (item) => {
          if (!item.title) {
            return {
              item,
              nextEpisode: undefined,
              seasonProgress: undefined,
              movieRuntime: undefined,
              isLoading: false,
            } as WatchingShowData;
          }

          try {
            let nextEpisode: WatchingShowData["nextEpisode"];
            let seasonProgress: WatchingShowData["seasonProgress"];
            let movieRuntime: WatchingShowData["movieRuntime"];

            if (
              item.title.mediaType === "SERIES" &&
              item.currentSeason &&
              item.currentEpisode
            ) {
              const result = await getNextEpisodeInfo({
                tmdbId: item.title.tmdbId,
                currentSeason: item.currentSeason,
                currentEpisode: item.currentEpisode,
              });
              nextEpisode = result.nextEpisode ?? undefined;
              seasonProgress = result.seasonProgress;
            } else if (item.title.mediaType === "MOVIE") {
              const details = await getDetails({
                tmdbId: item.title.tmdbId,
                mediaType: "MOVIE",
              });
              movieRuntime = details.runtime || undefined;
            }

            return {
              item,
              nextEpisode,
              seasonProgress,
              movieRuntime,
              isLoading: false,
            } as WatchingShowData;
          } catch (error) {
            console.error("Failed to load show data:", error);
            return {
              item,
              nextEpisode: undefined,
              seasonProgress: undefined,
              movieRuntime: undefined,
              isLoading: false,
            } as WatchingShowData;
          }
        });

        const results = await Promise.all(dataPromises);
        startTransition(() => {
          setShowData(results);
        });
      } catch (error) {
        console.error("Failed to fetch watching data:", error);
        startTransition(() => {
          setShowData(
            items.map((item) => ({
              item,
              nextEpisode: undefined,
              seasonProgress: undefined,
              movieRuntime: undefined,
              isLoading: false,
            }))
          );
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [getDetails, getNextEpisodeInfo, items]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {items.map((item) => (
          <WatchingShowCard
            key={item._id}
            show={{
              item,
              nextEpisode: undefined,
              seasonProgress: undefined,
              movieRuntime: undefined,
              isLoading: true,
            }}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showData.map((show) => (
        <WatchingShowCard key={show.item._id} show={show} onUpdate={onUpdate} />
      ))}
    </div>
  );
}

export function CurrentlyWatchingWithData({
  items,
  emptyState,
  onUpdate,
  watchingItemsPreloaded,
}: {
  items?: HistoryItem[];
  emptyState?: {
    title: string;
    description: string;
  };
  onUpdate?: () => void;
  watchingItemsPreloaded?: Preloaded<typeof api.history.getWatchingItems>;
}) {
  if (items) {
    return (
      <CurrentlyWatchingSection
        itemsToUse={items}
        emptyState={emptyState}
        onUpdate={onUpdate}
      />
    );
  }

  if (watchingItemsPreloaded) {
    return (
      <CurrentlyWatchingFromPreloaded
        watchingItemsPreloaded={watchingItemsPreloaded}
        emptyState={emptyState}
        onUpdate={onUpdate}
      />
    );
  }

  return (
    <CurrentlyWatchingFromQuery emptyState={emptyState} onUpdate={onUpdate} />
  );
}

function CurrentlyWatchingFromPreloaded({
  watchingItemsPreloaded,
  emptyState,
  onUpdate,
}: {
  watchingItemsPreloaded: Preloaded<typeof api.history.getWatchingItems>;
  emptyState?: { title: string; description: string };
  onUpdate?: () => void;
}) {
  const itemsToUse = usePreloadedQuery(watchingItemsPreloaded) ?? [];
  return (
    <CurrentlyWatchingSection
      itemsToUse={itemsToUse}
      emptyState={emptyState}
      onUpdate={onUpdate}
    />
  );
}

function CurrentlyWatchingFromQuery({
  emptyState,
  onUpdate,
}: {
  emptyState?: { title: string; description: string };
  onUpdate?: () => void;
}) {
  const itemsToUse = useQuery(api.history.getWatchingItems) ?? [];
  return (
    <CurrentlyWatchingSection
      itemsToUse={itemsToUse}
      emptyState={emptyState}
      onUpdate={onUpdate}
    />
  );
}

function CurrentlyWatchingSection({
  itemsToUse,
  emptyState,
  onUpdate,
}: {
  itemsToUse: HistoryItem[];
  emptyState?: { title: string; description: string };
  onUpdate?: () => void;
}) {
  if (emptyState || itemsToUse.length === 0) {
    return (
      <Card className="bg-card rounded-2xl border p-6">
        <div className="space-y-3">
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            Currently watching
          </p>
          <h3 className="text-xl font-semibold">
            {emptyState?.title ?? "No titles in progress"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {emptyState?.description ??
              "Start watching something to see it here with progress and release dates."}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card rounded-2xl border p-6">
      <div className="space-y-4">
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            Currently watching
          </p>
          <h3 className="mt-1 text-xl font-semibold">
            {itemsToUse.length} {itemsToUse.length === 1 ? "title" : "titles"}
          </h3>
        </div>

        <CurrentlyWatchingDataFetcher items={itemsToUse} onUpdate={onUpdate} />
      </div>
    </Card>
  );
}
