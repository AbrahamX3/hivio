"use client";

import { useState } from "react";
import { type Row } from "@tanstack/react-table";
import { EllipsisVerticalIcon, Info } from "lucide-react";

import { type HiveProfile } from "@/app/(profile)/actions";
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
import { type UserSession } from "@/types/auth";

import { TitleDetailsDrawer } from "../title-details-drawer";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  currentUser: UserSession | null;
}
export function HiveSeriesTableActions<TData>({
  row,
  currentUser,
}: DataTableRowActionsProps<TData>) {
  const data = row.original as HiveProfile[0];

  const { setSelectedTitle } = useTitleDetails();
  const [openDetails, setOpenDetails] = useState(false);

  return (
    <>
      <div className="relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-8 p-0 data-[state=open]:bg-muted"
            >
              <EllipsisVerticalIcon className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-fit">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex justify-between gap-4"
              onClick={() => {
                setOpenDetails(true);

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
          </DropdownMenuContent>
        </DropdownMenu>
        {openDetails && (
          <TitleDetailsDrawer
            id={data.id}
            currentUser={currentUser}
            data={data}
            open={openDetails}
            setOpen={setOpenDetails}
          />
        )}
      </div>
    </>
  );
}
