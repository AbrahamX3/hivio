"use client";

import type { HiveProfile } from "@/app/(profile)/actions";
import { DataTable } from "@/components/ui/datatable/data-table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { genreOptions, statusOptions } from "@/lib/options";
import type { UserSession } from "@/types/auth";

import { MovieColumns } from "./columns";

export default function MoviesTableView({
	data,
	currentUser,
}: {
	data: HiveProfile;
	currentUser: UserSession | null;
}) {
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
				name="public-hive-movies"
				columns={MovieColumns(currentUser)}
				data={data}
				filters={filters}
			/>
		</TooltipProvider>
	);
}
