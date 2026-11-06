"use client";

import type { RowData } from "@tanstack/react-table";
import {
	ChevronDown,
	ChevronsUpDown,
	ChevronUp,
	EyeOff,
	X,
} from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DataTableColumn } from "@/lib/table-features";
import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<
	TData extends RowData,
	TValue,
> extends React.ComponentProps<typeof DropdownMenuTrigger> {
	column: DataTableColumn<TData, TValue>;
	label: string;
}

export function DataTableColumnHeader<TData extends RowData, TValue>({
	column,
	label,
	className,
	...props
}: DataTableColumnHeaderProps<TData, TValue>) {
	if (!column.getCanSort() && !column.getCanHide()) {
		return <div className={cn(className)}>{label}</div>;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className={cn(
					"hover:bg-accent focus:ring-ring data-[state=open]:bg-accent [&_svg]:text-muted-foreground -ml-1.5 flex h-8 items-center gap-1.5 rounded-md px-2 py-1.5 focus:ring-1 focus:outline-none [&_svg]:size-4 [&_svg]:shrink-0",
					className,
				)}
				{...props}
			>
				{label}
				{column.getCanSort() &&
					(column.getIsSorted() === "desc" ? (
						<ChevronDown />
					) : column.getIsSorted() === "asc" ? (
						<ChevronUp />
					) : (
						<ChevronsUpDown />
					))}
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-28">
				{column.getCanSort() && (
					<>
						<DropdownMenuCheckboxItem
							className="[&_svg]:text-muted-foreground relative gap-2 pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto"
							checked={column.getIsSorted() === "asc"}
							onClick={() => column.toggleSorting(false)}
						>
							<ChevronUp className="size-4" />
							Asc
						</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem
							className="[&_svg]:text-muted-foreground relative gap-2 pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto"
							checked={column.getIsSorted() === "desc"}
							onClick={() => column.toggleSorting(true)}
						>
							<ChevronDown className="size-4" />
							Desc
						</DropdownMenuCheckboxItem>
						{column.getIsSorted() && (
							<DropdownMenuItem
								className="[&_svg]:text-muted-foreground pl-2"
								onClick={() => column.clearSorting()}
							>
								<X className="size-4" />
								Reset
							</DropdownMenuItem>
						)}
					</>
				)}
				{column.getCanHide() && (
					<DropdownMenuCheckboxItem
						className="[&_svg]:text-muted-foreground relative gap-2 pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto"
						checked={!column.getIsVisible()}
						onClick={() => column.toggleVisibility(false)}
					>
						<EyeOff className="size-4" />
						Hide
					</DropdownMenuCheckboxItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
