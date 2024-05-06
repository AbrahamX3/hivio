"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type Row } from "@tanstack/react-table";
import { Info, MoreHorizontal, TrashIcon } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { useServerAction } from "@/hooks/use-server-action";

import { deleteTitleFromHive } from "../../_actions/hive";
import { HiveRowData } from "./table-view";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}
export function HiveMoviesTableActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const data = row.original as HiveRowData;

  const { setSelectedTitle } = useTitleDetails();
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  return (
    <>
      <div className="relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            >
              <MoreHorizontal className="h-4 w-4" />
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
              <Info className="mr-2 h-4 w-4" />
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex justify-between gap-4"
              onClick={() => setOpenDeleteAlert(true)}
            >
              Delete Title
              <TrashIcon className="mr-2 h-4 w-4" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {openDeleteAlert && (
          <DeleteTitle
            id={data.id}
            setOpenDeleteAlert={setOpenDeleteAlert}
            openDeleteAlert={openDeleteAlert}
          />
        )}
      </div>
    </>
  );
}

function DeleteTitle({
  id,
  setOpenDeleteAlert,
  openDeleteAlert,
}: {
  id: string;
  openDeleteAlert: boolean;
  setOpenDeleteAlert: (open: boolean) => void;
}) {
  const router = useRouter();

  const { setSelectedTitle } = useTitleDetails();
  const [deleteTitleFromHiveAction, isDeleteTitleFromHivePending] =
    useServerAction(deleteTitleFromHive);

  return (
    <AlertDialog
      open={openDeleteAlert}
      onOpenChange={() => setOpenDeleteAlert(false)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¡Warning!</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Are you sure you want to delete this movie from your hive?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleteTitleFromHivePending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              toast.promise(
                deleteTitleFromHiveAction(id).then((data) => {
                  if (!data) return;
                  setSelectedTitle(null);
                  router.refresh();
                }),
                {
                  loading: "Deleting title from your hive...",
                  success: "Title deleted from your hive.",
                  error: "Failed to delete title from your hive.",
                },
              );
            }}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
