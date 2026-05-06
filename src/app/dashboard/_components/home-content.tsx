"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { useReducer } from "react";

import { CurrentlyWatchingWithData } from "@/components/dashboard/currently-watching";
import { StatsOverview } from "@/components/dashboard/quick-stats";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { client } from "@/lib/orpc";

const AddHistoryDialog = dynamic(
	() =>
		import("./user-actions/add-history-dialog").then((mod) => ({
			default: mod.AddHistoryDialog,
		})),
	{ ssr: false },
);

export function HomeContent() {
	const [isAddOpen, setIsAddOpen] = useReducer(
		(_: boolean, open: boolean) => open,
		false,
	);

	const dashboardData = useQuery({
		queryKey: ["history", "getDashboardData"],
		queryFn: () => client.history.getDashboardData(),
	});

	const overview = dashboardData.data?.stats ?? {
		watching: 0,
		finished: 0,
		planned: 0,
		favourites: 0,
	};
	const watchingItems = dashboardData.data?.watchingItems ?? [];

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<CardTitle>Home</CardTitle>
					<p className="text-muted-foreground text-sm">
						Your watch activity at a glance.
					</p>
				</div>
				<Button onClick={() => setIsAddOpen(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Add Title
				</Button>
			</div>

			<StatsOverview
				watching={overview.watching}
				finished={overview.finished}
				planned={overview.planned}
				favourites={overview.favourites}
			/>

			<CurrentlyWatchingWithData items={watchingItems} />

			<AddHistoryDialog
				open={isAddOpen}
				onOpenChange={setIsAddOpen}
			/>
		</div>
	);
}
