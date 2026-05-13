import type { Table } from "@tanstack/react-table";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import type * as React from "react";

import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps<TData> extends React.ComponentProps<"div"> {
	table: Table<TData>;
	pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
	table,
	pageSizeOptions = [10, 30, 50, 100],
	className,
	...props
}: DataTablePaginationProps<TData>) {
	return (
		<div
			className={cn(
				"flex w-full min-w-0 max-w-full flex-col gap-4 p-1 sm:flex-row sm:items-center sm:justify-between sm:gap-8",
				className,
			)}
			{...props}
		>
			<div className="text-muted-foreground shrink-0 text-center text-sm whitespace-nowrap sm:min-w-0 sm:flex-1 sm:text-left">
				viewing {table.getFilteredRowModel().rows.length}{" "}
				{`${table.getFilteredRowModel().rows.length === 1 ? "row" : "rows"}`}
			</div>
			<div className="flex min-w-0 w-full flex-wrap items-center justify-center gap-x-6 gap-y-4 sm:w-auto sm:flex-nowrap sm:justify-end lg:gap-8">
				<div className="flex items-center space-x-2">
					<p className="text-sm font-medium whitespace-nowrap">Rows per page</p>
					<Select
						value={`${table.getState().pagination.pageSize}`}
						onValueChange={(value) => {
							table.setPageSize(Number(value));
						}}
					>
						<SelectTrigger className="h-8 w-18 data-size:h-8">
							<SelectValue placeholder={table.getState().pagination.pageSize} />
						</SelectTrigger>
						<SelectContent side="top">
							{pageSizeOptions.map((pageSize) => (
								<SelectItem key={pageSize} value={`${pageSize}`}>
									{pageSize}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="flex items-center justify-center text-sm font-medium">
					Page {table.getState().pagination.pageIndex + 1} of{" "}
					{table.getPageCount()}
				</div>
				<div className="flex items-center space-x-2">
					<Button
						aria-label="Go to first page"
						variant="outline"
						size="icon"
						className="hidden size-8 lg:flex"
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
					>
						<ChevronsLeft />
					</Button>
					<Button
						aria-label="Go to previous page"
						variant="outline"
						size="icon"
						className="size-8"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<ChevronLeft />
					</Button>
					<Button
						aria-label="Go to next page"
						variant="outline"
						size="icon"
						className="size-8"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						<ChevronRight />
					</Button>
					<Button
						aria-label="Go to last page"
						variant="outline"
						size="icon"
						className="hidden size-8 lg:flex"
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}
					>
						<ChevronsRight />
					</Button>
				</div>
			</div>
		</div>
	);
}
