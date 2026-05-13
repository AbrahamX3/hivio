"use client";

import { MoreHorizontal, Pencil, Sparkles, Trash2 } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { HistoryItem } from "@/types/history";

import { RecommendationsDialog } from "./recommendations-dialog";

interface HistoryTableActionsProps {
	item: HistoryItem;
	onEdit: (item: HistoryItem) => void;
	onDelete: (id: string) => void;
}

export function HistoryTableActions({
	item,
	onEdit,
	onDelete,
}: HistoryTableActionsProps) {
	const [showRecommendations, setShowRecommendations] = React.useState(false);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuItem onClick={() => onEdit(item)}>
						<Pencil className="mr-2 h-4 w-4" />
						Edit
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setShowRecommendations(true)}>
						<Sparkles className="mr-2 h-4 w-4" />
						Recommendations
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => onDelete(item.id)}
						className="text-destructive"
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<RecommendationsDialog
				open={showRecommendations}
				onOpenChange={setShowRecommendations}
				tmdbId={item.title?.tmdbId ?? 0}
				mediaType={item.title?.mediaType ?? "MOVIE"}
				titleName={item.title?.name ?? ""}
			/>
		</>
	);
}
