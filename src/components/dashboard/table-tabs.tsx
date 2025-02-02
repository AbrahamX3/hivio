"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import TableContainer from "@/components/ui/datatable/data-table-container";
import { TabsContent } from "@/components/ui/tabs";

import type { GetAll } from "@/types/hive";
import WatchingTableView from "../tables/dashboard/currently-watching-table/table-view";
import MoviesTableView from "../tables/dashboard/movies-table/table-view";
import SeriesTableView from "../tables/dashboard/series-table/table-view";

export default function TableTabs({
	data,
	isLoading,
}: { data: GetAll; isLoading: boolean }) {
	const filteredMovies = data.filter((hive) => hive.title.type === "MOVIE");
	const filteredSeries = data.filter((hive) => hive.title.type === "SERIES");
	const currentlyWatching = data.filter((hive) => hive.status === "WATCHING");

	return (
		<>
			<TabsContent value="currently-watching">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 align-middle">
							<span>Currently Watching</span>{" "}
							<span className="block w-fit rounded-md bg-primary px-3 py-1 text-black text-foreground text-sm tabular-nums sm:hidden">
								{currentlyWatching.length}
							</span>
						</CardTitle>
						<CardDescription>
							All the movies and series that you are currently watching.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<TableContainer>
							<WatchingTableView
								isLoading={isLoading}
								data={currentlyWatching}
							/>
						</TableContainer>
					</CardContent>
				</Card>
			</TabsContent>
			<TabsContent value="movies">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 align-middle">
							<span>Your Hive Movies</span>{" "}
							<span className="block w-fit rounded-md bg-primary px-3 py-1 text-black text-foreground text-sm tabular-nums sm:hidden">
								{filteredMovies.length}
							</span>
						</CardTitle>
						<CardDescription>
							All your movies that are stored in your Hive.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<TableContainer>
							<MoviesTableView isLoading={isLoading} data={filteredMovies} />
						</TableContainer>
					</CardContent>
				</Card>
			</TabsContent>
			<TabsContent value="series">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 align-middle">
							<span>Your Hive Series</span>{" "}
							<span className="block w-fit rounded-md bg-primary px-3 py-1 text-black text-foreground text-sm tabular-nums sm:hidden">
								{filteredSeries.length}
							</span>
						</CardTitle>
						<CardDescription>
							All your series that are stored in your Hive.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<TableContainer>
							<SeriesTableView isLoading={isLoading} data={filteredSeries} />
						</TableContainer>
					</CardContent>
				</Card>
			</TabsContent>
		</>
	);
}
