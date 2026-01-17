"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { tmdbImageLoader } from "@/lib/utils";
import { useHistoryStore } from "@/stores/history-store";
import { useAction } from "convex/react";
import { Film, Tv } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { TrendingTitleDialog } from "./trending-title-dialog";

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
          <div className="absolute bottom-1 right-1 flex -space-x-1.5">
            {title.providers.map((logo, i) => (
              <div
                key={i}
                className="relative h-5 w-5 overflow-hidden rounded-full border border-white bg-background shadow-sm"
              >
                <Image
                  loader={tmdbImageLoader}
                  src={logo}
                  alt="Provider"
                  fill
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
  const [trendingTitles, setTrendingTitles] = useState<TrendingTitle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTitle, setSelectedTitle] = useState<TrendingTitle | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const getTrendingTitles = useAction(api.tmdb.getTrendingTitles);
  const isTitleAdded = useHistoryStore((state) => state.isTitleAdded);

  useEffect(() => {
    const fetchTitles = async () => {
      try {
        const titles = await getTrendingTitles({ limit: 100 });
        const filteredTitles = titles.filter(
          (title) => !isTitleAdded(title.tmdbId)
        );
        setTrendingTitles(filteredTitles);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Failed to load trending titles:", error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTitles();
  }, [getTrendingTitles, isTitleAdded]);

  const handleTitleClick = (title: TrendingTitle) => {
    setSelectedTitle(title);
    setIsDialogOpen(true);
  };

  const handleTitleAdded = (tmdbId: number) => {
    setTrendingTitles((prev) =>
      prev.filter((title) => title.tmdbId !== tmdbId)
    );
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

      <TrendingTitleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={selectedTitle}
        onTitleAdded={handleTitleAdded}
      />
    </>
  );
}
