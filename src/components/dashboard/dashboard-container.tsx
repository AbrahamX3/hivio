"use client";

import { Suspense } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UserSession } from "@/types/auth";

import AddTitleToHive from "@/app/(dashboard)/app/_components/add-title/add-to-hive";
import { api } from "@/trpc/react";
import TableTabs from "./table-tabs";

interface DashboardContainerProps {
	user: UserSession;
}

export function DashboardContainer({ user }: DashboardContainerProps) {
	const { data, status } = api.hive.getAll.useQuery();

	const exportData = ({ type }: { type: "ALL" | "MOVIE" | "SERIES" }) => {
		const exportData =
			type === "ALL" ? data : data?.filter((hive) => hive.title.type === type);
		const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
			JSON.stringify(exportData),
		)}`;
		const link = document.createElement("a");
		link.href = jsonString;
		link.download = "hive.json";

		link.click();
	};

	const filteredMovies = data?.filter((hive) => hive.title.type === "MOVIE");
	const filteredSeries = data?.filter((hive) => hive.title.type === "SERIES");
	const currentlyWatching = data?.filter((hive) => hive.status === "WATCHING");

	return (
		<div className="grid h-full flex-1 auto-rows-max items-start gap-4 lg:col-span-3">
			{/* <DashboardHeader user={user} hive={data ?? []} /> */}
			<div className="flex min-w-0 items-center">
				<Tabs defaultValue="currently-watching" className="w-full">
					<div className="flex items-center gap-2">
						<TabsList>
							<TabsTrigger value="currently-watching" className="gap-2 text-sm">
								Watching{" "}
								<span className="hidden rounded-md bg-background px-3 py-1 text-foreground tabular-nums sm:block">
									{currentlyWatching?.length ?? 0}
								</span>
							</TabsTrigger>
							<TabsTrigger value="movies" className="gap-2 text-sm">
								Movies{" "}
								<span className="hidden rounded-md bg-background px-3 py-1 text-foreground tabular-nums sm:block">
									{filteredMovies?.length ?? 0}
								</span>
							</TabsTrigger>
							<TabsTrigger value="series" className="gap-2 text-sm">
								Series{" "}
								<span className="hidden rounded-md bg-background px-3 py-1 text-foreground tabular-nums sm:block">
									{filteredSeries?.length ?? 0}
								</span>
							</TabsTrigger>
						</TabsList>
						<AddTitleToHive user={user} />
						{/* <div className="ml-auto flex items-center gap-2">
							<DropdownMenu>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<DropdownMenuTrigger asChild>
												<Button
													variant="outline"
													className="flex items-center justify-between gap-2 align-middle"
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
						</div> */}
					</div>
					<Suspense fallback={<div>Loading...</div>}>
						<TableTabs data={data ?? []} isLoading={status === "pending"} />
					</Suspense>
				</Tabs>
			</div>
		</div>
	);
}
