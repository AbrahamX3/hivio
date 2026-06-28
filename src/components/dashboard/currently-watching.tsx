"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, MoreHorizontal } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { EditHistoryDialog } from "@/app/dashboard/_components/user-actions/edit-history-dialog";
import { DoubleBezel } from "@/components/double-bezel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { client } from "@/lib/orpc";
import { cn, convertMinutesToHrMin } from "@/lib/utils";
import type { HistoryItem, HistoryStatus } from "@/types/history";

import { TitleDetailsDialog } from "../title-details-dialog";

type WatchingShowData = {
	item: HistoryItem;
	nextEpisode?: {
		episodeNumber: number;
		name: string;
		airDate: string;
	};
	lastAired?: {
		episodeNumber: number;
		name: string;
		airDate: string;
	};
	seasonProgress?: {
		current: number;
		total: number;
	};
	movieRuntime?: number;
	isLoading?: boolean;
};

function formatReleaseDate(dateString: string): string {
	try {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			weekday: "long",
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	} catch {
		return dateString;
	}
}

function WatchingShowCard({
	show,
	onUpdate,
}: {
	show: WatchingShowData;
	onUpdate?: () => void;
}) {
	const queryClient = useQueryClient();
	const {
		item,
		nextEpisode,
		lastAired,
		seasonProgress,
		movieRuntime,
		isLoading,
	} = show;
	const title = item.title;
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const updateMutation = useMutation({
		mutationFn: (data: {
			id: string;
			status?: HistoryStatus;
			currentSeason?: number;
			currentEpisode?: number;
		}) => client.history.update(data),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["history"] });
			await queryClient.invalidateQueries({ queryKey: ["watching"] });
			toast.success("History updated");
			onUpdate?.();
		},
		onError: () => {
			toast.error("Failed to update history");
		},
	});

	if (isLoading || !title) {
		return (
			<div className="bg-card ring-border/50 rounded-xl p-4 ring-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
				<div className="flex gap-4">
					<Skeleton className="h-20 w-14 shrink-0" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-5 w-32" />
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-2 w-full" />
					</div>
				</div>
			</div>
		);
	}

	const isSeries = title.mediaType === "SERIES";
	const isMovie = title.mediaType === "MOVIE";

	let progressValue = 0;
	let progressLabel = "";

	if (isSeries && item.currentSeason && item.currentEpisode) {
		const ep = String(item.currentEpisode).padStart(2, "0");
		const season = String(item.currentSeason).padStart(2, "0");
		if (seasonProgress) {
			progressValue = Math.round(
				(seasonProgress.current / seasonProgress.total) * 100,
			);
			progressLabel = `S${season} • E${ep} of ${seasonProgress.total}`;
		} else {
			progressValue = 100;
			progressLabel = `S${season} • E${ep}`;
		}
	} else if (isMovie && item.currentRuntime && movieRuntime) {
		progressValue = Math.round((item.currentRuntime / movieRuntime) * 100);
		progressLabel = `${convertMinutesToHrMin(item.currentRuntime)} / ${convertMinutesToHrMin(movieRuntime)}`;
	}

	return (
		<div className="bg-card ring-border/50 rounded-xl p-4 ring-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
			<div className="flex gap-4">
				{title.posterUrl ? (
					<TitleDetailsDialog
						title={{
							name: title.name,
							posterUrl: title.posterUrl ?? undefined,
							backdropUrl: title.backdropUrl ?? undefined,
							description: title.description ?? undefined,
							directors: title.directors ?? [],
							tmdbId: title.tmdbId,
							mediaType: title.mediaType,
							releaseDate: title.releaseDate ?? "",
							genres: title.genres ?? [],
						}}
						triggerImage={{
							width: 56,
							height: 80,
							className: "h-20 w-14 shrink-0 rounded object-cover",
						}}
					/>
				) : (
					<div className="bg-muted h-20 w-14 shrink-0 rounded" />
				)}

				<div className="min-w-0 flex-1 space-y-2">
					<div className="flex items-start justify-between gap-2">
						<div className="min-w-0 flex-1">
							<h4 className="truncate font-semibold">{title.name}</h4>
							{isSeries && item.currentSeason && item.currentEpisode ? (
								<p className="text-muted-foreground text-sm">
									S{String(item.currentSeason).padStart(2, "0")} • E
									{String(item.currentEpisode).padStart(2, "0")}
								</p>
							) : isMovie && item.currentRuntime ? (
								<p className="text-muted-foreground text-sm">
									{convertMinutesToHrMin(item.currentRuntime)} logged
								</p>
							) : null}
						</div>
						<div className="flex shrink-0 items-center gap-2">
							<Badge className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
								Watching
							</Badge>
							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-7"
								onClick={() => setIsDialogOpen(true)}
							>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</div>
					</div>

					{progressValue > 0 && (
						<div className="space-y-1">
							<div className="flex items-center justify-between text-xs">
								<span className="text-muted-foreground">{progressLabel}</span>
								<span className="font-medium">{progressValue}%</span>
							</div>
							<Progress value={progressValue} className="h-1.5" />
						</div>
					)}

					{nextEpisode && (
						<div className="text-muted-foreground flex items-center gap-1.5 text-xs">
							<Calendar className="h-3 w-3" />
							<span>
								{"Next Episode: "}
								{formatReleaseDate(nextEpisode.airDate)}
							</span>
						</div>
					)}
					{!nextEpisode && lastAired && (
						<div className="text-muted-foreground flex items-center gap-1.5 text-xs">
							<Calendar className="h-3 w-3" />
							<span>
								{"Last Aired: "}
								{formatReleaseDate(lastAired.airDate)}
							</span>
						</div>
					)}
				</div>
			</div>
			<EditHistoryDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				item={item}
				onSave={async (id, data) => {
					await updateMutation.mutateAsync({ id, ...data });
				}}
			/>
		</div>
	);
}

