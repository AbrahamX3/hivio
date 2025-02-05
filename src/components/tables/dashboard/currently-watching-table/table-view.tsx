"use client";

import { DataTable } from "@/components/ui/datatable/data-table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { typeOptions } from "@/lib/options";

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
