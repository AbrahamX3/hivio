"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMutation } from "convex/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { HistoryStatus } from "../../../../convex/types";
import { AddTitleDialog } from "./add-title-dialog";
import { DeleteHistoryDialog } from "./delete-history-dialog";
import { EditHistoryDialog } from "./edit-history-dialog";
import { HistoryItem, HistoryTable } from "./history-table";

export default function View() {
  const [editingItem, setEditingItem] = useState<HistoryItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const updateHistory = useMutation(api.history.update);
  const deleteHistory = useMutation(api.history.remove);

  const handleEdit = (item: HistoryItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (
    id: Id<"history">,
    data: {
      status?: HistoryStatus;
      currentEpisode?: number;
      currentSeason?: number;
      currentRuntime?: number;
      isFavourite?: boolean;
    },
  ) => {
    await updateHistory({ id: id as Id<"history">, ...data });
  };

  const handleDelete = (id: string) => {
    setDeleteItemId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deleteHistory({ id: deleteItemId as Id<"history"> });
      toast.success("History item deleted");
      setIsDeleteDialogOpen(false);
      setDeleteItemId(null);
    } catch (error) {
      toast.error("Failed to delete history item");
      console.error(error);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Watch History</CardTitle>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Title
            </Button>
          </div>
        </CardHeader>
        <CardContent className="min-w-0">
          <TooltipProvider>
            <HistoryTable onEdit={handleEdit} onDelete={handleDelete} />
          </TooltipProvider>
        </CardContent>
      </Card>

      {editingItem && (
        <EditHistoryDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          item={editingItem}
          onSave={handleSave}
        />
      )}

      <AddTitleDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      <DeleteHistoryDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
