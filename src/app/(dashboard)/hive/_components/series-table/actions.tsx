"use client";

import { useState } from "react";
import { type Row } from "@tanstack/react-table";
import { EditIcon, Info, MoreHorizontal, TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { Link } from "next-view-transitions";
import { toast } from "sonner";

import { type HiveProfile } from "@/app/(profile)/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTitleDetails } from "@/context/title-details-context";

import { deleteTitle } from "../../actions";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}
export function HiveSeriesTableActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const data = row.original as HiveProfile[0];

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
            <DropdownMenuItem asChild>
              <Link
                className="flex justify-between gap-4"
                href={`/hive/${data.id}`}
              >
                Edit Hive Title
                <EditIcon className="mr-2 size-4" />
              </Link>
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
  const { setSelectedTitle } = useTitleDetails();

  const { execute, status } = useAction(deleteTitle, {
    onSuccess: ({ success }) => {
      if (success) {
        toast.success("Title deleted from your hive!", {
          id: "delete-title",
        });
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
    <Dialog
      open={openDeleteAlert}
      onOpenChange={() => setOpenDeleteAlert(false)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¡Warning!</DialogTitle>
          <DialogDescription>
            ¿Are you sure you want to delete this{" "}
            {type ? type.toLowerCase() : "title"} from your hive?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            disabled={status === "executing"}
            variant="destructive"
            onClick={() => execute({ id })}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
