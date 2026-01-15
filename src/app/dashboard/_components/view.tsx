"use client";

import { CurrentlyWatchingWithData } from "@/components/dashboard/currently-watching";
import { DiscoverTrending } from "@/components/dashboard/discover-trending";
import { QuickStats } from "@/components/dashboard/quick-stats";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useHistoryStore } from "@/stores/history-store";
import type {
  HistoryId,
  HistoryItem,
  HistoryUpdateData,
} from "@/types/history";
import { useMutation } from "convex/react";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { AddTitleDialog } from "./add-title-dialog";
import { DeleteHistoryDialog } from "./delete-history-dialog";
import { EditHistoryDialog } from "./edit-history-dialog";
import { HistoryTable, useHistoryTable } from "./history-table";

export default function View() {
  const [editingItem, setEditingItem] = useState<HistoryItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<HistoryId | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const updateHistory = useMutation(api.history.update);
  const deleteHistory = useMutation(api.history.remove);
  const setHistoryItems = useHistoryStore((state) => state.setHistoryItems);

  const handleEdit = (item: HistoryItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (id: HistoryId, data: HistoryUpdateData) => {
    try {
      await updateHistory({ id, ...data });
    } catch (error) {
      toast.error("Failed to update history");
      if (error instanceof Error) {
        console.error("Update error:", error.message);
      }
    }
  };

  const handleDelete = (id: HistoryId) => {
    setDeleteItemId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deleteHistory({ id: deleteItemId });
      toast.success("History item deleted");
      setIsDeleteDialogOpen(false);
      setDeleteItemId(null);
    } catch (error) {
      toast.error("Failed to delete history item");
      if (error instanceof Error) {
        console.error("Delete error:", error.message);
      }
    }
  };

  const { table, data } = useHistoryTable({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });
  const isLoading = data === undefined;

  useEffect(() => {
    if (data) {
      setHistoryItems(data);
    }
  }, [data, setHistoryItems]);

  const overview = useMemo(() => {
    const historyItems = data ?? [];
    const total = historyItems.length;
    const watching = historyItems.filter(
      (item) => item.status === "WATCHING",
    ).length;
    const finished = historyItems.filter(
      (item) => item.status === "FINISHED",
    ).length;
    const planned = historyItems.filter(
      (item) => item.status === "PLANNED",
    ).length;
    const favourites = historyItems.filter((item) => item.isFavourite).length;
    const watchingItems = historyItems.filter(
      (item) => item.status === "WATCHING" && item.title,
    );
    const progressValue = total > 0 ? Math.round((finished / total) * 100) : 0;

    const watchlistDescription =
      planned > 0
        ? `${planned} title${planned === 1 ? "" : "s"} ready to start.`
        : "Save titles to watch later.";

    return {
      total,
      watching,
      finished,
      planned,
      favourites,
      watchingItems,
      progressValue,
      watchlistDescription,
    };
  }, [data]);

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Your Watch History</CardTitle>
            <p className="text-sm text-muted-foreground">
              Track progress, stay ahead of episodes, and keep your watchlist
              tidy.
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Title
          </Button>
        </div>

        <Accordion type="single" collapsible defaultValue="overview">
          <AccordionItem value="overview">
            <AccordionTrigger>Overview & Discovery</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
                <QuickStats
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

        {overview.watchingItems.length > 0 && (
          <CurrentlyWatchingWithData
            items={overview.watchingItems}
            emptyState={
              overview.watchingItems.length === 0
                ? {
                    title: "No titles in progress",
                    description:
                      "Start watching something to see it here with progress and release dates.",
                  }
                : undefined
            }
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>History table</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <TooltipProvider>
              <HistoryTable table={table} isLoading={isLoading} />
            </TooltipProvider>
          </CardContent>
        </Card>
      </div>

      <EditHistoryDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        item={editingItem}
        onSave={handleSave}
      />

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
