"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Film, Tv } from "lucide-react";
import Image from "next/image";
import { useReducer, useTransition } from "react";

import { AddHistoryDialog } from "@/app/dashboard/_components/user-actions/add-history-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { client } from "@/lib/orpc";
import { cn, tmdbImageLoader } from "@/lib/utils";

import { TitleDetailsDialog } from "../title-details-dialog";

type TrendingTitle = {
	id: number;
	name: string;
	posterUrl: string | null;
	backdropUrl: string | null;
	mediaType: "MOVIE" | "SERIES";
	tmdbId: number;
	providers: string[];
	description: string | null;
	releaseDate: string | null;
	genres: number[] | null;
};

function TrendingTitleCard({
	title,
	onClick,
	disabled,
}: {
	title: TrendingTitle;
	onClick: () => void;
	disabled?: boolean;
}) {
	return (
		<Card
			className={cn(
				"group w-24 shrink-0 transition-transform hover:scale-105 hover:shadow-md",
				disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
			)}
			onClick={disabled ? undefined : onClick}
		>
			<div className="relative aspect-2/3 overflow-hidden rounded-t-lg">
				{title.posterUrl ? (
					<Image
						width={96}
						height={144}
						loader={tmdbImageLoader}
						src={title.posterUrl}
						alt={title.name}
						loading="eager"
						className="h-full w-full object-cover transition-transform group-hover:scale-110"
					/>
				) : (
					<div className="bg-muted flex h-full w-full items-center justify-center">
						{title.mediaType === "MOVIE" ? (
							<Film className="text-muted-foreground h-4 w-4" />
						) : (
							<Tv className="text-muted-foreground h-4 w-4" />
						)}
					</div>
				)}
				<div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
				{title.providers && title.providers.length > 0 && (
					<div className="absolute right-1 bottom-1 flex -space-x-1.5">
						{title.providers.map((logo) => (
							<div
								key={logo}
								className="bg-background relative h-5 w-5 overflow-hidden rounded-full border border-white shadow-sm"
							>
								<Image
									loader={tmdbImageLoader}
									src={logo}
									alt="Provider"
									height={20}
									width={20}
									className="object-cover"
								/>
							</div>
						))}
					</div>
				)}
			</div>
			<CardContent className="p-2">
				<h4 className="line-clamp-2 text-xs leading-tight font-medium">
					{title.name}
				</h4>
			</CardContent>
		</Card>
	);
}

interface TrendingState {
	recentlyAddedIds: Set<number>;
	selectedTitle: TrendingTitle | null;
	isDialogOpen: boolean;
	isAddTitleDialogOpen: boolean;
	addTitleInitialData: { title: TrendingTitle } | null;
}

type TrendingAction =
	| { type: "SELECT_TITLE"; title: TrendingTitle }
	| { type: "CLOSE_DIALOG" }
	| { type: "OPEN_ADD_TITLE"; data: { title: TrendingTitle } }
	| { type: "CLOSE_ADD_TITLE" }
	| { type: "MARK_ADDED"; tmdbId: number };

const initialTrendingState: TrendingState = {
	recentlyAddedIds: new Set(),
	selectedTitle: null,
	isDialogOpen: false,
	isAddTitleDialogOpen: false,
	addTitleInitialData: null,
};

function trendingReducer(
	state: TrendingState,
	action: TrendingAction,
): TrendingState {
	switch (action.type) {
		case "SELECT_TITLE":
			return { ...state, selectedTitle: action.title, isDialogOpen: true };
		case "CLOSE_DIALOG":
			return { ...state, isDialogOpen: false };
		case "OPEN_ADD_TITLE":
			return {
				...state,
				addTitleInitialData: action.data,
				isAddTitleDialogOpen: true,
			};
		case "CLOSE_ADD_TITLE":
			return {
				...state,
				isAddTitleDialogOpen: false,
				addTitleInitialData: null,
			};
		case "MARK_ADDED":
			return {
				...state,
				recentlyAddedIds: new Set(state.recentlyAddedIds).add(action.tmdbId),
			};
		default:
			return state;
	}
}

