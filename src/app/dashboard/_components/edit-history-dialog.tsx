"use client";

import { useForm } from "@tanstack/react-form";
import { useAction } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { HistoryStatus } from "../../../../convex/types";

type HistoryItem = {
  _id: string;
  id: string;
  titleId: string;
  userId: string;
  status: HistoryStatus;
  currentEpisode?: number;
  currentSeason?: number;
  currentRuntime?: number;
  isFavourite: boolean;
  createdAt: number;
  updatedAt: number;
  title: {
    id: string;
    name: string;
    posterUrl?: string;
    backdropUrl?: string;
    description?: string;
    tmdbId: number;
    imdbId: string;
    mediaType: "MOVIE" | "SERIES";
    releaseDate: string;
    genres: string;
    createdAt: number;
    updatedAt: number;
  } | null;
};

interface EditHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: HistoryItem | null;
  onSave: (
    id: Id<"history">,
    data: {
      status?: HistoryItem["status"];
      currentEpisode?: number;
      currentSeason?: number;
      currentRuntime?: number;
      isFavourite?: boolean;
    },
  ) => Promise<void>;
}

export function EditHistoryDialog({
  open,
  onOpenChange,
  item,
  onSave,
}: EditHistoryDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [titleDetails, setTitleDetails] = useState<{
    directors: string[];
    runtime: number | null;
    seasons: Array<{
      seasonNumber: number;
      episodeCount: number;
      name: string;
      airDate: string | null;
    }> | null;
  } | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [episodes, setEpisodes] = useState<
    Array<{ episodeNumber: number; name: string; airDate: string | null }>
  >([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);

  const getDetails = useAction(api.tmdb.getDetails);
  const getSeasonEpisodes = useAction(api.tmdb.getSeasonEpisodes);

  useEffect(() => {
    if (!item?.title) return;

    const loadDetails = async () => {
      setIsLoadingDetails(true);
      setTitleDetails(null);
      setSelectedSeason(item.currentSeason || null);
      setEpisodes([]);

      const title = item.title;
      if (!title) return;

      try {
        const details = await getDetails({
          tmdbId: title.tmdbId,
          mediaType: title.mediaType,
        });
        setTitleDetails(details);

        if (item.currentSeason !== undefined) {
          setIsLoadingEpisodes(true);
          try {
            const episodeList = await getSeasonEpisodes({
              tmdbId: title.tmdbId,
              seasonNumber: item.currentSeason,
            });
            setEpisodes(episodeList);
          } catch (error) {
            console.error("Failed to load episodes", error);
          } finally {
            setIsLoadingEpisodes(false);
          }
        }
      } catch (error) {
        toast.error("Failed to load title details");
        console.error(error);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    loadDetails();
  }, [
    item?.title?.tmdbId,
    item?.title?.mediaType,
    item?.currentSeason,
    item?.title,
    getDetails,
    getSeasonEpisodes,
  ]);

  const handleSelectSeason = async (seasonNumber: number) => {
    if (!item?.title) return;

    setSelectedSeason(seasonNumber);
    setIsLoadingEpisodes(true);
    setEpisodes([]);

    try {
      const episodeList = await getSeasonEpisodes({
        tmdbId: item.title.tmdbId,
        seasonNumber,
      });
      setEpisodes(episodeList);
    } catch (error) {
      toast.error("Failed to load episodes");
      console.error(error);
    } finally {
      setIsLoadingEpisodes(false);
    }
  };

  const form = useForm({
    defaultValues: {
      status: (item?.status || "PLANNED") as HistoryStatus,
      currentEpisode: item?.currentEpisode?.toString() || "",
      currentSeason: item?.currentSeason?.toString() || "",
      currentRuntime: item?.currentRuntime?.toString() || "",
      isFavourite: item?.isFavourite || false,
    },
    onSubmit: async ({ value }) => {
      if (!item) return;

      setIsSaving(true);
      try {
        await onSave(item._id as Id<"history">, {
          status: value.status,
          currentEpisode: value.currentEpisode
            ? Math.floor(parseFloat(value.currentEpisode))
            : undefined,
          currentSeason: value.currentSeason
            ? Math.floor(parseFloat(value.currentSeason))
            : undefined,
          currentRuntime: value.currentRuntime
            ? Math.floor(parseFloat(value.currentRuntime))
            : undefined,
          isFavourite: value.isFavourite,
        });
        toast.success("History updated successfully");
        onOpenChange(false);
      } catch (error) {
        toast.error("Failed to update history");
        console.error(error);
      } finally {
        setIsSaving(false);
      }
    },
  });

  if (!item) return null;

  const isSeries = item.title?.mediaType === "SERIES";

  const formatEpisodeDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const getSeasonYear = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.getFullYear().toString();
    } catch {
      return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit History</DialogTitle>
          <DialogDescription>
            Update details for {item.title?.name || "this item"}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="status">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Status</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value: HistoryStatus) =>
                    field.handleChange(value as HistoryItem["status"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FINISHED">Finished</SelectItem>
                    <SelectItem value="WATCHING">Watching</SelectItem>
                    <SelectItem value="PLANNED">Planned</SelectItem>
                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    <SelectItem value="DROPPED">Dropped</SelectItem>
                    <SelectItem value="REWATCHING">Rewatching</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          {isLoadingDetails && (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {!isLoadingDetails && titleDetails && (
            <>
              {isSeries ? (
                <>
                  <form.Field name="currentSeason">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>Season</Label>
                        <Select
                          value={
                            selectedSeason !== null
                              ? selectedSeason.toString()
                              : field.state.value || ""
                          }
                          onValueChange={(value: string) => {
                            const seasonNum = parseInt(value, 10);
                            setSelectedSeason(seasonNum);
                            field.handleChange(value);
                            handleSelectSeason(seasonNum);
                            form.setFieldValue("currentEpisode", "");
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select season" />
                          </SelectTrigger>
                          <SelectContent>
                            {titleDetails.seasons?.map((season) => {
                              const year = getSeasonYear(season.airDate);
                              return (
                                <SelectItem
                                  key={season.seasonNumber}
                                  value={season.seasonNumber.toString()}
                                >
                                  {season.name}
                                  {year && ` (${year})`} ({season.episodeCount}{" "}
                                  episodes)
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </form.Field>
                  {selectedSeason !== null && (
                    <form.Field name="currentEpisode">
                      {(field) => (
                        <div className="space-y-2">
                          <Label htmlFor={field.name}>Episode</Label>
                          {isLoadingEpisodes ? (
                            <Skeleton className="h-10 w-full" />
                          ) : (
                            <Select
                              value={field.state.value || ""}
                              onValueChange={(value: string) =>
                                field.handleChange(value)
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select episode" />
                              </SelectTrigger>
                              <SelectContent>
                                {episodes.map((ep) => {
                                  const dateStr = formatEpisodeDate(ep.airDate);
                                  return (
                                    <SelectItem
                                      key={ep.episodeNumber}
                                      value={ep.episodeNumber.toString()}
                                    >
                                      {ep.episodeNumber}. {ep.name}
                                      {dateStr && ` - ${dateStr}`}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      )}
                    </form.Field>
                  )}
                </>
              ) : (
                <form.Field name="currentRuntime">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>
                        Runtime (minutes)
                        {titleDetails.runtime && (
                          <span className="text-muted-foreground text-xs ml-2">
                            Max: {titleDetails.runtime} min
                          </span>
                        )}
                      </Label>
                      <Input
                        id={field.name}
                        type="number"
                        min="0"
                        max={titleDetails.runtime || undefined}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Runtime in minutes"
                      />
                    </div>
                  )}
                </form.Field>
              )}
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <form.Subscribe>
              {(state) => (
                <Button type="submit" disabled={isSaving || !state.canSubmit}>
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
