"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { CurrentlyWatchingWithData } from "@/components/dashboard/currently-watching";
import { StatsOverview } from "@/components/dashboard/quick-stats";
import { CardTitle } from "@/components/ui/card";
import { client } from "@/lib/orpc";

export function HomeContent() {
	const queryClient = useQueryClient();

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
			<div>
				<CardTitle>Home</CardTitle>
				<p className="text-muted-foreground text-sm">
					Your watch activity at a glance.
				</p>
			</div>

			<StatsOverview
				watching={overview.watching}
				finished={overview.finished}
				planned={overview.planned}
				favourites={overview.favourites}
			/>

			<CurrentlyWatchingWithData
				items={watchingItems}
				onUpdate={() => {
					queryClient.invalidateQueries({ queryKey: ["history"] });
					queryClient.invalidateQueries({ queryKey: ["watching"] });
				}}
			/>

		</div>
	);
}
