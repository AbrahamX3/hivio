"use client";

import { useState } from "react";
import { MoreHorizontalIcon } from "lucide-react";

import { type HiveProfile } from "@/app/(profile)/actions";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTitleDetails } from "@/context/title-details-context";
import { type UserSession } from "@/types/auth";

import { TitleDetailsDrawer } from "./title-details-drawer";

interface Props {
  data: HiveProfile[0];
  currentUser: UserSession | null;
}

export default function ViewDetailsButton({ data, currentUser }: Props) {
  const { setSelectedTitle } = useTitleDetails();
  const [openDetails, setOpenDetails] = useState(false);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className="size-8"
              variant="outline"
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
              <MoreHorizontalIcon className="size-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm font-medium">View Title Details</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {openDetails && (
        <TitleDetailsDrawer
          id={data.id}
          data={data}
          open={openDetails}
          setOpen={setOpenDetails}
          currentUser={currentUser}
        />
      )}
    </>
  );
}
