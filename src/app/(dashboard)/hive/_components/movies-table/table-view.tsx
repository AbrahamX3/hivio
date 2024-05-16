"use client";

import { DataTable } from "@/components/ui/datatable/data-table";
import { genreOptions, statusOptions } from "@/lib/options";
import { type HiveRowData } from "@/types/hive";

import { MovieColumns } from "./columns";

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

  return (
    <DataTable
      name="private-hive-movies"
      columns={MovieColumns()}
      data={data}
      filters={filters}
    />
  );
}
