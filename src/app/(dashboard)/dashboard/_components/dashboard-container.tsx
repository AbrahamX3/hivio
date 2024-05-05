"use client";

import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ClapperboardIcon,
  FileJson2,
  FilmIcon,
  GalleryHorizontalEndIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTitleDetails } from "@/context/title-details-context";
import { UserSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

import { HiveRowData } from "./hive-table/table-view";
import DashboardStats from "./stats";
import TableTabs from "./table-tabs";
import TitleDetails from "./title-details";

interface DashboardContainerProps {
  user: UserSession;
  data: HiveRowData[];
}

export function DashboardContainer({ user, data }: DashboardContainerProps) {
  const { selectedTitle } = useTitleDetails();

  const exportData = ({ type }: { type: "ALL" | "MOVIE" | "SERIES" }) => {
    const exportData =
      type === "ALL" ? data : data.filter((hive) => hive.title.type === type);
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(exportData),
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "hive.json";

    link.click();
  };

  const selectedTitleData = data.find(
    (hive) => hive.title.id === selectedTitle?.id,
  );

  return (
    <>
      <div
        className={cn(
          "grid h-full flex-1 auto-rows-max items-start gap-4",
          selectedTitle ? "lg:col-span-2" : "lg:col-span-3",
        )}
      >
        <DashboardStats user={user} />
        <div className="flex min-w-0 items-center">
          <Tabs defaultValue="hive" className="w-full">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="hive">Hive</TabsTrigger>
                <TabsTrigger value="movies">Movies</TabsTrigger>
                <TabsTrigger value="series">Series</TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex h-7 items-center justify-between gap-2 align-middle text-sm"
                          >
                            <span className="sr-only sm:not-sr-only">
                              Export Hive
                            </span>
                            <FileJson2 className="size-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        Export Hive Collection as JSON
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => exportData({ type: "ALL" })}
                      className="justify-between gap-2"
                    >
                      All <GalleryHorizontalEndIcon className="ml-4 size-4" />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => exportData({ type: "MOVIE" })}
                      className="justify-between gap-2"
                    >
                      Movies <FilmIcon className="ml-4 size-4" />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => exportData({ type: "SERIES" })}
                      className="justify-between gap-2"
                    >
                      Series <ClapperboardIcon className="ml-4 size-4" />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
              <TableTabs data={data} />
            </Suspense>
          </Tabs>
        </div>
      </div>
      <AnimatePresence mode="popLayout">
        {selectedTitle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: 0.3, ease: "easeIn" },
            }}
            exit={{
              opacity: 0,
              transition: { duration: 0.2, ease: "easeOut", velocity: 5 },
            }}
          >
            <TitleDetails data={selectedTitleData} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
