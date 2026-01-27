"use client";

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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAction } from "convex/react";

import { ChevronDown, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import ImageModal from "../image-modal";

type TrendingTitle = {
  id: number;
  name: string;
  posterUrl: string | null;
  mediaType: "MOVIE" | "SERIES";
  tmdbId: number;
};

interface TrendingTitleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: TrendingTitle | null;
  onTitleAdded?: (tmdbId: number) => void;
}

export function TrendingTitleDialog({
  open,
  onOpenChange,
  title,
  onTitleAdded,
}: TrendingTitleDialogProps) {
  const [details, setDetails] = useState<{
    runtime: number | null;
    seasons: Array<{
      seasonNumber: number;
      episodeCount: number;
      name: string;
      airDate: string | null;
    }> | null;
    directors: string[];
    description: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeasonsOpen, setIsSeasonsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const getDetails = useAction(api.tmdb.getDetails);
  const addToHistory = useAction(api.history.add);

  useEffect(() => {
    if (!title || !open) {
      setDetails(null);
      setIsSeasonsOpen(true);
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
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
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [title, open, getDetails]);

  const handleAddToWatchlist = async () => {
    if (!title) return;

    setIsAdding(true);
    try {
      await addToHistory({
        tmdbId: title.tmdbId,
        mediaType: title.mediaType,
        status: "PLANNED",
      });
      toast.success("Added to watchlist!");
      onTitleAdded?.(title.tmdbId);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to add to watchlist");
      if (error instanceof Error) {
        console.error("Add to watchlist error:", error.message);
      }
    } finally {
      setIsAdding(false);
    }
  };

  if (!title) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title.name}</DialogTitle>
          <DialogDescription>
            {title.mediaType === "MOVIE" ? "Movie" : "TV Series"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {title.posterUrl && (
              <div className="flex justify-center">
                <ImageModal
                  url={title.posterUrl}
                  alt={title.name}
                  width={200}
                  height={300}
                  className="rounded-lg object-cover"
                />
              </div>
            )}

            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : details ? (
              <div className="space-y-4">
                {details.description && (
                  <div>
                    <p className="mb-1 text-sm font-medium">Description</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {details.description}
                    </p>
                  </div>
                )}

                {details.directors.length > 0 && (
                  <div>
                    <p className="mb-1 text-sm font-medium">
                      {title.mediaType === "MOVIE" ? "Directors" : "Creators"}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {details.directors.join(", ")}
                    </p>
                  </div>
                )}

                {title.mediaType === "MOVIE" && details.runtime && (
                  <div>
                    <p className="mb-1 text-sm font-medium">Runtime</p>
                    <p className="text-muted-foreground text-sm">
                      {Math.floor(details.runtime / 60)}h {details.runtime % 60}
                      m
                    </p>
                  </div>
                )}

                {title.mediaType === "SERIES" && details.seasons && (
                  <Collapsible
                    open={isSeasonsOpen}
                    onOpenChange={setIsSeasonsOpen}
                    className="rounded-lg border p-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Seasons</p>
                      <CollapsibleTrigger className="text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-sm p-1 text-sm transition-colors">
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isSeasonsOpen && "rotate-180"
                          )}
                        />
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="mt-2 space-y-2">
                      {details.seasons.map((season) => (
                        <div
                          key={season.seasonNumber}
                          className="flex items-center justify-between rounded-lg border p-2 text-sm"
                        >
                          <div>
                            <p className="font-medium">{season.name}</p>
                            <p className="text-muted-foreground text-xs">
                              {season.episodeCount} episodes
                            </p>
                          </div>
                          {season.airDate && (
                            <p className="text-muted-foreground text-xs">
                              {new Date(season.airDate).getFullYear()}
                            </p>
                          )}
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            ) : null}
          </div>
        </ScrollArea>

        <div className="flex justify-end border-t pt-4">
          <Button
            onClick={handleAddToWatchlist}
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
      </DialogContent>
    </Dialog>
  );
}
