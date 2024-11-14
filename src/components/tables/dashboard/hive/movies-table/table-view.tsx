"use client";

import { DataTable } from "@/components/ui/datatable/data-table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { genreOptions, statusOptions } from "@/lib/options";

import type { HiveData } from "../../../../../app/(dashboard)/hive/actions";
import { MovieColumns } from "./columns";

export default function MoviesTableView({ data }: { data: HiveData }) {
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
		<TooltipProvider>
			<DataTable
				name="private-hive-movies"
				columns={MovieColumns()}
				data={data}
				filters={filters}
			/>
		</TooltipProvider>
	);
}
