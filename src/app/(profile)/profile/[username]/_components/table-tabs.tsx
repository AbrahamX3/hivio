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
import { type HiveRowData } from "@/types/hive";

import MoviesTableView from "./movies-table/table-view";
import SeriesTableView from "./series-table/table-view";

export default function TableTabs({ data }: { data: HiveRowData[] }) {
  const filteredMovies = data.filter((hive) => hive.title.type === "MOVIE");
  const filteredSeries = data.filter((hive) => hive.title.type === "SERIES");

  return (
    <>
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
              <MoviesTableView data={filteredMovies} data-superjson />
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
              <SeriesTableView data={filteredSeries} data-superjson />
            </TableContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
}
