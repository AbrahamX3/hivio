"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useReducer } from "react";
import { toast } from "sonner";

import { CardTitle } from "@/components/ui/card";
import { client } from "@/lib/orpc";
import type { HistoryItem, HistoryUpdateData } from "@/types/history";

import { HistoryTable, useHistoryTable } from "./history-table";

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
	deleteItemId: string | null;
	isDeleteDialogOpen: boolean;
}

type DialogAction =
	| { type: "OPEN_EDIT"; item: HistoryItem }
	| { type: "CLOSE_EDIT" }
	| { type: "OPEN_DELETE"; id: string }
	| { type: "CLOSE_DELETE" };

const initialDialogState: DialogState = {
	editingItem: null,
	isEditDialogOpen: false,
	deleteItemId: null,
	isDeleteDialogOpen: false,
};

function dialogReducer(state: DialogState, action: DialogAction): DialogState {
	switch (action.type) {
		case "OPEN_EDIT":
			return { ...state, editingItem: action.item, isEditDialogOpen: true };
		case "CLOSE_EDIT":
			return { ...state, isEditDialogOpen: false };
		case "OPEN_DELETE":
			return { ...state, deleteItemId: action.id, isDeleteDialogOpen: true };
		case "CLOSE_DELETE":
			return { ...state, isDeleteDialogOpen: false, deleteItemId: null };
		default:
			return state;
	}
}

export function HistoryContent() {
	const queryClient = useQueryClient();
	const [dialogState, dispatch] = useReducer(dialogReducer, initialDialogState);
	const { editingItem, isEditDialogOpen, deleteItemId, isDeleteDialogOpen } =
		dialogState;

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
		<div className="space-y-6">
			<div>
				<CardTitle>History</CardTitle>
				<p className="text-muted-foreground text-sm">
					Manage your complete watch library.
				</p>
			</div>

			<HistoryTable
				table={table}
				isLoading={isLoading}
				isSearching={isSearching}
				hasData={hasData}
			/>

			<EditHistoryDialog
				key={editingItem?.id ?? "empty"}
				open={isEditDialogOpen}
				onOpenChange={(open) => {
					if (!open) dispatch({ type: "CLOSE_EDIT" });
				}}
				item={editingItem}
				onSave={handleSave}
			/>

			<DeleteHistoryDialog
				open={isDeleteDialogOpen}
				onOpenChange={(open) => {
					if (!open) dispatch({ type: "CLOSE_DELETE" });
				}}
				onConfirm={handleConfirmDelete}
			/>
		</div>
	);
}
