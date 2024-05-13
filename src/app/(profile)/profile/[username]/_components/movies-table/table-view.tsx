"use client";

import { Hive } from "@edgedb/interfaces";

import { DataTable } from "@/components/ui/datatable/data-table";
import { genreOptions, statusOptions } from "@/lib/options";

import { MovieColumns } from "./columns";

export type HiveRowData = Omit<Hive, "addedBy">;

export default function MoviesTableView({ data }: { data: HiveRowData[] }) {
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

  return <DataTable columns={MovieColumns()} data={data} filters={filters} />;
}
