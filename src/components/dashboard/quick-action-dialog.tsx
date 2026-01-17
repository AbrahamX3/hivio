"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { HistoryItem } from "@/types/history";
import { useMutation } from "convex/react";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

interface QuickActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: HistoryItem | null;
  onUpdate?: () => void;
}

export function QuickActionDialog({
  open,
  onOpenChange,
  item,
  onUpdate,
}: QuickActionDialogProps) {
  const [isFavourite, setIsFavourite] = useState(item?.isFavourite ?? false);
  const [originalFavourite, setOriginalFavourite] = useState(
    item?.isFavourite ?? false
  );
  const [isSubmittingFavorite, setIsSubmittingFavorite] = useState(false);
  const [isSubmittingFinished, setIsSubmittingFinished] = useState(false);
  const updateHistory = useMutation(api.history.update);

  useEffect(() => {
    if (item) {
      setIsFavourite(item.isFavourite);
      setOriginalFavourite(item.isFavourite);
    }
  }, [item]);

  const hasFavoriteChanges = isFavourite !== originalFavourite;

  const handleMarkFinished = async () => {
    if (!item) return;

    setIsSubmittingFinished(true);
    try {
      await updateHistory({
        id: item._id,
        status: "FINISHED",
        isFavourite,
      });
      toast.success("Marked as finished");
      onOpenChange(false);
      onUpdate?.();
    } catch (error) {
      toast.error("Failed to update");
      if (error instanceof Error) {
        console.error("Update error:", error.message);
      }
    } finally {
      setIsSubmittingFinished(false);
    }
  };

  const handleSaveFavorite = async () => {
    if (!item) return;

    setIsSubmittingFavorite(true);
    try {
      await updateHistory({
        id: item._id,
        isFavourite,
      });
      setOriginalFavourite(isFavourite);
      toast.success(
        isFavourite ? "Added to favorites" : "Removed from favorites"
      );
      onUpdate?.();
    } catch (error) {
      setIsFavourite(originalFavourite);
      toast.error("Failed to update favorite");
      if (error instanceof Error) {
        console.error("Update error:", error.message);
      }
    } finally {
      setIsSubmittingFavorite(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick Actions</DialogTitle>
          <DialogDescription>
            Manage{" "}
            <b>
              {item.title?.name || "this title"} (
              {item.title?.releaseDate
                ? new Date(item.title.releaseDate).getFullYear()
                : "Unknown"}
              )
            </b>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="favorite"
                checked={isFavourite}
                onCheckedChange={(checked) => setIsFavourite(checked === true)}
              />
              <Label
                htmlFor="favorite"
                className="flex-1 cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mark as favorite
              </Label>
            </div>
            <Button
              onClick={handleSaveFavorite}
              disabled={!hasFavoriteChanges || isSubmittingFavorite}
              className="w-full"
              size="sm"
            >
              {isSubmittingFavorite ? "Saving..." : "Save changes"}
            </Button>
          </div>

          <div className="bg-muted/40 rounded-lg border p-4">
            <p className="mb-2 text-sm font-medium">Mark as finished</p>
            <p className="text-muted-foreground mb-4 text-xs">
              Mark this title as completed in your watch history.
            </p>
            <Button
              onClick={handleMarkFinished}
              disabled={isSubmittingFinished}
              className="w-full"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark as Finished
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
