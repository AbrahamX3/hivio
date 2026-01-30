"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "convex/react";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  EditHistoryFormValues,
  Episode,
  HistoryId,
  HistoryItem,
  HistoryUpdateData,
  TitleDetails,
} from "@/types/history";
import { editHistoryFormSchema } from "@/types/history";
import { api } from "../../../../../convex/_generated/api";

interface EditHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: HistoryItem | null;
  onSave: (id: HistoryId, data: HistoryUpdateData) => Promise<void>;
}

export function EditHistoryDialog({
  open,
  onOpenChange,
  item,
  onSave,
}: EditHistoryDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [titleDetails, setTitleDetails] = useState<TitleDetails | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);

  const getDetails = useAction(api.tmdb.getDetails);
  const getSeasonEpisodes = useAction(api.tmdb.getSeasonEpisodes);

  useEffect(() => {
    if (!item?.title || !open) return;

    const loadDetails = async () => {
      setIsLoadingDetails(true);
      startTransition(() => {
        setTitleDetails(null);
        setSelectedSeason(item.currentSeason ?? null);
        setEpisodes([]);
      });

      const title = item.title;
      if (!title) return;

      try {
        const details = await getDetails({
          tmdbId: title.tmdbId,
          mediaType: title.mediaType,
        });
        startTransition(() => {
          setTitleDetails({
            imdbId: details.imdbId,
            directors: details.directors,
            runtime: details.runtime,
            seasons: details.seasons,
          });
        });

        if (item.currentSeason !== undefined) {
          setIsLoadingEpisodes(true);
          try {
            const episodeList = await getSeasonEpisodes({
              tmdbId: title.tmdbId,
              seasonNumber: item.currentSeason,
            });
            startTransition(() => {
              setEpisodes(episodeList);
            });
          } catch (error) {
            if (error instanceof Error) {
              console.error("Failed to load episodes:", error.message);
            }
          } finally {
            setIsLoadingEpisodes(false);
          }
        }
      } catch (error) {
        toast.error("Failed to load title details");
        if (error instanceof Error) {
          console.error("Load details error:", error.message);
        }
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
    open,
    getDetails,
    getSeasonEpisodes,
  ]);

  const handleSelectSeason = async (seasonNumber: number) => {
    if (!item?.title) return;

    startTransition(() => {
      setSelectedSeason(seasonNumber);
      setEpisodes([]);
    });
    setIsLoadingEpisodes(true);

    try {
      const episodeList = await getSeasonEpisodes({
        tmdbId: item.title.tmdbId,
        seasonNumber,
      });
      startTransition(() => {
        setEpisodes(episodeList);
      });
    } catch (error) {
      toast.error("Failed to load episodes");
      if (error instanceof Error) {
        console.error("Load episodes error:", error.message);
      }
    } finally {
      setIsLoadingEpisodes(false);
    }
  };

  const form = useForm<EditHistoryFormValues>({
    resolver: zodResolver(editHistoryFormSchema),
    defaultValues: {
      status: item?.status ?? "PLANNED",
      currentEpisode: item?.currentEpisode?.toString() ?? "",
      currentSeason: item?.currentSeason?.toString() ?? "",
      currentRuntime: item?.currentRuntime?.toString() ?? "",
      isFavourite: item?.isFavourite ?? false,
    },
  });

  useEffect(() => {
    if (item) {
      startTransition(() => {
        form.reset({
          status: item.status ?? "PLANNED",
          currentEpisode: item.currentEpisode?.toString() ?? "",
          currentSeason: item.currentSeason?.toString() ?? "",
          currentRuntime: item.currentRuntime?.toString() ?? "",
          isFavourite: item.isFavourite ?? false,
        });
        setSelectedSeason(item.currentSeason ?? null);
      });
    }
  }, [item, form, startTransition]);

  const onSubmit = async (data: EditHistoryFormValues) => {
    if (!item) return;

    setIsSaving(true);
    try {
      await onSave(item._id as HistoryId, {
        status: data.status,
        currentEpisode: data.currentEpisode
          ? Math.floor(parseFloat(data.currentEpisode))
          : undefined,
        currentSeason: data.currentSeason
          ? Math.floor(parseFloat(data.currentSeason))
          : undefined,
        currentRuntime: data.currentRuntime
          ? Math.floor(parseFloat(data.currentRuntime))
          : undefined,
        isFavourite: data.isFavourite,
      });
      toast.success("History updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update history");
      if (error instanceof Error) {
        console.error("Update error:", error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger disabled={isPending}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FINISHED">Finished</SelectItem>
                      <SelectItem value="WATCHING">Watching</SelectItem>
                      <SelectItem value="PLANNED">Planned</SelectItem>
                      <SelectItem value="ON_HOLD">On Hold</SelectItem>
                      <SelectItem value="DROPPED">Dropped</SelectItem>
                      <SelectItem value="REWATCHING">Rewatching</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    <FormField
                      control={form.control}
                      name="currentSeason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Season</FormLabel>
                          <Select
                            value={
                              selectedSeason !== null
                                ? selectedSeason.toString()
                                : (field.value ?? "")
                            }
                            onValueChange={(value: string) => {
                              const seasonNum = parseInt(value, 10);
                              field.onChange(value);
                              handleSelectSeason(seasonNum);
                              startTransition(() => {
                                form.setValue("currentEpisode", "");
                              });
                            }}
                            disabled={isPending}
                          >
                            <FormControl>
                              <SelectTrigger disabled={isPending}>
                                <SelectValue placeholder="Select season" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {titleDetails.seasons
                                ?.filter((season) => season.episodeCount > 0)
                                .map((season) => {
                                  const year = getSeasonYear(season.airDate);
                                  return (
                                    <SelectItem
                                      key={season.seasonNumber}
                                      value={season.seasonNumber.toString()}
                                    >
                                      {season.name}
                                      {year && ` (${year})`} (
                                      {season.episodeCount} episodes)
                                    </SelectItem>
                                  );
                                })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {selectedSeason !== null && (
                      <FormField
                        control={form.control}
                        name="currentEpisode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Episode</FormLabel>
                            {isLoadingEpisodes ? (
                              <Skeleton className="h-10 w-full" />
                            ) : (
                              <Select
                                value={field.value ?? ""}
                                onValueChange={field.onChange}
                                disabled={isPending}
                              >
                                <FormControl>
                                  <SelectTrigger disabled={isPending}>
                                    <SelectValue placeholder="Select episode" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {episodes.map((ep) => {
                                    const dateStr = formatEpisodeDate(
                                      ep.airDate
                                    );
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </>
                ) : (
                  <FormField
                    control={form.control}
                    name="currentRuntime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Runtime (minutes)
                          {titleDetails.runtime && (
                            <span className="text-muted-foreground ml-2 text-xs">
                              Max: {titleDetails.runtime} min
                            </span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max={titleDetails.runtime || undefined}
                            placeholder="Runtime in minutes"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            <FormField
              control={form.control}
              name="isFavourite"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Favorite</FormLabel>
                    <p className="text-muted-foreground text-sm">
                      Mark this title as a favorite
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || isPending}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
