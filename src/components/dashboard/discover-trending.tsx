"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { tmdbImageLoader } from "@/lib/utils";
import { useHistoryStore } from "@/stores/history-store";
import { useAction, useQuery } from "convex/react";
import { Film, Tv } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { TitleDetailsDialog } from "../title-details-dialog";

type TrendingTitle = {
  id: number;
  name: string;
  posterUrl: string | null;
  mediaType: "MOVIE" | "SERIES";
  tmdbId: number;
  providers: string[];
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
  const getTrendingTitles = useAction(api.tmdb.getTrendingTitles);
  const addToHistory = useAction(api.history.addFromTmdb);
  const isTitleAdded = useHistoryStore((state) => state.isTitleAdded);

  const historyData = useQuery(api.history.getAll, {
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
        const titles = await getTrendingTitles({ limit: 100 });
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
              {[1, 2, 3, 4, 5, 6].map((i) => (
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
                  key={title.id}
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
            tmdbId: selectedTitle.tmdbId,
            mediaType: selectedTitle.mediaType,
          }}
          showAddToWatchlist
          onAddToWatchlist={async (tmdbId) => {
            try {
              await addToHistory({
                tmdbId,
                mediaType: selectedTitle.mediaType,
                status: "PLANNED",
              });
              toast.success("Added to watchlist!");
              handleTitleAdded(tmdbId);
            } catch (error) {
              toast.error("Failed to add to watchlist");
              throw error;
            }
          }}
        />
      )}
    </>
  );
}
