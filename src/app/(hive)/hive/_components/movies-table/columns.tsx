import { type ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/ui/datatable/data-table-column-header";
import { genreOptions, statusOptions, typeOptions } from "@/lib/options";

import { HiveMoviesTableActions } from "./actions";
import { HiveRowData } from "./table-view";

export function MovieColumns() {
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
        return <HiveMoviesTableActions row={row} />;
      },
    },
  ];

  return columns;
}