function CurrentlyWatchingDataFetcher({
	items,
	onUpdate,
}: {
	items: HistoryItem[];
	onUpdate?: () => void;
}) {
	const [isPending] = useTransition();

	const { data: showData = [], isLoading } = useQuery({
		queryKey: [
			"watching",
			"details",
			items
				.map(
					(i) =>
						`${i.id}:${i.currentEpisode ?? 0}:${i.currentSeason ?? 0}:${i.currentRuntime ?? 0}`,
				)
				.join(","),
		],
		queryFn: async () => {
			const seriesItems = items.filter(
				(
					item,
				): item is HistoryItem & {
					title: NonNullable<HistoryItem["title"]>;
				} =>
					!!item.title &&
					item.title.mediaType === "SERIES" &&
					!!item.currentSeason &&
					!!item.currentEpisode,
			);
			const movieItems = items.filter(
				(
					item,
				): item is HistoryItem & {
					title: NonNullable<HistoryItem["title"]>;
				} => !!item.title && item.title.mediaType === "MOVIE",
			);

			const [seriesResults, movieDetails] = await Promise.all([
				seriesItems.length > 0
					? client.tmdb.getNextEpisodeInfoBatch(
							seriesItems.map((item) => ({
								tmdbId: item.title.tmdbId,
								currentSeason: item.currentSeason!,
								currentEpisode: item.currentEpisode!,
							})),
						)
					: Promise.resolve([]),
				movieItems.length > 0
					? Promise.all(
							movieItems.map((item) =>
								client.tmdb.getDetails({
									tmdbId: item.title.tmdbId,
									mediaType: "MOVIE",
								}),
							),
						)
					: Promise.resolve([]),
			]);

			const seriesMap = new Map(
				seriesItems.map((item, index) => [
					item.id,
					{
						nextEpisode: seriesResults[index]?.nextEpisode ?? undefined,
						lastAired: seriesResults[index]?.lastAired ?? undefined,
						seasonProgress: seriesResults[index]?.seasonProgress ?? undefined,
					},
				]),
			);
			const movieMap = new Map(
				movieItems.map((item, index) => [
					item.id,
					{ movieRuntime: movieDetails[index]?.runtime ?? undefined },
				]),
			);

			return items.map((item) => {
				if (!item.title) {
					return {
						item,
						nextEpisode: undefined,
						lastAired: undefined,
						seasonProgress: undefined,
						movieRuntime: undefined,
						isLoading: false,
					};
				}
				const seriesData = seriesMap.get(item.id);
				if (seriesData) {
					return {
						item,
						nextEpisode: seriesData.nextEpisode,
						lastAired: seriesData.lastAired,
						seasonProgress: seriesData.seasonProgress,
						movieRuntime: undefined,
						isLoading: false,
					};
				}
				const movieData = movieMap.get(item.id);
				if (movieData) {
					return {
						item,
						nextEpisode: undefined,
						lastAired: undefined,
						seasonProgress: undefined,
						movieRuntime: movieData.movieRuntime,
						isLoading: false,
					};
				}
				return {
					item,
					nextEpisode: undefined,
					lastAired: undefined,
					seasonProgress: undefined,
					movieRuntime: undefined,
					isLoading: false,
				};
			});
		},
		enabled: items.length > 0,
	});

	if (isLoading) {
		return (
			<div className="space-y-3">
				{items.map((item) => (
					<WatchingShowCard
						key={item.id}
						show={{
							item,
							nextEpisode: undefined,
							lastAired: undefined,
							seasonProgress: undefined,
							movieRuntime: undefined,
							isLoading: true,
						}}
						onUpdate={onUpdate}
					/>
				))}
			</div>
		);
	}

	return (
		<div
			className={cn(
				"space-y-3 transition-opacity duration-200",
				isPending ? "pointer-events-none opacity-60" : "opacity-100",
			)}
		>
			{showData.map((show) => (
				<WatchingShowCard key={show.item.id} show={show} onUpdate={onUpdate} />
			))}
		</div>
	);
}

