import Image from "next/image";
import { InfoIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { type SearchResult } from "@/types/tmdb";

import { type HiveFormValues } from "./stepper/steps/hive-form-step";

interface ConfirmTitleCardProps {
  selectedTitle?: SearchResult;
  hiveFormValues?: HiveFormValues;
}

export default function ConfirmTitleCard({
  selectedTitle,
  hiveFormValues,
}: ConfirmTitleCardProps) {
  const type = selectedTitle?.media_type === "movie" ? "MOVIE" : "SERIES";

  if (!selectedTitle || !hiveFormValues)
    return (
      <div className="flex w-full flex-col items-center justify-center rounded-md border border-dashed p-8 animate-in fade-in-50">
        <h2 className="text-2xl font-bold">No Title Selected</h2>
        <div className="mt-4 flex items-center justify-center gap-2 rounded-md border px-4 py-2">
          <InfoIcon className="size-4 opacity-50" />
          <p>
            Select a movie or series by clicking on a card from the search
            results in the{" "}
            <span className="font-mono font-semibold">
              &apos;Search Title&apos;
            </span>{" "}
            Step
          </p>
        </div>
      </div>
    );

  if (selectedTitle.media_type === "movie") {
    return (
      <>
        <div className="flex h-full max-h-56 w-full gap-4 overflow-hidden rounded-md border border-dashed p-8 animate-in fade-in-50">
          {selectedTitle.poster_path && (
            <Dialog>
              <DialogTrigger asChild>
                <Image
                  unoptimized
                  src={`https://image.tmdb.org/t/p/w154${selectedTitle.poster_path}`}
                  alt={selectedTitle.title}
                  width={154}
                  height={231}
                  className="h-40 w-auto cursor-pointer rounded-md transition-all hover:scale-105"
                />
              </DialogTrigger>
              <DialogContent className="h-[90vh]">
                <div className="max-h-[85vh] w-full p-6">
                  <Image
                    src={`https://image.tmdb.org/t/p/w780${selectedTitle.poster_path}`}
                    alt={selectedTitle.title}
                    unoptimized
                    width={780}
                    height={1170}
                    className="h-full rounded-md"
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex items-center gap-2 align-middle">
              <h2 className="font-bold leading-loose tracking-wide">
                {selectedTitle.title}
              </h2>
              <Badge variant="outline">
                {selectedTitle.release_date
                  ? new Date(selectedTitle.release_date).toLocaleDateString()
                  : "N/A"}
              </Badge>
              <Badge role="note">Series</Badge>
              <Badge role="note" variant="secondary">
                {selectedTitle.vote_average
                  ? selectedTitle.vote_average.toFixed(1)
                  : 0}{" "}
                / 10
              </Badge>
            </div>
            <div className="h-full max-h-28 min-h-28 overflow-y-auto rounded-md border scrollbar scrollbar-track-muted scrollbar-thumb-foreground scrollbar-thumb-rounded-md scrollbar-w-2">
              <p className="h-full overflow-auto text-pretty p-4 text-sm leading-relaxed tracking-wide">
                {selectedTitle.overview}
              </p>
            </div>
          </div>
        </div>
        <FormValuesDisplay formValues={hiveFormValues} type={type} />
      </>
    );
  }

  return (
    <>
      <div className="flex h-full max-h-56 w-full gap-4 overflow-hidden rounded-md border border-dashed p-8 animate-in fade-in-50">
        {selectedTitle.poster_path && (
          <Dialog>
            <DialogTrigger asChild>
              <Image
                unoptimized
                src={`https://image.tmdb.org/t/p/w154${selectedTitle.poster_path}`}
                alt={selectedTitle.name}
                width={154}
                height={231}
                className="h-40 w-auto cursor-pointer rounded-md transition-all hover:scale-105"
              />
            </DialogTrigger>
            <DialogContent className="h-[90vh]">
              <div className="max-h-[85vh] w-full p-6">
                <Image
                  src={`https://image.tmdb.org/t/p/w780${selectedTitle.poster_path}`}
                  alt={selectedTitle.name}
                  unoptimized
                  width={780}
                  height={1170}
                  className="h-full rounded-md"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col items-start gap-2 align-middle sm:flex-row sm:items-center">
            <h2 className="font-bold leading-loose tracking-wide">
              {selectedTitle.name}
            </h2>
            <div className="flex items-center gap-2 align-middle">
              <Badge variant="outline">
                {selectedTitle.first_air_date
                  ? new Date(selectedTitle.first_air_date).toLocaleDateString()
                  : "N/A"}
              </Badge>
              <Badge role="note">Series</Badge>
              <Badge role="note" variant="secondary">
                {selectedTitle.vote_average
                  ? selectedTitle.vote_average.toFixed(1)
                  : 0}{" "}
                / 10
              </Badge>
            </div>
          </div>
          <p className="h-full overflow-auto text-pretty rounded-md border p-4 text-sm leading-relaxed tracking-wide scrollbar scrollbar-track-muted scrollbar-thumb-foreground scrollbar-thumb-rounded-md scrollbar-w-2">
            {selectedTitle.overview}
          </p>
        </div>
      </div>
      <FormValuesDisplay formValues={hiveFormValues} type={type} />
    </>
  );
}

function FormValuesDisplay({
  formValues,
  type,
}: {
  formValues: HiveFormValues;
  type: "MOVIE" | "SERIES";
}) {
  const isFinished = formValues.status === "FINISHED";
  const shouldSetSeason =
    (isFinished ||
      formValues.status === "WATCHING" ||
      formValues.status === "UNFINISHED") &&
    type === "SERIES";

  return (
    <div className="flex h-full max-h-56 w-full gap-4 overflow-hidden rounded-md border border-dashed p-8 animate-in fade-in-50">
      Status: <Badge>{formValues.status}</Badge>
      {formValues.startedAt && (
        <span>
          Date Started:{" "}
          <Badge>{formValues.startedAt?.toLocaleDateString()}</Badge>
        </span>
      )}
      {isFinished && (
        <>
          {formValues.finishedAt && (
            <span>
              Date Finished:{" "}
              <Badge>{formValues.finishedAt?.toLocaleDateString()}</Badge>
            </span>
          )}
          Favorite: <Badge>{formValues.isFavorite ? "Yes" : "No"}</Badge>
          {formValues.rating > 0 && (
            <>
              My Rating: <Badge>{formValues.rating}</Badge>
            </>
          )}
        </>
      )}
      {shouldSetSeason && (
        <>
          On:{" "}
          <Badge>
            S{formValues.currentSeason}E{formValues.currentEpisode}
          </Badge>
        </>
      )}
    </div>
  );
}
