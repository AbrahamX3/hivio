"use client";

import { AddHistoryDialog } from "@/app/dashboard/_components/user-actions/add-history-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAuthAction } from "@/lib/auth-server";
import { cn, tmdbImageLoader } from "@/lib/utils";
import { Film, Tv } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
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
  genres: number[] | null;
};

function TrendingTitleCard({
  title,
  onClick,
  disabled,
}: {
  title: TrendingTitle;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Card
      className={cn(
        "group w-24 shrink-0 transition-transform hover:scale-105 hover:shadow-md",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      )}
      onClick={disabled ? undefined : onClick}
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

export function DiscoverTrending({
  trendingTitles: allTrendingTitles,
}: {
  trendingTitles: Awaited<
    ReturnType<typeof fetchAuthAction<typeof api.tmdb.getUserTrendingTitles>>
  >;
}) {
  const [isPending, startTransition] = useTransition();

  const [recentlyAddedIds, setRecentlyAddedIds] = useState<Set<number>>(
    () => new Set()
  );
  const [selectedTitle, setSelectedTitle] = useState<TrendingTitle | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddTitleDialogOpen, setIsAddTitleDialogOpen] = useState(false);
  const [addTitleInitialData, setAddTitleInitialData] = useState<{
    title: TrendingTitle;
  } | null>(null);

  const trendingTitles = allTrendingTitles.filter((title) => {
    return !recentlyAddedIds.has(title.tmdbId);
  });

  const handleTitleClick = (title: TrendingTitle) => {
    setSelectedTitle(title);
    setIsDialogOpen(true);
  };

  const handleTitleAdded = (tmdbId: number) => {
    startTransition(() => {
      setRecentlyAddedIds((prev) => new Set(prev).add(tmdbId));
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Discover what&apos;s trending</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {trendingTitles.length > 0 ? (
            <div className="[&::-webkit-scrollbar-track]:bg-muted/20 [&::-webkit-scrollbar-thumb]:bg-muted flex gap-3 overflow-x-auto px-6 py-4 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full">
              {trendingTitles.map((title) => (
                <TrendingTitleCard
                  key={`${title.id}-${title.mediaType}`}
                  title={title}
                  onClick={() => handleTitleClick(title)}
                  disabled={isPending}
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
          onOpenChange={(open) => {
            if (!isPending) {
              setIsDialogOpen(open);
            }
          }}
          title={{
            name: selectedTitle.name,
            posterUrl: selectedTitle.posterUrl || undefined,
            backdropUrl: selectedTitle.backdropUrl || undefined,
            tmdbId: selectedTitle.tmdbId,
            mediaType: selectedTitle.mediaType,
            description: selectedTitle.description || undefined,
            releaseDate: selectedTitle.releaseDate || undefined,
            genres: selectedTitle.genres || [],
          }}
          showAddToWatchlist
          onOpenAddTitleDialog={(title) => {
            if (!isPending) {
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
                  genres: title.genres || [],
                },
              });
              setIsAddTitleDialogOpen(true);
            }
          }}
        />
      )}

      {addTitleInitialData && (
        <AddHistoryDialog
          open={isAddTitleDialogOpen}
          onOpenChange={(open) => {
            if (!isPending) {
              setIsAddTitleDialogOpen(open);
              if (!open) {
                setAddTitleInitialData(null);
              }
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
            genres: addTitleInitialData.title.genres || [],
          }}
          onSuccess={() => {
            handleTitleAdded(addTitleInitialData.title.tmdbId);
          }}
        />
      )}
    </>
  );
}
