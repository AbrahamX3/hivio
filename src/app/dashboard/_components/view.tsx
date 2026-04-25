"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { useReducer } from "react";
import { toast } from "sonner";

import { CurrentlyWatchingWithData } from "@/components/dashboard/currently-watching";
import { DiscoverTrending } from "@/components/dashboard/discover-trending";
import { StatsOverview } from "@/components/dashboard/quick-stats";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { client } from "@/lib/orpc";
import type { HistoryItem, HistoryUpdateData } from "@/types/history";

import { HistoryTable, useHistoryTable } from "./history-table";

const AddTitleDialog = dynamic(
	() =>
		import("./user-actions/add-history-dialog").then((mod) => ({
			default: mod.AddHistoryDialog,
		})),
	{ ssr: false },
);

const DeleteHistoryDialog = dynamic(
	() =>
		import("./user-actions/delete-history-dialog").then((mod) => ({
			default: mod.DeleteHistoryDialog,
		})),
	{ ssr: false },
);

const EditHistoryDialog = dynamic(
	() =>
		import("./user-actions/edit-history-dialog").then((mod) => ({
			default: mod.EditHistoryDialog,
		})),
	{ ssr: false },
);

interface DialogState {
	editingItem: HistoryItem | null;
	isEditDialogOpen: boolean;
	isAddDialogOpen: boolean;
	deleteItemId: string | null;
	isDeleteDialogOpen: boolean;
}

type DialogAction =
	| { type: "OPEN_EDIT"; item: HistoryItem }
	| { type: "CLOSE_EDIT" }
	| { type: "OPEN_ADD" }
	| { type: "CLOSE_ADD" }
	| { type: "OPEN_DELETE"; id: string }
	| { type: "CLOSE_DELETE" };

const initialDialogState: DialogState = {
	editingItem: null,
	isEditDialogOpen: false,
	isAddDialogOpen: false,
	deleteItemId: null,
	isDeleteDialogOpen: false,
};

function dialogReducer(state: DialogState, action: DialogAction): DialogState {
	switch (action.type) {
		case "OPEN_EDIT":
			return { ...state, editingItem: action.item, isEditDialogOpen: true };
		case "CLOSE_EDIT":
			return { ...state, isEditDialogOpen: false };
		case "OPEN_ADD":
			return { ...state, isAddDialogOpen: true };
		case "CLOSE_ADD":
			return { ...state, isAddDialogOpen: false };
		case "OPEN_DELETE":
			return { ...state, deleteItemId: action.id, isDeleteDialogOpen: true };
		case "CLOSE_DELETE":
			return { ...state, isDeleteDialogOpen: false, deleteItemId: null };
		default:
			return state;
	}
}

export default function View() {
	const queryClient = useQueryClient();
	const [dialogState, dispatch] = useReducer(dialogReducer, initialDialogState);
	const {
		editingItem,
		isEditDialogOpen,
		isAddDialogOpen,
		deleteItemId,
		isDeleteDialogOpen,
	} = dialogState;

	const dashboardData = useQuery({
		queryKey: ["history", "getDashboardData"],
		queryFn: () => client.history.getDashboardData(),
	});

	const updateMutation = useMutation({
		mutationKey: ["history", "update"],
		mutationFn: (data: { id: string } & HistoryUpdateData) =>
			client.history.update(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["history"] });
			toast.success("History updated");
		},
		onError: (error) => {
			toast.error("Failed to update history");
			console.error("Update error:", error);
		},
	});

	const deleteMutation = useMutation({
		mutationKey: ["history", "remove"],
		mutationFn: (data: { id: string }) => client.history.remove(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["history"] });
			toast.success("History item deleted");
		},
		onError: (error) => {
			toast.error("Failed to delete history item");
			console.error("Delete error:", error);
		},
	});

	const overview = dashboardData.data?.stats ?? {
		watching: 0,
		finished: 0,
		planned: 0,
		favourites: 0,
	};
	const watchingItems = dashboardData.data?.watchingItems ?? [];

	const handleEdit = (item: HistoryItem) => {
		dispatch({ type: "OPEN_EDIT", item });
	};

	const handleSave = async (id: string, data: HistoryUpdateData) => {
		try {
			await updateMutation.mutateAsync({ id, ...data });
		} catch {
			// Error already handled in onError
		}
	};

	const handleDelete = (id: string) => {
		dispatch({ type: "OPEN_DELETE", id });
	};

	const handleConfirmDelete = async () => {
		if (!deleteItemId) return;

		try {
			await deleteMutation.mutateAsync({ id: deleteItemId });
			dispatch({ type: "CLOSE_DELETE" });
		} catch {
			// Error already handled in onError
		}
	};

	const { table, isLoading, isSearching, hasData } = useHistoryTable({
		onEdit: handleEdit,
		onDelete: handleDelete,
	});

	return (
		<>
			<div className="space-y-6">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<CardTitle>Your Watch History</CardTitle>
						<p className="text-muted-foreground text-sm">
							Track progress, stay ahead of episodes, and keep your watchlist
							tidy.
						</p>
					</div>
					<Button onClick={() => dispatch({ type: "OPEN_ADD" })}>
						<Plus className="mr-2 h-4 w-4" />
						Add Title
					</Button>
				</div>

				<Accordion type="single" collapsible defaultValue="overview">
					<AccordionItem value="overview">
						<AccordionTrigger>Overview & Discovery</AccordionTrigger>
						<AccordionContent>
							<div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
								<StatsOverview
									watching={overview.watching}
									finished={overview.finished}
									planned={overview.planned}
									favourites={overview.favourites}
								/>
								<div className="min-w-0">
									<DiscoverTrending />
								</div>
							</div>
						</AccordionContent>
					</AccordionItem>
				</Accordion>

				<CurrentlyWatchingWithData items={watchingItems} />

				<Card className="bg-transparent">
					<CardHeader>
						<CardTitle>Your Library</CardTitle>
					</CardHeader>
					<CardContent className="min-w-0">
						<TooltipProvider>
							<HistoryTable
								table={table}
								isLoading={isLoading}
								isSearching={isSearching}
								hasData={hasData}
							/>
						</TooltipProvider>
					</CardContent>
				</Card>
			</div>

			<EditHistoryDialog
				key={editingItem?.id ?? "empty"}
				open={isEditDialogOpen}
				onOpenChange={(open) => {
					if (!open) dispatch({ type: "CLOSE_EDIT" });
				}}
				item={editingItem}
				onSave={handleSave}
			/>

			<AddTitleDialog
				open={isAddDialogOpen}
				onOpenChange={(open) => {
					if (!open) dispatch({ type: "CLOSE_ADD" });
				}}
			/>

			<DeleteHistoryDialog
				open={isDeleteDialogOpen}
				onOpenChange={(open) => {
					if (!open) dispatch({ type: "CLOSE_DELETE" });
				}}
				onConfirm={handleConfirmDelete}
			/>
		</>
	);
}
