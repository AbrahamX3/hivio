"use client";

import { AddTitleDialog } from "@/app/dashboard/_components/add-title-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { tmdbImageLoader } from "@/lib/utils";
import { useHistoryStore } from "@/stores/history-store";
import { useAction, useQuery } from "convex/react";
import { Film, Tv } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { TitleDetailsDialog } from "../title-details-dialog";

type TrendingTitle = {
  id: number;
  name: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  mediaType: "MOVIE" | "SERIES";
  tmdbId: number;
  providers: string[];
  description: string | null;
  releaseDate: string | null;
  genres: string | null;
};

function TrendingTitleCard({
  title,
  onClick,
}: {
  title: TrendingTitle;
  onClick: () => void;
}) {
  return (
    <Card
      className="group w-24 shrink-0 cursor-pointer transition-transform hover:scale-105 hover:shadow-md"
      onClick={onClick}
    >
      <div className="relative aspect-2/3 overflow-hidden rounded-t-lg">
        {title.posterUrl ? (
          <Image
            width={96}
            height={144}
            loader={tmdbImageLoader}
            src={title.posterUrl}
            alt={title.name}
            loading="eager"
            className="h-full w-full object-cover transition-transform group-hover:scale-110"
          />
        ) : (
          <div className="bg-muted flex h-full w-full items-center justify-center">
            {title.mediaType === "MOVIE" ? (
              <Film className="text-muted-foreground h-4 w-4" />
            ) : (
              <Tv className="text-muted-foreground h-4 w-4" />
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
        {title.providers && title.providers.length > 0 && (
          <div className="absolute right-1 bottom-1 flex -space-x-1.5">
            {title.providers.map((logo, i) => (
              <div
                key={i}
                className="bg-background relative h-5 w-5 overflow-hidden rounded-full border border-white shadow-sm"
              >
                <Image
                  loader={tmdbImageLoader}
                  src={logo}
                  alt="Provider"
                  height={20}
                  width={20}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <CardContent className="p-2">
        <h4 className="line-clamp-2 text-xs leading-tight font-medium">
          {title.name}
        </h4>
      </CardContent>
    </Card>
  );
}

export function DiscoverTrending() {
  const [allTrendingTitles, setAllTrendingTitles] = useState<TrendingTitle[]>(
    []
  );
  const [recentlyAddedIds, setRecentlyAddedIds] = useState<Set<number>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTitle, setSelectedTitle] = useState<TrendingTitle | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddTitleDialogOpen, setIsAddTitleDialogOpen] = useState(false);
  const [addTitleInitialData, setAddTitleInitialData] = useState<{
    title: TrendingTitle;
  } | null>(null);
  const getTrendingTitles = useAction(api.tmdb.getTrendingTitles);
  const isTitleAdded = useHistoryStore((state) => state.isTitleAdded);

  const historyData = useQuery(api.history.getAllItems, {
    filters: [],
    sort: [],
    _refresh: "discover-trending",
  });

  const addedTmdbIds = useMemo(() => {
    if (!historyData) return new Set<string>();
    return new Set(
      historyData
        .map((item) => item.title?.tmdbId?.toString())
        .filter((id): id is string => id !== undefined)
    );
  }, [historyData]);

  useEffect(() => {
    const fetchTitles = async () => {
      try {
        const titles = await getTrendingTitles({ limit: 3 });
        setAllTrendingTitles(titles);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Failed to load trending titles:", error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTitles();
  }, [getTrendingTitles]);

  const trendingTitles = useMemo(() => {
    if (allTrendingTitles.length === 0) return [];

    if (historyData === undefined) return allTrendingTitles;

    return allTrendingTitles.filter((title) => {
      if (recentlyAddedIds.has(title.tmdbId)) return false;

      const tmdbIdStr = title.tmdbId.toString();
      return !addedTmdbIds.has(tmdbIdStr) && !isTitleAdded(title.tmdbId);
    });
  }, [
    allTrendingTitles,
    historyData,
    addedTmdbIds,
    isTitleAdded,
    recentlyAddedIds,
  ]);

  const handleTitleClick = (title: TrendingTitle) => {
    setSelectedTitle(title);
    setIsDialogOpen(true);
  };

  const handleTitleAdded = (tmdbId: number) => {
    setRecentlyAddedIds((prev) => new Set(prev).add(tmdbId));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Discover what&apos;s trending</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="[&::-webkit-scrollbar-track]:bg-muted/20 [&::-webkit-scrollbar-thumb]:bg-muted flex gap-3 overflow-x-auto px-6 py-4 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full">
              {Array.from({ length: 20 }, (_, i) => i + 1).map((i) => (
                <div key={i} className="w-24 shrink-0 space-y-2">
                  <Skeleton className="aspect-2/3 w-full rounded-lg" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          ) : trendingTitles.length > 0 ? (
            <div className="[&::-webkit-scrollbar-track]:bg-muted/20 [&::-webkit-scrollbar-thumb]:bg-muted flex gap-3 overflow-x-auto px-6 py-4 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full">
              {trendingTitles.map((title) => (
                <TrendingTitleCard
                  key={`${title.id}-${title.mediaType}`}
                  title={title}
                  onClick={() => handleTitleClick(title)}
                />
              ))}
            </div>
          ) : (
            <div className="px-6 py-4">
              <p className="text-muted-foreground text-sm">
                No trending titles available.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTitle && (
        <TitleDetailsDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={{
            name: selectedTitle.name,
            posterUrl: selectedTitle.posterUrl || undefined,
            backdropUrl: selectedTitle.backdropUrl || undefined,
            tmdbId: selectedTitle.tmdbId,
            mediaType: selectedTitle.mediaType,
            description: selectedTitle.description || undefined,
            releaseDate: selectedTitle.releaseDate || undefined,
            genres: selectedTitle.genres || undefined,
          }}
          showAddToWatchlist
          onOpenAddTitleDialog={(title) => {
            setAddTitleInitialData({
              title: {
                id: title.tmdbId,
                name: title.name,
                posterUrl: title.posterUrl || null,
                backdropUrl: title.backdropUrl || null,
                mediaType: title.mediaType,
                tmdbId: title.tmdbId,
                providers: [],
                description: title.description || null,
                releaseDate: title.releaseDate || null,
                genres: title.genres || null,
              },
            });
            setIsAddTitleDialogOpen(true);
          }}
        />
      )}

      {addTitleInitialData && (
        <AddTitleDialog
          open={isAddTitleDialogOpen}
          onOpenChange={(open) => {
            setIsAddTitleDialogOpen(open);
            if (!open) {
              setAddTitleInitialData(null);
            }
          }}
          initialTitle={{
            id: addTitleInitialData.title.tmdbId,
            name: addTitleInitialData.title.name,
            posterUrl: addTitleInitialData.title.posterUrl || undefined,
            backdropUrl: addTitleInitialData.title.backdropUrl || undefined,
            description: addTitleInitialData.title.description || undefined,
            mediaType: addTitleInitialData.title.mediaType,
            releaseDate:
              addTitleInitialData.title.releaseDate ||
              new Date().toISOString().split("T")[0],
            genres: addTitleInitialData.title.genres || "[]",
          }}
          onSuccess={() => {
            handleTitleAdded(addTitleInitialData.title.tmdbId);
          }}
        />
      )}
    </>
  );
}
