"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ClockIcon, MinusIcon, StarIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/datatable/data-table-column-header";
import { typeOptions } from "@/lib/options";

import { FloatingDrawer } from "@/components/floating-panel";
import { HiveForm } from "@/components/hive-form";
import { convertMinutesToHrMin } from "@/lib/utils";
import type { GetAll } from "@/types/hive";
import { useState } from "react";

export function CurrentlyWatchingColumns() {
	const columns: ColumnDef<GetAll[number]>[] = [
		{
			id: "Title Name",
			accessorFn: (row) => row.title.name,
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Title Name" />
			),
			cell: ({ row }) => {
				const [isPanelOpen, setIsPanelOpen] = useState(false);

				return (
					<>
						<Button
							type="button"
							variant="ghost"
							onClick={() => setIsPanelOpen(true)}
						>
							<span className="flex justify-start gap-2 align-middle font-medium">
								{row.original.isFavorite && (
									<StarIcon className="size-4 text-primary" />
								)}
								<span className="truncate text-left duration-150 ease-in-out">
									{row.getValue("Title Name")}
								</span>
							</span>
						</Button>
						{isPanelOpen && (
							<FloatingDrawer
								isOpen={isPanelOpen}
								onClose={() => setIsPanelOpen(false)}
								title={row.original.title.name}
								status={row.original.status}
								side="right"
							>
								<HiveForm id={row.original.id} />
							</FloatingDrawer>
						)}
					</>
				);
			},
		},
		{
			id: "Year",
			accessorFn: (row) => row.title.release_date,
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Year" />
			),
			cell: ({ row }) => {
				return (
					<div className="flex space-x-2">
						<span className="max-w-[500px] truncate font-medium">
							{new Date(row.getValue("Year")).getFullYear()}
						</span>
					</div>
				);
			},
			filterFn: (row, id, value: string) => {
				return value.includes(row.getValue(id));
			},
		},
		{
			id: "Type",
			accessorFn: (row) => row.title.type,
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Type" />
			),
			cell: ({ row }) => {
				const type = typeOptions.find(
					(type) => type.value === row.getValue("Type"),
				);

				if (!type) {
					return <MinusIcon className="size-4 text-muted-foreground" />;
				}

				return (
					<Badge variant="secondary">
						{type.icon && (
							<type.icon className="mr-2 size-4 text-muted-foreground" />
						)}
						<span>{type.label}</span>
					</Badge>
				);
			},
			filterFn: (row, id, value: string) => {
				return value.includes(row.getValue(id));
			},
		},
		{
			id: "Status",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Status" />
			),
			cell: ({ row }) => {
				if (row.original.title.type === "MOVIE") {
					if (!row.original.currentRunTime) {
						return (
							<Badge variant="outline">
								<ClockIcon className="mr-1 h-3 w-3" />
								N/A
							</Badge>
						);
					}

					return (
						<Badge variant="outline">
							<ClockIcon className="mr-1 h-3 w-3" />
							{convertMinutesToHrMin(row.original.currentRunTime)}
						</Badge>
					);
				}

				return (
					<Badge className="gap-1.5" variant="outline">
						<span className="opacity-60">S</span>
						{row.original.currentSeason?.toString().padStart(2, "0")}
						<span className="opacity-60">E</span>
						{row.original.currentEpisode?.toString().padStart(2, "0")}
					</Badge>
				);
			},
		},
		// {
		// 	id: "Genres",
		// 	accessorFn: (row) => row.title.genres,
		// 	enableSorting: false,
		// 	header: ({ column }) => (
		// 		<DataTableColumnHeader column={column} title="Genres" />
		// 	),
		// 	cell: ({ row }) => {
		// 		const genres = genreOptions
		// 			.filter((genre) =>
		// 				row.getValue<number[]>("Genres").includes(genre.value),
		// 			)
		// 			.map((genre) => genre.label);

		// 		if (!genres) {
		// 			return null;
		// 		}

		// 		return (
		// 			<Popover>
		// 				<PopoverTrigger asChild>
		// 					<Button>
		// 						<DramaIcon className="size-4" />
		// 					</Button>
		// 				</PopoverTrigger>
		// 				<PopoverContent className="w-fit" align="end">
		// 					{genres.join(", ")}
		// 				</PopoverContent>
		// 			</Popover>
		// 		);
		// 	},
		// 	filterFn: (row, id, value: string[]) => {
		// 		return value.every((val: string) =>
		// 			row.getValue<string[]>(id).includes(val),
		// 		);
		// 	},
		// },
	];

	return columns;
}
