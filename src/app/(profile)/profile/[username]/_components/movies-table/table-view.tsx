"use client";

import { type HiveProfile } from "@/app/(profile)/actions";
import { DataTable } from "@/components/ui/datatable/data-table";
import { genreOptions, statusOptions } from "@/lib/options";

import { MovieColumns } from "./columns";

export default function MoviesTableView({ data }: { data: HiveProfile }) {
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
      name="public-hive-movies"
      columns={MovieColumns()}
      data={data}
      filters={filters}
    />
  );
}
