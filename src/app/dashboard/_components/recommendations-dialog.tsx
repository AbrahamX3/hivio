"use client";

import { useQuery } from "@tanstack/react-query";
import {
	getCoreRowModel,
	getFacetedMinMaxValues,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type ColumnFiltersState,
} from "@tanstack/react-table";
import { Star } from "lucide-react";
import * as React from "react";

import { typeColors } from "@/app/dashboard/_components/history-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { TitleDetailsDialog } from "@/components/title-details-dialog";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getGenreName } from "@/lib/genres";
import { client } from "@/lib/orpc";

interface RecommendationItem {
	id: number;
	name: string;
	posterPath: string | null;
	overview: string | null;
	releaseDate: string | null;
	voteAverage: number | null;
	genreIds: number[];
	mediaType: "MOVIE" | "SERIES";
}

interface RecommendationsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tmdbId: number;
	mediaType: "MOVIE" | "SERIES";
	titleName: string;
}

export function RecommendationsDialog({
	open,
	onOpenChange,
	tmdbId,
	mediaType: sourceMediaType,
	titleName,
}: RecommendationsDialogProps) {
	const { data: recommendations, isLoading } = useQuery({
		queryKey: ["tmdb", "recommendations", tmdbId, sourceMediaType],
		queryFn: () =>
			client.tmdb.getRecommendations({
				tmdbId,
				mediaType: sourceMediaType,
				pages: 3,
			}),
		enabled: open && tmdbId > 0,
	});

	const data = React.useMemo(() => recommendations ?? [], [recommendations]);

	const genreOptions = React.useMemo(() => {
		const seen = new Set<string>();
		const all: { label: string; value: string }[] = [];
		for (const item of data) {
			for (const id of item.genreIds) {
				const label = getGenreName(id, item.mediaType);
				const value = id.toString();
				if (!seen.has(value)) {
					seen.add(value);
					all.push({ label, value });
				}
			}
		}
		return all.sort((a, b) => a.label.localeCompare(b.label));
	}, [data]);

	const columns = React.useMemo<ColumnDef<RecommendationItem>[]>(
		() => [
			{
				id: "title",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} label="Title" />
				),
				accessorKey: "name",
				cell: ({ row }) => {
					const item = row.original;
					return (
						<div className="flex items-center gap-2">
							{item.posterPath && (
								<TitleDetailsDialog
									title={{
										name: item.name,
										posterUrl: `https://image.tmdb.org/t/p/w500${item.posterPath}`,
										description: item.overview ?? undefined,
										directors: [],
										tmdbId: item.id,
										mediaType: item.mediaType,
										releaseDate: item.releaseDate ?? "",
										genres: item.genreIds,
									}}
									triggerImage={{
										width: 28,
										height: 40,
										loading: "lazy",
										className: "h-14 w-10",
									}}
								/>
							)}
							<div className="min-w-0 flex-1">
								<div className="truncate text-sm font-medium">{item.name}</div>
							</div>
						</div>
					);
				},
				meta: {
					label: "Title",
					placeholder: "Search titles...",
					variant: "text",
				},
				enableColumnFilter: true,
			},
			{
				id: "year",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} label="Year" />
				),
				accessorKey: "releaseDate",
				cell: ({ row }) => {
					const date = row.original.releaseDate;
					return date ? (
						<span className="text-sm tabular-nums">
							{new Date(date).getFullYear()}
						</span>
					) : (
						<span className="text-muted-foreground">-</span>
					);
				},
				enableColumnFilter: false,
			},
			{
				id: "genres",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} label="Genres" />
				),
				accessorKey: "genreIds",
				filterFn: (row, id, filterValue: string[]) => {
					const ids = row.getValue(id) as number[];
					if (!ids?.length) return false;
					return filterValue.some((v) => ids.includes(Number(v)));
				},
				cell: ({ row }) => {
					const ids = row.original.genreIds;
					const mt = row.original.mediaType;
					return (
						<div className="flex flex-wrap gap-1">
							{ids.slice(0, 2).map((id) => (
								<Badge key={id} variant="outline" className="text-[0.65rem]">
									{getGenreName(id, mt)}
								</Badge>
							))}
							{ids.length > 2 && (
								<Badge variant="outline" className="text-[0.65rem]">
									+{ids.length - 2}
								</Badge>
							)}
						</div>
					);
				},
				meta: {
					label: "Genres",
					variant: "multiSelect",
					options: genreOptions,
				},
				enableColumnFilter: true,
			},
			{
				id: "rating",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} label="Rating" />
				),
				accessorKey: "voteAverage",
				cell: ({ row }) => {
					const rating = row.original.voteAverage;
					if (!rating) return <span className="text-muted-foreground">-</span>;
					return (
						<div className="flex items-center gap-1">
							<Star className="size-3 fill-yellow-500 text-yellow-500" />
							<span className="text-sm font-medium">{rating.toFixed(1)}</span>
						</div>
					);
				},
				enableColumnFilter: false,
			},
		],
		[genreOptions],
	);

	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);

	const table = useReactTable({
		data,
		columns,
		state: { columnFilters },
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		getFacetedMinMaxValues: getFacetedMinMaxValues(),
		initialState: { pagination: { pageSize: 10 } },
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-full w-full sm:max-w-3xl overflow-y-auto">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<DialogTitle>Recommendations</DialogTitle>
						<Badge className={typeColors[sourceMediaType]}>
							{sourceMediaType === "MOVIE" ? "Movie" : "Series"}
						</Badge>
					</div>
					<DialogDescription>Based on {titleName}</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="space-y-2">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton key={i} className="h-10 w-full" />
						))}
					</div>
				) : !data.length ? (
					<p className="text-muted-foreground py-8 text-center text-sm">
						No recommendations found.
					</p>
				) : (
					<DataTable table={table}>
						<DataTableToolbar table={table} />
					</DataTable>
				)}
			</DialogContent>
		</Dialog>
	);
}
