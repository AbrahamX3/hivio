"use client";

import type { ColumnDef, Table as TanstackTable } from "@tanstack/react-table";

import * as React from "react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import ImageModal from "@/components/image-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDataTable } from "@/hooks/use-data-table";
import { convertMinutesToHrMin } from "@/lib/utils";
import type {
  HistoryId,
  HistoryItem,
  HistoryStatus,
  MediaType,
} from "@/types/history";
import { useQuery } from "convex/react";
import {
  ClockIcon,
  MinusIcon,
  MoreHorizontal,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { api } from "../../../../convex/_generated/api";

export type { HistoryItem };

export const statusColors: Record<HistoryStatus, string> = {
  FINISHED: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  WATCHING: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  PLANNED: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  ON_HOLD: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
  DROPPED: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  REWATCHING: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
};

export const typeColors: Record<MediaType, string> = {
  MOVIE: "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20",
  SERIES: "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20",
};

interface HistoryTableProps {
  table: TanstackTable<HistoryItem>;
  isLoading: boolean;
}

interface HistoryTableStateProps {
  onEdit: (item: HistoryItem) => void;
  onDelete: (id: HistoryId) => void;
}

export function useHistoryTable({ onEdit, onDelete }: HistoryTableStateProps) {
  const columns = React.useMemo<ColumnDef<HistoryItem>[]>(
    () => [
      {
        id: "title",
        accessorKey: "title",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Title" />
        ),
        accessorFn: (row) => row.title?.name || "",
        cell: ({ row }) => {
          const title = row.original.title;
          const isFavourite = row.original.isFavourite;
          return (
            <div className="flex min-w-50 items-center gap-3 truncate text-pretty">
              {title?.posterUrl && (
                <ImageModal
                  url={title.posterUrl}
                  alt={title.name}
                  width={32}
                  height={48}
                  loading="lazy"
                  className="h-20 w-14"
                />
              )}
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div className="truncate font-medium">
                  {title?.name || "Unknown"}
                </div>
                {isFavourite && (
                  <Star className="h-4 w-4 shrink-0 fill-yellow-500 text-yellow-500" />
                )}
              </div>
            </div>
          );
        },
        meta: {
          label: "Title",
          placeholder: "Search titles...",
          variant: "text",
        },
        enableColumnFilter: true,
      },
      {
        id: "type",
        accessorFn: (row) => row.title?.mediaType,
        header: ({ column }) => {
          return <DataTableColumnHeader column={column} label="Type" />;
        },
        cell: ({ row }) => {
          const type = row.getValue("type") as MediaType | undefined;
          if (!type) return null;
          return (
            <Badge className={typeColors[type]}>
              {type === "MOVIE" ? "Movie" : "Series"}
            </Badge>
          );
        },
        meta: {
          label: "Type",
          variant: "multiSelect",
          options: [
            { label: "Movie", value: "MOVIE" },
            { label: "Series", value: "SERIES" },
          ],
        },
        enableColumnFilter: true,
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: ({ column }) => {
          return <DataTableColumnHeader column={column} label="Status" />;
        },
        cell: ({ row }) => {
          const status = row.getValue("status") as HistoryStatus | undefined;
          if (!status) return null;
          return (
            <Badge className={statusColors[status]}>
              {status.replace("_", " ")}
            </Badge>
          );
        },
        meta: {
          label: "Status",
          variant: "multiSelect",
          options: [
            { label: "Finished", value: "FINISHED" },
            { label: "Watching", value: "WATCHING" },
            { label: "Planned", value: "PLANNED" },
            { label: "On Hold", value: "ON_HOLD" },
            { label: "Dropped", value: "DROPPED" },
            { label: "Rewatching", value: "REWATCHING" },
          ],
        },
        enableColumnFilter: true,
      },
      {
        header: "Progress",
        accessorFn: (row) =>
          row.title?.mediaType === "MOVIE"
            ? row.currentRuntime
            : row.currentSeason && row.currentEpisode,
        cell: ({ row }) => {
          const item = row.original;
          const title = item.title;
          if (title?.mediaType === "MOVIE") {
            return item.currentRuntime ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline">
                    <ClockIcon className="mr-1 h-3 w-3" />
                    {convertMinutesToHrMin(item.currentRuntime)}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="w-fit">
                  {item.currentRuntime}m
                </TooltipContent>
              </Tooltip>
            ) : (
              <MinusIcon className="h-3 w-3" />
            );
          } else {
            if (item.currentSeason && item.currentEpisode) {
              return (
                <Badge className="gap-1.5" variant="outline">
                  <span className="opacity-60">S</span>
                  {item.currentSeason?.toString().padStart(2, "0")}
                  <span className="opacity-60">E</span>
                  {item.currentEpisode?.toString().padStart(2, "0")}
                </Badge>
              );
            }
            return <MinusIcon className="h-3 w-3" />;
          }
        },
      },
      {
        id: "Release Date",
        accessorKey: "releaseDate",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Release Date" />
        ),
        cell: ({ row }) => {
          const date = row.original.title?.releaseDate;
          return date ? new Date(date).getFullYear() : "-";
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(item._id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onEdit, onDelete]
  );

  const [typeFilter] = useQueryState(
    "type",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [statusFilter] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [titleFilter] = useQueryState(
    "title",
    parseAsString.withDefault("")
  );
  const [sortParam] = useQueryState("sort", {
    parse: (value) => {
      if (!value) return [];
      try {
        const decoded = decodeURIComponent(value);
        return JSON.parse(decoded);
      } catch {
        return [];
      }
    },
    serialize: (value) => {
      if (!value || value.length === 0) return "";
      return encodeURIComponent(JSON.stringify(value));
    },
    eq: (a, b) => JSON.stringify(a) === JSON.stringify(b),
    defaultValue: [],
  });

  const queryArgs = React.useMemo(() => {
    const filters = [];

    if (typeFilter.length > 0) {
      filters.push({
        id: "type",
        value: typeFilter,
        operator: "eq",
      });
    }

    if (statusFilter.length > 0) {
      filters.push({
        id: "status",
        value: statusFilter,
        operator: "eq",
      });
    }

    if (titleFilter) {
      filters.push({
        id: "title",
        value: titleFilter,
        operator: "iLike",
      });
    }

    const parsedSort = sortParam;

    const queryKey = JSON.stringify({ filters, sort: parsedSort });

    return {
      filters,
      sort: parsedSort,
      queryKey,
    };
  }, [typeFilter, statusFilter, titleFilter, sortParam]);

  const queryKey = React.useMemo(
    () =>
      `filters:${JSON.stringify(queryArgs.filters)}|sort:${JSON.stringify(queryArgs.sort)}`,
    [queryArgs.filters, queryArgs.sort]
  );

  const data = useQuery(api.history.getAll, {
    filters: queryArgs.filters,
    sort: queryArgs.sort,
    _refresh: queryKey,
  });

  const { table } = useDataTable({
    data: data ?? [],
    columns,
    pageCount: 1,
    queryKeys: {
      page: "page",
      perPage: "perPage",
      sort: "sort",
      filters: "filters",
      joinOperator: "joinOperator",
    },
    initialState: {
      sorting: [{ id: "title", desc: false }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row._id,
  });

  return {
    table,
    data,
  };
}

export function HistoryTable({ table, isLoading }: HistoryTableProps) {
  if (isLoading) {
    return (
      <div className="w-full min-w-0 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-4">
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
