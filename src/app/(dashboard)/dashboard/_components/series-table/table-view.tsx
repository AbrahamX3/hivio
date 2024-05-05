"use client";

import { Hive } from "@edgedb/interfaces";

import { DataTable } from "@/components/ui/datatable/data-table";
import { genreOptions, statusOptions } from "@/lib/options";

import { SeriesColumns } from "./columns";

export type HiveColumn = Omit<Hive, "createdBy">;

export default function SeriesTableView({ data }: { data: HiveColumn[] }) {
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

  return <DataTable columns={SeriesColumns()} data={data} filters={filters} />;
}