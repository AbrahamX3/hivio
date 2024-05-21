"use client";

import { DataTable } from "@/components/ui/datatable/data-table";
import { genreOptions, statusOptions } from "@/lib/options";

import { type HiveData } from "../../actions";
import { SeriesColumns } from "./columns";

export default function SeriesTableView({ data }: { data: HiveData }) {
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
      name="private-hive-series"
      columns={SeriesColumns()}
      data={data}
      filters={filters}
    />
  );
}
