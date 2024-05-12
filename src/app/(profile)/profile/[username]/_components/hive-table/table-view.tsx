"use client";

import { Hive } from "@edgedb/interfaces";

import { DataTable } from "@/components/ui/datatable/data-table";
import { genreOptions, statusOptions } from "@/lib/options";

import { PublicWatchlistColumns } from "./columns";

export type HiveRowData = Omit<Hive, "createdBy">;

export default function HiveTableView({ data }: { data: HiveRowData[] }) {
  const filters = [
    {
      columnId: "Status",
      title: "Status",
      options: statusOptions,
    },
    {
      columnId: "Genres",
      title: "Genres",
      options: genreOptions,
    },
  ];

  return (
    <DataTable
      columns={PublicWatchlistColumns()}
      data={data}
      filters={filters}
    />
  );
}
