"use client";

import { type HiveProfile } from "@/app/(profile)/actions";
import { DataTable } from "@/components/ui/datatable/data-table";
import { genreOptions, statusOptions } from "@/lib/options";

import { SeriesColumns } from "./columns";

export default function SeriesTableView({ data }: { data: HiveProfile }) {
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
      name="public-hive-series"
      columns={SeriesColumns()}
      data={data}
      filters={filters}
    />
  );
}
