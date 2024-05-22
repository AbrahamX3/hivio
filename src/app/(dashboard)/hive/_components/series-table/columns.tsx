import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { ClockIcon, InfoIcon, StarIcon } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/datatable/data-table-column-header";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { genreOptions, statusOptions, typeOptions } from "@/lib/options";

import { type HiveData } from "../../actions";
import { HiveSeriesTableActions } from "./actions";

export function SeriesColumns() {
  const columns: ColumnDef<HiveData[0]>[] = [
    {
      id: "Title Name",
      accessorFn: (row) => row.title.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title Name" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="flex max-w-[500px] items-center gap-2 truncate align-middle font-medium">
              {row.original.isFavorite && (
                <StarIcon className="size-4 text-primary" />
              )}
              <span>{row.getValue("Title Name")}</span>
            </span>
          </div>
        );
      },
    },
    {
      id: "Year",
      accessorFn: (row) => row.title.release_date,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Year" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              {new Date(row.getValue("Year")).getFullYear()}
            </span>
          </div>
        );
      },
      filterFn: (row, id, value: string) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: "Your Rating",
      accessorFn: (row) => row.rating,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Your Rating" />
      ),

      cell: ({ row }) => {
        const rating = Number(row.getValue("Your Rating")).toFixed(1);
        return (
          <div className="flex space-x-2">
            <span
              title={`${rating} / 10`}
              className="max-w-[500px] truncate font-medium"
            >
              {rating} / 10
            </span>
          </div>
        );
      },
    },
    {
      id: "Rating",
      accessorFn: (row) => row.title.rating,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rating" />
      ),
      cell: ({ row }) => {
        const rating = Number(row.getValue("Rating")).toFixed(1);
        return (
          <div className="flex space-x-2">
            <span
              title={`${rating} / 10`}
              className="max-w-[500px] truncate font-medium"
            >
              {rating} / 10
            </span>
          </div>
        );
      },
      filterFn: (row, id, value: string[]) => {
        return value.every((val: string) =>
          row.getValue<string[]>(id).includes(val),
        );
      },
    },
    {
      id: "Season Details",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Season Details" />
      ),
      cell: ({ row }) => {
        const orderedSeasons = row.original.title.seasons.sort(
          (a, b) => a.season - b.season,
        );
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                disabled={row.original.title.type === "MOVIE"}
                variant="outline"
                size="sm"
                className="relative w-full"
              >
                <div className="flex w-full items-center justify-between gap-2 truncate align-middle font-medium">
                  <span>Seasons</span>
                  <InfoIcon className="size-3" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="flex max-h-56 w-52 flex-col justify-between gap-4 overflow-y-auto scrollbar scrollbar-track-muted scrollbar-thumb-foreground scrollbar-thumb-rounded-md scrollbar-w-2">
              <div className="flex flex-col gap-2 align-middle text-sm">
                {row.original.currentSeason && row.original.currentSeason && (
                  <div>
                    {row.original.status === "WATCHING" && (
                      <p>
                        <span className="font-semibold">Currently on: </span>
                        <Badge>
                          s{row.original.currentSeason}e
                          {row.original.currentEpisode}
                        </Badge>
                      </p>
                    )}

                    {row.original.status === "UNFINISHED" && (
                      <p>
                        <span className="font-semibold">Stayed on: </span>
                        <Badge>
                          s{row.original.currentSeason}e
                          {row.original.currentEpisode}
                        </Badge>
                      </p>
                    )}

                    {row.original.status === "FINISHED" && (
                      <p>
                        <span className="font-semibold">Finished on: </span>
                        <Badge>
                          s{row.original.currentSeason}e
                          {row.original.currentEpisode}
                        </Badge>
                      </p>
                    )}
                  </div>
                )}

                <Accordion type="single" collapsible className="w-full">
                  {orderedSeasons.map(({ season, episodes, air_date, id }) => (
                    <AccordionItem key={id} value={id}>
                      <AccordionTrigger>Season {season}</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex gap-x-2 align-middle">
                          <span className="font-bold">Air Date</span>
                          <span className="font-extralight">
                            {new Date(air_date.toString()).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-x-2 align-middle">
                          <span className="font-bold">Total of Episodes</span>
                          <span className="font-extralight">{episodes}</span>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </PopoverContent>
          </Popover>
        );
      },
    },
    {
      id: "Genres",
      accessorFn: (row) => row.title.genres,
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Genres" />
      ),
      cell: ({ row }) => {
        const genres = genreOptions
          .filter((genre) =>
            row.getValue<number[]>("Genres").includes(genre.value),
          )
          .map((genre) => genre.label);

        if (!genres) {
          return null;
        }

        return (
          <div className="flex w-[100px] items-center">
            <span>{genres.join(", ")}</span>
          </div>
        );
      },
      filterFn: (row, id, value: string[]) => {
        return value.every((val: string) =>
          row.getValue<string[]>(id).includes(val),
        );
      },
    },
    {
      id: "Type",
      accessorFn: (row) => row.title.type,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = typeOptions.find(
          (type) => type.value === row.getValue("Type"),
        );

        if (!type) {
          return null;
        }

        return (
          <div className="flex w-[100px] items-center">
            {type.icon && (
              <type.icon className="mr-2 size-4 text-muted-foreground" />
            )}
            <span>{type.label}</span>
          </div>
        );
      },
      filterFn: (row, id, value: string) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: "Start/Finished",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Start/Finished" />
      ),
      cell: ({ row }) => {
        return row.original.startedAt ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <ClockIcon className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full">
              <Tabs defaultValue="local" className="w-full">
                <TabsList>
                  <TabsTrigger value="local">
                    {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </TabsTrigger>
                  <TabsTrigger value="utc">UTC</TabsTrigger>
                </TabsList>
                <TabsContent value="local">
                  <div className="flex flex-col gap-y-2">
                    <span className="font-medium">Started On:</span>
                    <span>
                      {format(
                        toZonedTime(
                          new Date(row.original.startedAt),
                          Intl.DateTimeFormat().resolvedOptions().timeZone,
                        ),
                        "PPPP",
                      )}
                    </span>
                    {row.original.finishedAt && (
                      <>
                        <span className="font-medium">Finished On:</span>
                        <span>
                          {format(
                            toZonedTime(
                              new Date(row.original.finishedAt),
                              Intl.DateTimeFormat().resolvedOptions().timeZone,
                            ),
                            "PPPP",
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="utc">
                  <div className="flex flex-col gap-y-2">
                    <span className="font-medium">Started On:</span>
                    <span>{format(row.original.startedAt, "PPPP")}</span>
                    {row.original.finishedAt && (
                      <>
                        <span className="font-medium">Finished On:</span>
                        <span>{format(row.original.finishedAt, "PPPP")}</span>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </PopoverContent>
          </Popover>
        ) : (
          <Button disabled variant="outline" className="w-max">
            N/A
          </Button>
        );
      },
    },
    {
      id: "Status",
      accessorFn: (row) => row.status,
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = statusOptions.find(
          (status) => status.value === row.getValue("Status"),
        );

        if (!status) {
          return null;
        }

        return (
          <div className="flex w-[100px] items-center">
            {status.icon && (
              <status.icon className="mr-2 size-4 text-muted-foreground" />
            )}
            <span>{status.label}</span>
          </div>
        );
      },
      filterFn: (row, id, value: string) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: "actions",
      header: () => <div className="sr-only hidden">Actions</div>,
      cell: ({ row }) => {
        return <HiveSeriesTableActions row={row} />;
      },
    },
  ];

  return columns;
}
