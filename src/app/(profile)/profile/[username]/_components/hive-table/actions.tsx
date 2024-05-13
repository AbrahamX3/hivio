"use client";

import { useState } from "react";
import { type Row } from "@tanstack/react-table";
import { Info, MoreHorizontal } from "lucide-react";

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

import { TitleDetailsDrawer } from "../title-details-drawer";
import { HiveRowData } from "./table-view";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}
export function HiveTableActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const data = row.original as HiveRowData;

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
            data={data}
            open={openDetails}
            setOpen={setOpenDetails}
            data-superjson
          />
        )}
      </div>
    </>
  );
}