export function DiscoverTrending() {
	const queryClient = useQueryClient();
	const [isPending, startTransition] = useTransition();
	const [state, dispatch] = useReducer(trendingReducer, initialTrendingState);

	const { data: rawTrending, isLoading } = useQuery({
		queryKey: [
			"tmdb",
			"discoverTrending",
			{ pages: 5, window: "week", exclude: true },
		],
		queryFn: () =>
			client.tmdb.getDiscoverTrending({
				pages: 5,
				timeWindow: "week",
				excludeInLibrary: true,
			}),
		staleTime: 1000 * 60 * 60 * 6, // 6 hours
	});

	const allTrendingTitles: TrendingTitle[] = rawTrending ?? [];

	const {
		recentlyAddedIds,
		selectedTitle,
		isDialogOpen,
		isAddTitleDialogOpen,
		addTitleInitialData,
	} = state;

	const trendingTitles = allTrendingTitles.filter((title) => {
		return !recentlyAddedIds.has(title.tmdbId);
	});

	const handleTitleClick = (title: TrendingTitle) => {
		dispatch({ type: "SELECT_TITLE", title });
	};

	const handleTitleAdded = (tmdbId: number) => {
		startTransition(() => {
			dispatch({ type: "MARK_ADDED", tmdbId });
		});
	};

	return (
		<>
			<Card className="bg-transparent">
				<CardHeader>
					<CardTitle>Discover what&apos;s trending</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					{isLoading ? (
						<div
							className="[&::-webkit-scrollbar-track]:bg-muted/20 [&::-webkit-scrollbar-thumb]:bg-muted flex gap-3 overflow-x-auto px-6 py-4 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full"
							role="status"
							aria-label="Loading trending titles"
						>
							{Array.from({ length: 16 }).map((_, idx) => (
								<div
									key={`trending-skeleton-${idx}`}
									className="border-border bg-card w-24 shrink-0 overflow-hidden rounded-xl border"
								>
									<Skeleton className="aspect-2/3 w-full rounded-none" />
									<div className="p-2">
										<Skeleton className="h-2.5 w-full rounded-sm" />
									</div>
								</div>
							))}
						</div>
					) : trendingTitles.length > 0 ? (
						<div className="[&::-webkit-scrollbar-track]:bg-muted/20 [&::-webkit-scrollbar-thumb]:bg-muted flex gap-3 overflow-x-auto px-6 py-4 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full">
							{trendingTitles.map((title) => (
								<TrendingTitleCard
									key={`${title.id}-${title.mediaType}`}
									title={title}
									onClick={() => handleTitleClick(title)}
									disabled={isPending}
								/>
							))}
						</div>
					) : (
						<div className="px-6 py-4">
							<p className="text-muted-foreground text-sm">
								No trending titles available.
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{selectedTitle && (
				<TitleDetailsDialog
					open={isDialogOpen}
					onOpenChange={(open) => {
						if (!isPending && !open) dispatch({ type: "CLOSE_DIALOG" });
					}}
					title={{
						name: selectedTitle.name,
						posterUrl: selectedTitle.posterUrl || undefined,
						backdropUrl: selectedTitle.backdropUrl || undefined,
						tmdbId: selectedTitle.tmdbId,
						mediaType: selectedTitle.mediaType,
						description: selectedTitle.description || undefined,
						releaseDate: selectedTitle.releaseDate || undefined,
						genres: selectedTitle.genres || [],
					}}
					showAddToWatchlist
					onOpenAddTitleDialog={(title) => {
						if (!isPending) {
							dispatch({
								type: "OPEN_ADD_TITLE",
								data: {
									title: {
										id: title.tmdbId,
										name: title.name,
										posterUrl: title.posterUrl ?? null,
										backdropUrl: title.backdropUrl ?? null,
										mediaType: title.mediaType,
										tmdbId: title.tmdbId,
										providers: [],
										description: title.description ?? null,
										releaseDate: title.releaseDate ?? null,
										genres: title.genres ?? [],
									},
								},
							});
						}
					}}
				/>
			)}

			{addTitleInitialData && (
				<AddHistoryDialog
					open={isAddTitleDialogOpen}
					onOpenChange={(open) => {
						if (!isPending && !open) dispatch({ type: "CLOSE_ADD_TITLE" });
					}}
					initialTitle={{
						id: addTitleInitialData.title.tmdbId,
						name: addTitleInitialData.title.name,
						posterUrl: addTitleInitialData.title.posterUrl || undefined,
						backdropUrl: addTitleInitialData.title.backdropUrl || undefined,
						description: addTitleInitialData.title.description || undefined,
						mediaType: addTitleInitialData.title.mediaType,
						releaseDate:
							addTitleInitialData.title.releaseDate ||
							new Date().toISOString().split("T")[0],
						genres: addTitleInitialData.title.genres || [],
					}}
					onSuccess={() => {
						handleTitleAdded(addTitleInitialData.title.tmdbId);
						queryClient.invalidateQueries({ queryKey: ["history"] });
					}}
				/>
			)}
		</>
	);
}