export function CurrentlyWatchingWithData({
	items,
	emptyState,
	onUpdate,
}: {
	items: HistoryItem[];
	emptyState?: {
		title: string;
		description: string;
	};
	onUpdate?: () => void;
}) {
	return (
		<CurrentlyWatchingSection
			itemsToUse={items}
			emptyState={emptyState}
			onUpdate={onUpdate}
		/>
	);
}

function CurrentlyWatchingSection({
	itemsToUse,
	emptyState,
	onUpdate,
}: {
	itemsToUse: HistoryItem[];
	emptyState?: { title: string; description: string };
	onUpdate?: () => void;
}) {
	if (emptyState || itemsToUse.length === 0) {
		return (
			<DoubleBezel>
				<div className="space-y-3">
					<p className="text-muted-foreground text-xs tracking-wide uppercase">
						Currently watching
					</p>
					<h3 className="text-xl font-semibold">
						{emptyState?.title ?? "No titles in progress"}
					</h3>
					<p className="text-muted-foreground text-sm">
						{emptyState?.description ??
							"Start watching something to see it here with progress and release dates."}
					</p>
				</div>
			</DoubleBezel>
		);
	}

	return (
		<DoubleBezel>
			<div className="space-y-4">
				<div>
					<p className="text-muted-foreground text-xs tracking-wide uppercase">
						Currently watching
					</p>
					<h3 className="mt-1 text-xl font-semibold">
						{itemsToUse.length} {itemsToUse.length === 1 ? "title" : "titles"}
					</h3>
				</div>

				<CurrentlyWatchingDataFetcher items={itemsToUse} onUpdate={onUpdate} />
			</div>
		</DoubleBezel>
	);
}
