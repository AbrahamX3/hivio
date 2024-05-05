"use client";

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

import { HiveColumn } from "./table-view";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}
export function SeriesTableActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const data = row.original as HiveColumn;

  const { setSelectedTitle: setSelectedTitleId } = useTitleDetails();
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
              className="justify-between gap-2"
              onClick={() => {
                if (!data.title.type) return;

                setSelectedTitleId({
                  id: data.title.id,
                  tmdbId: data.title.tmdbId,
                  type: data.title.type,
                });
              }}
            >
              View Title Details
              <Info className="mr-2 h-4 w-4" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
