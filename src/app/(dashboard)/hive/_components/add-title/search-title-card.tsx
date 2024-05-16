import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { type SearchResult } from "@/types/tmdb";

interface SearchTitleCardProps {
  result: SearchResult;
  selectedTitleId: number;
}

export default function SearchTitleCard({
  result,
  selectedTitleId,
}: SearchTitleCardProps) {
  return (
    <Card
      className={cn(
        "w-full max-w-md md:max-w-2xl",
        selectedTitleId === result.id && "border-2 border-primary",
      )}
    >
      {result.media_type === "movie" ? (
        <>
          <CardHeader className="grid gap-1 p-4">
            <CardTitle className="flex items-center gap-2 align-middle">
              {result.title}{" "}
              <Badge variant="outline">
                {result.release_date
                  ? new Date(result.release_date).toLocaleDateString()
                  : "N/A"}
              </Badge>
            </CardTitle>
            <CardDescription>
              <Badge role="note">Movie</Badge>
              <Badge role="note" variant="secondary">
                {result.vote_average.toFixed(1)} / 10
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex max-h-56 min-h-56 items-center gap-4 p-4 align-middle">
            <div className="h-full max-h-52 min-h-52 overflow-y-auto rounded-md border scrollbar scrollbar-track-muted scrollbar-thumb-foreground scrollbar-thumb-rounded-md scrollbar-w-2">
              <p className="h-full overflow-auto text-pretty p-4 text-sm leading-relaxed tracking-wide">
                {result.overview}
              </p>
            </div>
            {result.poster_path && (
              <Dialog>
                <DialogTrigger asChild>
                  <Image
                    unoptimized
                    src={`https://image.tmdb.org/t/p/w154${result.poster_path}`}
                    alt={result.title}
                    width={154}
                    height={231}
                    className="h-48 w-auto cursor-pointer rounded-md transition-all hover:scale-105"
                  />
                </DialogTrigger>
                <DialogContent className="h-[90vh]">
                  <div className="max-h-[85vh] w-full p-6">
                    <Image
                      src={`https://image.tmdb.org/t/p/w780${result.poster_path}`}
                      alt={result.title}
                      unoptimized
                      width={780}
                      height={1170}
                      className="h-full rounded-md"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader className="grid gap-1 p-4">
            <CardTitle className="flex items-center gap-2 align-middle">
              {result.name}{" "}
              <Badge variant="outline">
                {result.first_air_date
                  ? new Date(result.first_air_date).toLocaleDateString()
                  : "N/A"}
              </Badge>
            </CardTitle>
            <CardDescription>
              <Badge role="note">Series</Badge>
              <Badge role="note" variant="secondary">
                {result.vote_average ? result.vote_average.toFixed(1) : 0} / 10
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex max-h-56 min-h-56 items-center gap-4 p-4 align-middle">
            <div className="h-full max-h-52 min-h-52 overflow-y-auto rounded-md border scrollbar scrollbar-track-muted scrollbar-thumb-foreground scrollbar-thumb-rounded-md scrollbar-w-2">
              <p className="h-full overflow-auto text-pretty p-4 text-sm leading-relaxed tracking-wide">
                {result.overview}
              </p>
            </div>
            {result.poster_path && (
              <Dialog>
                <DialogTrigger asChild>
                  <Image
                    unoptimized
                    src={`https://image.tmdb.org/t/p/w154${result.poster_path}`}
                    alt={result.name}
                    width={154}
                    height={231}
                    className="h-48 w-auto cursor-pointer rounded-md transition-all hover:scale-105"
                  />
                </DialogTrigger>
                <DialogContent className="h-[90vh]">
                  <div className="max-h-[85vh] w-full p-6">
                    <Image
                      src={`https://image.tmdb.org/t/p/w780${result.poster_path}`}
                      alt={result.name}
                      unoptimized
                      width={780}
                      height={1170}
                      className="h-full rounded-md"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
}
