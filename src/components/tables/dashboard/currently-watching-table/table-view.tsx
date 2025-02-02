"use client";

import { DataTable } from "@/components/ui/datatable/data-table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { genreOptions, typeOptions } from "@/lib/options";

import type { HiveData } from "@/app/(dashboard)/app/actions";
import { CurrentlyWatchingColumns } from "./columns";

export default function WatchingTableView({
	data,
	isLoading,
}: { data: HiveData; isLoading: boolean }) {
	const filters = [
		{
			columnId: "Type",
			title: "Type",
			options: typeOptions,
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
				isLoading={isLoading}
				name="private-hive-currently-watching"
				columns={CurrentlyWatchingColumns()}
				data={data}
				filters={filters}
			/>
		</TooltipProvider>
	);
}
