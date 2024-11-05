"use client";

import { DataTable } from "@/components/ui/datatable/data-table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { genreOptions, statusOptions, typeOptions } from "@/lib/options";

import type { HiveData } from "../../actions";
import { CurrentlyWatchingColumns } from "./columns";

export default function WatchingTableView({ data }: { data: HiveData }) {
	const filters = [
		{
			columnId: "Type",
			title: "Type",
			options: typeOptions,
		},
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
				name="private-hive-currently-watching"
				columns={CurrentlyWatchingColumns()}
				data={data}
				filters={filters}
			/>
		</TooltipProvider>
	);
}
