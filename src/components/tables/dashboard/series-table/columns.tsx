"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { ClockIcon, DramaIcon, StarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/datatable/data-table-column-header";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { genreOptions, statusOptions } from "@/lib/options";

import { FloatingDrawer } from "@/components/floating-panel";
import { HiveForm } from "@/components/hive-form";
import type { GetAll } from "@/types/hive";
import { useState } from "react";

export function SeriesColumns() {
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
			id: "Your Rating",
			accessorFn: (row) =>
				row.rating === 0 || row.rating === null ? "N/A" : row.rating,
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Your Rating" />
			),

			cell: ({ row }) => {
				const rating = row.original.rating;

				if (rating === 0 || rating === null) {
					return "N/A";
				}

				const ratingText = rating.toFixed(1);

				return (
					<div className="flex space-x-2">
						<span
							title={`${ratingText} / 10`}
							className="max-w-[500px] truncate font-medium"
						>
							{ratingText} / 10
						</span>
					</div>
				);
			},
		},
		{
			id: "Rating",
			accessorFn: (row) =>
				row.title.rating === 0 || row.title.rating === null
					? "N/A"
					: row.title.rating,
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Rating" />
			),
			cell: ({ row }) => {
				const rating = row.original.title.rating;

				if (rating === 0 || rating === null) {
					return "N/A";
				}

				const ratingText = rating.toFixed(1);

				return (
					<div className="flex space-x-2">
						<span
							title={`${ratingText} / 10`}
							className="max-w-[500px] truncate font-medium"
						>
							{ratingText} / 10
						</span>
					</div>
				);
			},
			filterFn: (row, id, value: string[]) => {
				return value.every((val: string) =>
					row.getValue<string[]>(id).includes(val),
				);
			},
		},
		{
			id: "Start/Finished",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Start/Finished" />
			),
			cell: ({ row }) => {
				return row.original.startedAt ? (
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline">
								<ClockIcon className="size-4" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-full">
							<div className="flex flex-col gap-y-2">
								<span className="font-bold">Started On:</span>
								<span>
									{format(
										toZonedTime(
											new Date(row.original.startedAt),
											Intl.DateTimeFormat().resolvedOptions().timeZone,
										),
										"PPpp",
									)}
								</span>
								{row.original.finishedAt && (
									<>
										<span className="font-bold">Finished On:</span>
										<span>
											{format(
												toZonedTime(
													new Date(row.original.finishedAt),
													Intl.DateTimeFormat().resolvedOptions().timeZone,
												),
												"PPpp",
											)}
										</span>
									</>
								)}
							</div>
						</PopoverContent>
					</Popover>
				) : (
					<Button disabled variant="outline" className="w-max">
						N/A
					</Button>
				);
			},
		},
		{
			id: "Genres",
			accessorFn: (row) => row.title.genres,
			enableSorting: false,
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Genres" />
			),
			cell: ({ row }) => {
				const genres = genreOptions
					.filter((genre) =>
						row.getValue<number[]>("Genres").includes(genre.value),
					)
					.map((genre) => genre.label);

				if (!genres) {
					return null;
				}

				return (
					<Popover>
						<PopoverTrigger asChild>
							<Button>
								<DramaIcon className="size-4" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-fit" align="end">
							{genres.join(", ")}
						</PopoverContent>
					</Popover>
				);
			},
			filterFn: (row, id, value: string[]) => {
				return value.every((val: string) =>
					row.getValue<string[]>(id).includes(val),
				);
			},
		},
		{
			id: "Status",
			accessorFn: (row) => row.status,
			accessorKey: "status",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Status" />
			),
			cell: ({ row }) => {
				const status = statusOptions.find(
					(status) => status.value === row.getValue("Status"),
				);

				if (!status) {
					return null;
				}

				return (
					<div className="flex w-[100px] items-center">
						{status.icon && (
							<status.icon className="mr-2 size-4 text-muted-foreground" />
						)}
						<span>{status.label}</span>
					</div>
				);
			},
			filterFn: (row, id, value: string) => {
				return value.includes(row.getValue(id));
			},
		},
	];

	return columns;
}
