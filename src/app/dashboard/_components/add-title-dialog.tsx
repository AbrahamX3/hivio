"use client";

import { useAction, useMutation } from "convex/react";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
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
import { useForm } from "@tanstack/react-form";
import Image from "next/image";
import { api } from "../../../../convex/_generated/api";
import { HistoryStatus } from "../../../../convex/types";

interface AddTitleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type SearchResult = {
  id: number;
  name: string;
  posterUrl: string | undefined;
  backdropUrl: string | undefined;
  description: string | undefined;
  mediaType: "MOVIE" | "SERIES";
  releaseDate: string;
  genres: string;
};

export function AddTitleDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddTitleDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<
    "all" | "MOVIE" | "SERIES"
  >("all");
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(
    null,
  );

  const [isAdding, setIsAdding] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [titleDetails, setTitleDetails] = useState<{
    imdbId: string;
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

  const searchTmdb = useAction(api.tmdb.search);
  const getDetails = useAction(api.tmdb.getDetails);
  const getSeasonEpisodes = useAction(api.tmdb.getSeasonEpisodes);
  const addToHistory = useMutation(api.history.addFromTmdb);

  const form = useForm({
    defaultValues: {
      status: "PLANNED" as HistoryStatus,
      currentEpisode: "",
      currentSeason: "",
      currentRuntime: "",
      isFavourite: false,
    },
    onSubmit: async ({ value }) => {
      if (!selectedResult) return;

      setIsAdding(true);

      try {
        if (!titleDetails) {
          throw new Error("Title details not found");
        }

        await addToHistory({
          name: selectedResult.name,
          posterUrl: selectedResult.posterUrl,
          backdropUrl: selectedResult.backdropUrl,
          description: selectedResult.description,
          tmdbId: selectedResult.id,
          mediaType: selectedResult.mediaType,
          releaseDate: selectedResult.releaseDate,
          genres: selectedResult.genres,
          imdbId: titleDetails.imdbId,
          directors: titleDetails?.directors || [],
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
        toast.success("Title added to history");
        onOpenChange(false);
        setSearchQuery("");
        setSearchResults([]);
        setMediaTypeFilter("all");
        setSelectedResult(null);
        form.reset();
        onSuccess?.();
      } catch (error) {
        toast.error("Failed to add title");
        console.error(error);
      } finally {
        setIsAdding(false);
      }
    },
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchTmdb({
        query: searchQuery,
        mediaType: mediaTypeFilter === "all" ? undefined : mediaTypeFilter,
      });
      setSearchResults(results);
    } catch (error) {
      toast.error("Failed to search");
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectTitle = async (result: SearchResult) => {
    setSelectedResult(result);
    setIsLoadingDetails(true);
    setTitleDetails(null);
    setSelectedSeason(null);
    setEpisodes([]);

    try {
      const details = await getDetails({
        tmdbId: result.id,
        mediaType: result.mediaType,
      });
      console.log(details);
      setTitleDetails(details);
    } catch (error) {
      toast.error("Failed to load title details");
      console.error(error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSelectSeason = async (seasonNumber: number) => {
    if (!selectedResult) return;

    setSelectedSeason(seasonNumber);
    setIsLoadingEpisodes(true);
    setEpisodes([]);

    try {
      const episodeList = await getSeasonEpisodes({
        tmdbId: selectedResult.id,
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

  const handleChangeTitle = () => {
    setSelectedResult(null);
    setTitleDetails(null);
    setSelectedSeason(null);
    setEpisodes([]);
    setSearchResults([]);
    form.setFieldValue("currentSeason", "");
    form.setFieldValue("currentEpisode", "");
    form.setFieldValue("currentRuntime", "");
  };

  const isSeries = selectedResult?.mediaType === "SERIES";

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
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Title to History</DialogTitle>
          <DialogDescription>
            Search for a movie or series and add it to your watch history
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedResult && (
            <>
              <div className="flex gap-2">
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  className="flex-1"
                />
                <Select
                  value={mediaTypeFilter}
                  onValueChange={(value: "all" | "MOVIE" | "SERIES") =>
                    setMediaTypeFilter(value as "all" | "MOVIE" | "SERIES")
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="MOVIE">Movies</SelectItem>
                    <SelectItem value="SERIES">Series</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {isSearching && (
                <div className="space-y-2">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelectTitle(result)}
                      className="w-full p-3 rounded-lg border hover:bg-accent text-left flex items-center gap-3"
                    >
                      {result.posterUrl && (
                        <Image
                          width={48}
                          height={64}
                          unoptimized
                          src={`https://image.tmdb.org/t/p/w92${result.posterUrl}`}
                          alt={result.name}
                          className="h-16 w-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{result.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {result.mediaType === "MOVIE" ? "Movie" : "Series"} •{" "}
                          {result.releaseDate
                            ? new Date(result.releaseDate).getFullYear()
                            : "Unknown"}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {selectedResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                {selectedResult.posterUrl && (
                  <Image
                    width={56}
                    height={80}
                    unoptimized
                    src={`https://image.tmdb.org/t/p/w92${selectedResult.posterUrl}`}
                    alt={selectedResult.name}
                    className="h-20 w-14 object-cover rounded"
                  />
                )}
                <div>
                  <div className="font-medium">{selectedResult.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedResult.mediaType === "MOVIE" ? "Movie" : "Series"}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleChangeTitle}
                  className="ml-auto"
                >
                  Change
                </Button>
              </div>

              {isLoadingDetails && (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              )}

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
                        onValueChange={(value: HistoryStatus) => {
                          field.handleChange(value as HistoryStatus);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a fruit" />
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
                                        {year && ` (${year})`} (
                                        {season.episodeCount} episodes)
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
                                        const dateStr = formatEpisodeDate(
                                          ep.airDate,
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
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
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
                    onClick={() => {
                      onOpenChange(false);
                      handleChangeTitle();
                      setSearchQuery("");
                      setMediaTypeFilter("all");
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <form.Subscribe>
                    {(state) => (
                      <Button
                        type="submit"
                        disabled={isAdding || !state.canSubmit}
                      >
                        {isAdding ? "Adding..." : "Add to History"}
                      </Button>
                    )}
                  </form.Subscribe>
                </DialogFooter>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
