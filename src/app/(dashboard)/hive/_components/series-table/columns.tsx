import { type ColumnDef } from "@tanstack/react-table";
import { InfoIcon } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/datatable/data-table-column-header";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { genreOptions, statusOptions, typeOptions } from "@/lib/options";
import { type HiveRowData } from "@/types/hive";

import { HiveSeriesTableActions } from "./actions";

export function SeriesColumns() {
  const columns: ColumnDef<HiveRowData>[] = [
    {
      id: "Title Name",
      accessorFn: (row) => row.title.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title Name" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              {row.getValue("Title Name")}
            </span>
          </div>
        );
      },
    },
    {
      id: "Year",
      accessorFn: (row) => row.title.date,
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
                <Accordion type="single" collapsible className="w-full">
                  {orderedSeasons.map(({ season, episodes, date, id }) => (
                    <AccordionItem key={id} value={id}>
                      <AccordionTrigger>Season {season}</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex gap-x-2 align-middle">
                          <span className="font-bold">Air Date</span>
                          <span className="font-extralight">
                            {new Date(date.toString()).toLocaleDateString()}
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
