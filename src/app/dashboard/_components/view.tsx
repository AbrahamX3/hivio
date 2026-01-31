"use client";

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
import type { fetchAuthAction } from "@/lib/auth-server";
import type {
  HistoryId,
  HistoryItem,
  HistoryUpdateData,
} from "@/types/history";
import { Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { HistoryTable, useHistoryTable } from "./history-table";

const AddTitleDialog = dynamic(
  () =>
    import("./user-actions/add-history-dialog").then((mod) => ({
      default: mod.AddHistoryDialog,
    })),
  { ssr: false }
);

const DeleteHistoryDialog = dynamic(
  () =>
    import("./user-actions/delete-history-dialog").then((mod) => ({
      default: mod.DeleteHistoryDialog,
    })),
  { ssr: false }
);

const EditHistoryDialog = dynamic(
  () =>
    import("./user-actions/edit-history-dialog").then((mod) => ({
      default: mod.EditHistoryDialog,
    })),
  { ssr: false }
);

interface ViewProps {
  dashboardDataPreloaded: Preloaded<typeof api.history.getDashboardData>;
  trendingTitles: Awaited<
    ReturnType<typeof fetchAuthAction<typeof api.tmdb.getUserTrendingTitles>>
  >;
}

export default function View({
  dashboardDataPreloaded,
  trendingTitles,
}: ViewProps) {
  const [editingItem, setEditingItem] = useState<HistoryItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<HistoryId | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const updateHistory = useMutation(api.history.update);
  const deleteHistory = useMutation(api.history.remove);

  const { stats: overview, watchingItems } = usePreloadedQuery(
    dashboardDataPreloaded
  );

  const handleEdit = (item: HistoryItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (id: HistoryId, data: HistoryUpdateData) => {
    try {
      await updateHistory({ id, ...data });
    } catch (error) {
      toast.error("Failed to update history");
      console.error("Update error:", error);
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
      console.error("Delete error:", error);
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
                <StatsOverview
                  watching={overview.watching}
                  finished={overview.finished}
                  planned={overview.planned}
                  favourites={overview.favourites}
                />
                <div className="min-w-0">
                  <DiscoverTrending trendingTitles={trendingTitles} />
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
