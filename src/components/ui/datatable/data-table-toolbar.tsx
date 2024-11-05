import type { Table } from "@tanstack/react-table";
import { type LucideIcon, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTableViewOptions } from "@/components/ui/datatable/data-table-view-options";
import { Input } from "@/components/ui/input";

import { DataTableFacetedFilter } from "./data-table-faceted-filter";

interface Options {
	label: string;
	value: string | number;
	icon?: LucideIcon;
}

export interface Filter {
	columnId: string;
	title: string;
	options: Options[];
}

interface DataTableToolbarProps<TData> {
	table: Table<TData>;
	setGlobalFilter: (value: string) => void;
	globalFilter: string;
	filters?: Filter[];
	name: string;
}

export function DataTableToolbar<TData>({
	table,
	setGlobalFilter,
	globalFilter,
	filters,
	name,
}: DataTableToolbarProps<TData>) {
	const isFiltered =
		table.getPreFilteredRowModel().rows.length >
		table.getFilteredRowModel().rows.length;

	const search = useSearchParams().get("search");

	const [searchParams, setSearchParams] = useState<{
		search: string;
		state: boolean;
	}>({
		search: "",
		state: true,
	});

	useEffect(() => {
		if (search && searchParams.state) {
			setSearchParams({
				search,
				state: false,
			});
		}

		if (searchParams && !searchParams.state) {
			setGlobalFilter(searchParams.search);
		}
	}, [search, searchParams, setGlobalFilter]);

	return (
		<div className="flex flex-col justify-between rounded-md align-middle lg:flex-row">
			<div className="flex gap-2">
				<Input
					placeholder="Search..."
					type="search"
					value={globalFilter ?? ""}
					onChange={(event) =>
						setGlobalFilter((event.target as HTMLInputElement).value)
					}
					className="h-8 lg:w-[250px]"
				/>
				<DataTableViewOptions table={table} />
				{isFiltered && (
					<Button
						variant="outline"
						onClick={() => {
							table.resetColumnFilters();
							table.setGlobalFilter("");
							setGlobalFilter("");
							setSearchParams({
								search: "",
								state: false,
							});
						}}
						className="h-8 px-2 lg:px-3"
						title="Reset Filters"
					>
						<span className="hidden sm:inline-block">Reset</span>
						<X className="size-4 sm:ml-2" />
					</Button>
				)}
			</div>
			<div className="flex items-center justify-center pt-4 align-middle lg:pt-0">
				<div className="flex flex-wrap gap-2 align-middle sm:flex-row">
					{filters?.map((filter) => (
						<DataTableFacetedFilter
							key={`${name}_${filter.columnId}`}
							column={table.getColumn(filter.columnId)}
							title={filter.title}
							options={filter.options}
						/>
					)) ?? null}
				</div>
			</div>
		</div>
	);
}
