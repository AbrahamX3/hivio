"use client";

import type { UserHiveProfiles } from "@/actions/profiles/user/types";
import MoviesTableView from "@/components/tables/profiles/movies/table-view";
import SeriesTableView from "@/components/tables/profiles/series/table-view";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import TableContainer from "@/components/ui/datatable/data-table-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UserSession } from "@/types/auth";

export default function TableTabs({
	data,
	currentUser,
}: {
	data: UserHiveProfiles;
	currentUser: UserSession | null;
}) {
	const filteredMovies = data.filter((hive) => hive.title.type === "MOVIE");
	const filteredSeries = data.filter((hive) => hive.title.type === "SERIES");

	return (
		<Tabs defaultValue="movies" className="w-full">
			<div className="flex items-center">
				<TabsList>
					<TabsTrigger value="movies" className="gap-2">
						Movies{" "}
						<span className="rounded-md bg-background px-3 py-1 text-foreground">
							{filteredMovies.length}
						</span>
					</TabsTrigger>
					<TabsTrigger value="series" className="gap-2">
						Series{" "}
						<span className="rounded-md bg-background px-3 py-1 text-foreground">
							{filteredSeries.length}
						</span>
					</TabsTrigger>
				</TabsList>
			</div>
			<TabsContent value="movies">
				<Card>
					<CardHeader>
						<CardTitle>Hive Movies</CardTitle>
						<CardDescription>
							Movies that are stored in your Hive.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<TableContainer>
							<MoviesTableView
								currentUser={currentUser}
								data={filteredMovies}
							/>
						</TableContainer>
					</CardContent>
				</Card>
			</TabsContent>
			<TabsContent value="series">
				<Card>
					<CardHeader>
						<CardTitle>Hive Series</CardTitle>
						<CardDescription>
							Series that are stored in the Hive.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<TableContainer>
							<SeriesTableView
								currentUser={currentUser}
								data={filteredSeries}
							/>
						</TableContainer>
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	);
}
