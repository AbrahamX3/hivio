"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { convertMinutesToHrMin } from "@/lib/utils";
import type { HistoryItem } from "@/types/history";
import { useAction, useMutation } from "convex/react";
import { Calendar, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { EditHistoryDialog } from "../../app/dashboard/_components/edit-history-dialog";
import ImageModal from "../image-modal";

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
      <Card className="rounded-xl border bg-card p-4">
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
      (seasonProgress.current / seasonProgress.total) * 100,
    );
    progressLabel = `S${String(item.currentSeason || 0).padStart(2, "0")} • E${String(item.currentEpisode || 0).padStart(2, "0")} of ${seasonProgress.total}`;
  } else if (isMovie && item.currentRuntime && movieRuntime) {
    progressValue = Math.round((item.currentRuntime / movieRuntime) * 100);
    progressLabel = `${convertMinutesToHrMin(item.currentRuntime)} / ${convertMinutesToHrMin(movieRuntime)}`;
  }

  return (
    <Card className="rounded-xl border bg-card p-4">
      <div className="flex gap-4">
        {title.posterUrl ? (
          <ImageModal
            url={title.posterUrl}
            alt={title.name}
            width={56}
            height={80}
            className="h-20 w-14 shrink-0 object-cover rounded"
          />
        ) : (
          <div className="h-20 w-14 shrink-0 rounded bg-muted" />
        )}

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold truncate">{title.name}</h4>
              {isSeries && item.currentSeason && item.currentEpisode ? (
                <p className="text-sm text-muted-foreground">
                  S{String(item.currentSeason).padStart(2, "0")} • E
                  {String(item.currentEpisode).padStart(2, "0")}
                </p>
              ) : isMovie && item.currentRuntime ? (
                <p className="text-sm text-muted-foreground">
                  {convertMinutesToHrMin(item.currentRuntime)} logged
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
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
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
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

function WatchingShowCardWithData({
  item,
  onUpdate,
}: {
  item: HistoryItem;
  onUpdate?: () => void;
}) {
  const [nextEpisode, setNextEpisode] = useState<
    | {
        episodeNumber: number;
        name: string;
        airDate: string;
      }
    | undefined
  >();
  const [seasonProgress, setSeasonProgress] = useState<
    | {
        current: number;
        total: number;
      }
    | undefined
  >();
  const [movieRuntime, setMovieRuntime] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const getNextEpisodeInfo = useAction(api.tmdb.getNextEpisodeInfo);
  const getDetails = useAction(api.tmdb.getDetails);

  useEffect(() => {
    if (!item.title) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (
          item.title?.mediaType === "SERIES" &&
          item.currentSeason &&
          item.currentEpisode
        ) {
          const result = await getNextEpisodeInfo({
            tmdbId: item.title.tmdbId,
            currentSeason: item.currentSeason,
            currentEpisode: item.currentEpisode,
          });
          setNextEpisode(result.nextEpisode ?? undefined);
          setSeasonProgress(result.seasonProgress);
        } else if (item.title?.mediaType === "MOVIE") {
          const details = await getDetails({
            tmdbId: item.title.tmdbId,
            mediaType: "MOVIE",
          });
          if (details.runtime) {
            setMovieRuntime(details.runtime);
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error("Failed to load show data:", error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [
    item.title,
    item.currentSeason,
    item.currentEpisode,
    getNextEpisodeInfo,
    getDetails,
  ]);

  return (
    <WatchingShowCard
      show={{
        item,
        nextEpisode,
        seasonProgress,
        movieRuntime,
        isLoading,
      }}
      onUpdate={onUpdate}
    />
  );
}

export function CurrentlyWatching({
  shows,
  emptyState,
}: CurrentlyWatchingProps) {
  if (emptyState) {
    return (
      <Card className="rounded-2xl border bg-card p-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Currently watching
          </p>
          <h3 className="text-xl font-semibold">{emptyState.title}</h3>
          <p className="text-sm text-muted-foreground">
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
    <Card className="rounded-2xl border bg-card p-6">
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
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

export function CurrentlyWatchingWithData({
  items,
  emptyState,
  onUpdate,
}: {
  items: HistoryItem[];
  emptyState?: {
    title: string;
    description: string;
  };
  onUpdate?: () => void;
}) {
  if (emptyState) {
    return (
      <Card className="rounded-2xl border bg-card p-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Currently watching
          </p>
          <h3 className="text-xl font-semibold">{emptyState.title}</h3>
          <p className="text-sm text-muted-foreground">
            {emptyState.description}
          </p>
        </div>
      </Card>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-2xl border bg-card p-6">
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Currently watching
          </p>
          <h3 className="mt-1 text-xl font-semibold">
            {items.length} {items.length === 1 ? "title" : "titles"}
          </h3>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <WatchingShowCardWithData
              key={item._id}
              item={item}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
