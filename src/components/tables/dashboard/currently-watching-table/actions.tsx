"use client";

import type { Row } from "@tanstack/react-table";
import { EllipsisVerticalIcon, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTitleDetails } from "@/context/title-details-context";

import type { GetAll } from "@/types/hive";

interface DataTableRowActionsProps<TData> {
	row: Row<TData>;
}
export function HiveCurrentlyWatchingTableActions<TData>({
	row,
}: DataTableRowActionsProps<TData>) {
	const data = row.original as GetAll[number];

	const { setSelectedTitle } = useTitleDetails();

	return (
		<>
			<div className="relative">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="flex size-8 p-0 data-[state=open]:bg-muted"
						>
							<EllipsisVerticalIcon className="size-4" />
							<span className="sr-only">Open menu</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-fit">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="flex justify-between gap-4"
							onClick={() => {
								if (!data.title.type) return;

								setSelectedTitle({
									id: data.title.id,
									tmdbId: data.title.tmdbId,
									type: data.title.type,
								});
							}}
						>
							View Extra Details
							<Info className="mr-2 size-4" />
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</>
	);
}
