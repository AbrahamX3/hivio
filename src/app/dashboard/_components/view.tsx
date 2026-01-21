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
import { Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { HistoryTable, useHistoryTable } from "./history-table";

const AddTitleDialog = dynamic(
  () =>
    import("./add-title-dialog").then((mod) => ({
      default: mod.AddTitleDialog,
    })),
  { ssr: false }
);

const DeleteHistoryDialog = dynamic(
  () =>
    import("./delete-history-dialog").then((mod) => ({
      default: mod.DeleteHistoryDialog,
    })),
  { ssr: false }
);

const EditHistoryDialog = dynamic(
  () =>
    import("./edit-history-dialog").then((mod) => ({
      default: mod.EditHistoryDialog,
    })),
  { ssr: false }
);

interface ViewProps {
  allItemsPreloaded: Preloaded<typeof api.history.getAllItems>;
  watchingItemsPreloaded: Preloaded<typeof api.history.getWatchingItems>;
}

export default function View({
  allItemsPreloaded,
  watchingItemsPreloaded,
}: ViewProps) {
  const [editingItem, setEditingItem] = useState<HistoryItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<HistoryId | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const updateHistory = useMutation(api.history.update);
  const deleteHistory = useMutation(api.history.remove);
  const setHistoryItems = useHistoryStore((state) => state.setHistoryItems);

  const allItems = usePreloadedQuery(allItemsPreloaded);

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

  const { table, data, isLoading, hasData } = useHistoryTable({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  useEffect(() => {
    if (data) {
      setHistoryItems(data);
    }
  }, [data, setHistoryItems]);

  const overview = useMemo(() => {
    const historyItems = allItems ?? [];
    let watching = 0;
    let finished = 0;
    let planned = 0;
    let favourites = 0;

    for (const item of historyItems) {
      switch (item.status) {
        case "WATCHING":
          watching++;
          break;
        case "FINISHED":
          finished++;
          break;
        case "PLANNED":
          planned++;
          break;
      }
      if (item.isFavourite) {
        favourites++;
      }
    }

    const total = historyItems.length;
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
      progressValue,
      watchlistDescription,
    };
  }, [allItems]);

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

        <CurrentlyWatchingWithData
          watchingItemsPreloaded={watchingItemsPreloaded}
        />

        <Card>
          <CardHeader>
            <CardTitle>Your Library</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <TooltipProvider>
              <HistoryTable
                table={table}
                isLoading={isLoading}
                hasData={hasData}
              />
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
