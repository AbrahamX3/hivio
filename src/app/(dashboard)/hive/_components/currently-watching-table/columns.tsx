"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { InfoIcon, StarIcon } from "lucide-react";
import { Link } from "next-view-transitions";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/datatable/data-table-column-header";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { genreOptions, statusOptions, typeOptions } from "@/lib/options";

import type { HiveData } from "../../actions";
import { HiveCurrentlyWatchingTableActions } from "./actions";

export function CurrentlyWatchingColumns() {
	const columns: ColumnDef<HiveData[0]>[] = [
		{
			id: "actions",
			header: () => <div className="sr-only hidden">Actions</div>,
			cell: ({ row }) => {
				return <HiveCurrentlyWatchingTableActions row={row} />;
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
					return null;
				}

				return (
					<div className="flex w-[100px] items-center">
						{type.icon && (
							<type.icon className="mr-2 h-4 w-4 text-muted-foreground" />
						)}
						<span>{type.label}</span>
					</div>
				);
			},
			filterFn: (row, id, value: string) => {
				return value.includes(row.getValue(id));
			},
		},
		{
			id: "Season Details",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Season Details" />
			),
			cell: ({ row }) => {
				if (row.original.title.seasons.length === 0) {
					return null;
				}

				const orderedSeasons = row.original.title.seasons.sort(
					(a, b) => a.season - b.season,
				);
				return (
					<Popover>
						<PopoverTrigger asChild>
							<Button
								disabled={row.original.title.type === "MOVIE"}
								variant="outline"
								size="sm"
								className="relative w-full"
							>
								<div className="flex w-full items-center justify-between gap-2 truncate align-middle font-medium">
									<span>Seasons</span>
									<InfoIcon className="size-3" />
								</div>
							</Button>
						</PopoverTrigger>
						<PopoverContent className="flex max-h-56 w-52 flex-col justify-between gap-4 overflow-y-auto scrollbar scrollbar-track-muted scrollbar-thumb-foreground scrollbar-thumb-rounded-md scrollbar-w-2">
							<div className="flex flex-col gap-2 align-middle text-sm">
								{row.original.currentSeason && row.original.currentSeason && (
									<div>
										{row.original.status === "WATCHING" && (
											<p>
												<span className="font-semibold">Currently on: </span>
												<Badge>
													s{row.original.currentSeason}e
													{row.original.currentEpisode}
												</Badge>
											</p>
										)}

										{row.original.status === "UNFINISHED" && (
											<p>
												<span className="font-semibold">Stayed on: </span>
												<Badge>
													s{row.original.currentSeason}e
													{row.original.currentEpisode}
												</Badge>
											</p>
										)}

										{row.original.status === "FINISHED" && (
											<p>
												<span className="font-semibold">Finished on: </span>
												<Badge>
													s{row.original.currentSeason}e
													{row.original.currentEpisode}
												</Badge>
											</p>
										)}
									</div>
								)}

								<Accordion type="single" collapsible className="w-full">
									{orderedSeasons.map(({ season, episodes, air_date, id }) => (
										<AccordionItem key={id} value={id}>
											<AccordionTrigger>Season {season}</AccordionTrigger>
											<AccordionContent>
												<div className="flex gap-x-2 align-middle">
													<span className="font-bold">Air Date</span>
													<span className="font-extralight">
														{new Date(air_date.toString()).toLocaleDateString()}
													</span>
												</div>
												<div className="flex gap-x-2 align-middle">
													<span className="font-bold">Total of Episodes</span>
													<span className="font-extralight">{episodes}</span>
												</div>
											</AccordionContent>
										</AccordionItem>
									))}
								</Accordion>
							</div>
						</PopoverContent>
					</Popover>
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
