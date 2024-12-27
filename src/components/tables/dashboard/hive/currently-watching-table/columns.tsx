"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DramaIcon, InfoIcon, MinusIcon, StarIcon } from "lucide-react";

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
import { genreOptions, typeOptions } from "@/lib/options";

import { FloatingDrawer } from "@/components/floating-panel";
import { HiveForm } from "@/components/hive-form";
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
			id: "Season Details",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Season Details" />
			),
			cell: ({ row }) => {
				if (row.original.title.seasons.length === 0) {
					return <MinusIcon className="mx-auto size-4 text-muted-foreground" />;
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
						<PopoverContent className="scrollbar scrollbar-track-muted scrollbar-thumb-foreground scrollbar-thumb-rounded-md scrollbar-w-2 flex max-h-56 w-52 flex-col justify-between gap-4 overflow-y-auto">
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
	];

	return columns;
}
