"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { StarIcon } from "lucide-react";
import { Link } from "next-view-transitions";

import { DataTableColumnHeader } from "@/components/ui/datatable/data-table-column-header";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { genreOptions, statusOptions } from "@/lib/options";

import type { HiveData } from "../../actions";
import { HiveMoviesTableActions } from "./actions";

export function MovieColumns() {
	const columns: ColumnDef<HiveData[0]>[] = [
		{
			id: "actions",
			header: () => <div className="sr-only hidden">Actions</div>,
			cell: ({ row }) => {
				return <HiveMoviesTableActions row={row} />;
			},
		},
		{
			id: "Title Name",
			accessorFn: (row) => row.title.name,
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Title Name" />
			),
			cell: ({ row }) => {
				return (
					<Tooltip>
						<TooltipTrigger>
							<Link
								prefetch={false}
								className="flex max-w-[250px] gap-2 truncate"
								href={`/hive/${row.original.id}`}
							>
								<span className="flex justify-start gap-2 align-middle font-medium">
									{row.original.isFavorite && (
										<StarIcon className="size-4 text-primary" />
									)}
									<span className="w-[200px] truncate text-left duration-150 ease-in-out hover:text-primary">
										{row.getValue("Title Name")}
									</span>
								</span>
							</Link>
						</TooltipTrigger>
						<TooltipContent className="w-fit max-w-[250px] text-pretty">
							{row.getValue("Title Name")}
						</TooltipContent>
					</Tooltip>
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
					<div className="flex w-[100px] items-center">
						<span>{genres.join(", ")}</span>
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
