"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { tmdbImageLoader } from "@/lib/utils";
import { useAction } from "convex/react";
import { Calendar } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";

type TrendingTitle = {
  id: number;
  name: string;
  posterUrl: string | null;
  mediaType: "MOVIE" | "SERIES";
  tmdbId: number;
};

function ShowcaseCard({
  title,
  index,
}: {
  title: TrendingTitle;
  index: number;
}) {
  const mockProgress = [45, 68, 80][index] ?? 50;
  const mockSubtitle =
    title.mediaType === "MOVIE"
      ? "1h 23m logged"
      : `S0${index + 1} • E0${index + 3}`;
  const mockProgressLabel =
    title.mediaType === "MOVIE"
      ? "1h 23m / 2h 5m"
      : `S0${index + 1} • E0${index + 3} of 10`;
  const mockNextEpisode = index === 0 ? "Monday, Jan 15" : undefined;

  return (
    <Card className="rounded-xl border bg-card p-4">
      <div className="flex gap-4">
        {title.posterUrl ? (
          <Image
            width={56}
            height={80}
            loader={tmdbImageLoader}
            src={title.posterUrl}
            alt={title.name}
            className="h-20 w-14 shrink-0 object-cover rounded"
          />
        ) : (
          <div className="h-20 w-14 shrink-0 rounded bg-linear-to-br from-muted to-muted/60" />
        )}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold truncate">{title.name}</h4>
              <p className="text-sm text-muted-foreground">{mockSubtitle}</p>
            </div>
            <Badge className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Trending
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{mockProgressLabel}</span>
              <span className="font-medium">{mockProgress}%</span>
            </div>
            <Progress value={mockProgress} className="h-1.5" />
          </div>

          {mockNextEpisode && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Next: {mockNextEpisode}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function HeroShowcase() {
  const [trendingTitles, setTrendingTitles] = useState<TrendingTitle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const getTrendingTitles = useAction(api.tmdb.getTrendingTitles);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const titles = await getTrendingTitles({ limit: 3 });
        setTrendingTitles(titles);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Failed to load trending titles:", error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, [getTrendingTitles]);

  return (
    <Card className="rounded-2xl border bg-card p-6">
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Currently Watching
          </p>
          <h3 className="mt-1 text-xl font-semibold">
            {isLoading ? "Loading..." : `${trendingTitles.length} titles`}
          </h3>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i} className="rounded-xl border bg-card p-4">
                  <div className="flex gap-4">
                    <Skeleton className="h-20 w-14 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  </div>
                </Card>
              ))}
            </>
          ) : (
            trendingTitles.map((title, index) => (
              <ShowcaseCard key={title.id} title={title} index={index} />
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
