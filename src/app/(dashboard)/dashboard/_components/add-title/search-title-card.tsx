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
import { SearchResult } from "@/types/tmdb";
import Image from "next/image";

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
        "max-w-md md:max-w-2xl w-full",
        selectedTitleId === result.id && "border-primary border-2"
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
                {result.vote_average.toFixed(2)} / 10
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 flex align-middle gap-4 items-center min-h-56 max-h-56">
            <div className="overflow-y-auto border rounded-md h-full max-h-52 min-h-52 scrollbar scrollbar-track-muted scrollbar-thumb-foreground scrollbar-thumb-rounded-md scrollbar-w-2 selection:bg-gray-600 selection:text-white">
              <p className="text-sm leading-relaxed p-4 tracking-wide text-pretty overflow-auto h-full">
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
                      className="rounded-md h-full"
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
                {result.vote_average ? result.vote_average.toFixed(2) : 0} / 10
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 flex align-middle gap-4 items-center min-h-56 max-h-56">
            <div className="overflow-y-auto border rounded-md h-full max-h-52 min-h-52 scrollbar scrollbar-track-muted scrollbar-thumb-foreground scrollbar-thumb-rounded-md scrollbar-w-2 selection:bg-gray-600 selection:text-white">
              <p className="text-sm leading-relaxed p-4 tracking-wide text-pretty overflow-auto h-full">
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
                      className="rounded-md h-full"
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
