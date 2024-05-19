"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type Row } from "@tanstack/react-table";
import { Info, MoreHorizontal, TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
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
import { type HiveRowData } from "@/types/hive";

import { deleteTitle } from "../../actions";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}
export function HiveSeriesTableActions<TData>({
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
              className="flex size-8 p-0 data-[state=open]:bg-muted"
            >
              <MoreHorizontal className="size-4" />
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
            <DropdownMenuItem
              className="flex justify-between gap-4"
              onClick={() => setOpenDeleteAlert(true)}
            >
              Delete Title
              <TrashIcon className="mr-2 size-4" />
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
  type,
}: {
  id: string;
  openDeleteAlert: boolean;
  setOpenDeleteAlert: (open: boolean) => void;
  type?: "MOVIE" | "SERIES" | null;
}) {
  const router = useRouter();

  const { setSelectedTitle } = useTitleDetails();

  const { execute, status } = useAction(deleteTitle, {
    onSuccess: ({ success }) => {
      if (success) {
        toast.success("Title deleted from your hive!", {
          id: "delete-title",
        });
        router.refresh();
        setSelectedTitle(null);
      }
    },
    onError: ({ serverError }) => {
      toast.error("Server Error", {
        description: serverError,
        id: "delete-title",
      });
    },
    onExecute: () => {
      toast.loading("Deleting title from your hive...", {
        id: "delete-title",
      });
    },
  });

  return (
    <AlertDialog
      open={openDeleteAlert}
      onOpenChange={() => setOpenDeleteAlert(false)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¡Warning!</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Are you sure you want to delete this{" "}
            {type ? type.toLowerCase() : "title"} from your hive?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={status === "executing"}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => execute({ id })}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
