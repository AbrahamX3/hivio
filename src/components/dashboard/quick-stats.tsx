interface StatsOverviewProps {
	watching: number;
	finished: number;
	planned: number;
	favourites: number;
}

export function StatsOverview({
	watching,
	finished,
	planned,
	favourites,
}: StatsOverviewProps) {
	return (
		<div className="bg-card ring-border/50 rounded-xl p-4 ring-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
			<h3 className="text-sm font-medium">Overview</h3>
			<div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div className="space-y-1">
					<p className="text-muted-foreground text-[11px] font-medium tracking-[0.15em] uppercase">
						Watching
					</p>
					<p className="text-2xl font-semibold tabular-nums">{watching}</p>
					<p className="text-muted-foreground text-xs">
						Titles in progress right now
					</p>
				</div>
				<div className="space-y-1">
					<p className="text-muted-foreground text-[11px] font-medium tracking-[0.15em] uppercase">
						Completed
					</p>
					<p className="text-2xl font-semibold tabular-nums">{finished}</p>
					<p className="text-muted-foreground text-xs">
						Finished titles in your library
					</p>
				</div>
				<div className="space-y-1">
					<p className="text-muted-foreground text-[11px] font-medium tracking-[0.15em] uppercase">
						Planned
					</p>
					<p className="text-2xl font-semibold tabular-nums">{planned}</p>
					<p className="text-muted-foreground text-xs">Lined up for later</p>
				</div>
				<div className="space-y-1">
					<p className="text-muted-foreground text-[11px] font-medium tracking-[0.15em] uppercase">
						Favorites
					</p>
					<p className="text-2xl font-semibold tabular-nums">{favourites}</p>
					<p className="text-muted-foreground text-xs">Saved titles you love</p>
				</div>
			</div>
		</div>
	);
}
