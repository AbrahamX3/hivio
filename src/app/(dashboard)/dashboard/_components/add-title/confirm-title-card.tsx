import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { SearchResult } from "@/types/tmdb";
import { InfoIcon } from "lucide-react";
import Image from "next/image";
import { HiveFormValues } from "./steps/hive-form-step";

interface ConfirmTitleCardProps {
  selectedTitle?: SearchResult;
  hiveFormValues?: HiveFormValues;
}

export default function ConfirmTitleCard({
  selectedTitle,
  hiveFormValues: formValues,
}: ConfirmTitleCardProps) {
  if (!selectedTitle || !formValues)
    return (
      <div className="flex w-full flex-col items-center justify-center rounded-md border border-dashed p-8 animate-in fade-in-50">
        <h2 className="font-bold text-2xl">No Title Selected</h2>
        <div className="flex border rounded-md px-4 py-2 items-center justify-center gap-2 mt-4">
          <InfoIcon className="size-4 opacity-50" />
          <p>
            Select a movie or series by clicking on a card from the search
            results in the{" "}
            <span className="font-semibold font-mono">
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
        <div className="flex w-full max-h-56 h-full gap-4 rounded-md border border-dashed p-8 animate-in fade-in-50 overflow-hidden">
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
                    className="rounded-md h-full"
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex gap-2 items-center align-middle">
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
                  ? selectedTitle.vote_average.toFixed(2)
                  : 0}{" "}
                / 10
              </Badge>
            </div>
            <div className="overflow-y-auto border rounded-md h-full max-h-28 min-h-28 scrollbar scrollbar-track-muted scrollbar-thumb-foreground scrollbar-thumb-rounded-md scrollbar-w-2 selection:bg-gray-600 selection:text-white">
              <p className="text-sm leading-relaxed p-4 tracking-wide text-pretty overflow-auto h-full">
                {selectedTitle.overview}
              </p>
            </div>
          </div>
        </div>
        <FormValuesDisplay formValues={formValues} />
      </>
    );
  }

  return (
    <>
      <div className="flex w-full max-h-56 h-full gap-4 rounded-md border border-dashed p-8 animate-in fade-in-50 overflow-hidden">
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
                  className="rounded-md h-full"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex gap-2 items-center align-middle">
            <h2 className="font-bold leading-loose tracking-wide">
              {selectedTitle.name}
            </h2>
            <Badge variant="outline">
              {selectedTitle.first_air_date
                ? new Date(selectedTitle.first_air_date).toLocaleDateString()
                : "N/A"}
            </Badge>
            <Badge role="note">Series</Badge>
            <Badge role="note" variant="secondary">
              {selectedTitle.vote_average
                ? selectedTitle.vote_average.toFixed(2)
                : 0}{" "}
              / 10
            </Badge>
          </div>
          <p className="text-sm border rounded-md leading-relaxed p-4 tracking-wide text-pretty overflow-auto h-full scrollbar scrollbar-track-muted scrollbar-thumb-foreground scrollbar-thumb-rounded-md scrollbar-w-2">
            {selectedTitle.overview}
          </p>
        </div>
      </div>
      <FormValuesDisplay formValues={formValues} />
    </>
  );
}

function FormValuesDisplay({ formValues }: { formValues: HiveFormValues }) {
  return (
    <div className="flex w-full max-h-56 h-full gap-4 rounded-md border border-dashed p-8 animate-in fade-in-50 overflow-hidden">
      Status: <Badge>{formValues.status}</Badge>
      {formValues.status === "FINISHED" && (
        <>
          Date Finished: <Badge>{formValues.date?.toLocaleDateString()}</Badge>
          Favorite: <Badge>{formValues.isFavorite ? "Yes" : "No"}</Badge>
          {formValues.rating > 0 && (
            <>
              Rating: <Badge>{formValues.rating}</Badge>
            </>
          )}
        </>
      )}
    </div>
  );
}
