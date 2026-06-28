"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Film, Tv, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useReducer, useEffect, useState, useTransition } from "react";
import { parseAsString, useQueryState } from "nuqs";

import { AddHistoryDialog } from "@/app/dashboard/_components/user-actions/add-history-dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useSidebar } from "@/components/ui/sidebar";
import { getAllGenres } from "@/lib/genres";
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
		<div
			className={cn(
				"group relative overflow-hidden rounded-xl ring-1 ring-border/50 bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
				disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
			)}
			onClick={disabled ? undefined : onClick}
		>
			<div className="relative aspect-2/3 overflow-hidden">
				{title.posterUrl ? (
					<Image
						fill
						sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
						loader={tmdbImageLoader}
						src={title.posterUrl}
						alt={title.name}
						loading="lazy"
						className="object-cover transition-all duration-500 group-hover:scale-110"
					/>
				) : (
					<div className="bg-muted flex h-full w-full items-center justify-center">
						{title.mediaType === "MOVIE" ? (
							<Film className="text-muted-foreground h-6 w-6" />
						) : (
							<Tv className="text-muted-foreground h-6 w-6" />
						)}
					</div>
				)}
				<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
				{title.providers && title.providers.length > 0 && (
					<div className="absolute right-1.5 bottom-1.5 flex -space-x-2">
						{title.providers.slice(0, 3).map((logo) => (
							<div
								key={logo}
								className="bg-background relative h-7 w-7 overflow-hidden rounded-full border-2 border-background shadow-sm ring-1 ring-border/30"
							>
								<Image
									loader={tmdbImageLoader}
									src={logo}
									alt=""
									fill
									className="object-cover"
								/>
							</div>
						))}
					</div>
				)}
			</div>
			<div className="p-2.5">
				<h4 className="line-clamp-2 text-xs leading-snug font-medium">
					{title.name}
				</h4>
			</div>
		</div>
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
	const { state: sidebarState } = useSidebar();
	const [isDesktop, setIsDesktop] = useState(() => {
		if (typeof window === "undefined") return true;
		return window.innerWidth >= 768;
	});

	useEffect(() => {
		const check = () => setIsDesktop(window.innerWidth >= 768);
		check();
		window.addEventListener("resize", check);
		return () => window.removeEventListener("resize", check);
	}, []);

	const [timeWindow, setTimeWindow] = useQueryState(
		"window",
		parseAsString.withDefault("week"),
	);
	const [mediaTypeFilter, setMediaTypeFilter] = useQueryState(
		"type",
		parseAsString.withDefault("all"),
	);
	const [genreFilter, setGenreFilter] = useQueryState(
		"genre",
		parseAsString.withDefault(""),
	);

	const allGenres = useMemo(() => {
		const movieGenres = getAllGenres("MOVIE");
		const seriesGenres = getAllGenres("SERIES");
		const map = new Map<number, string>();
		movieGenres.forEach((g) => map.set(g.id, g.name));
		seriesGenres.forEach((g) => {
			if (!map.has(g.id)) map.set(g.id, g.name);
		});
		return Array.from(map.entries())
			.sort((a, b) => a[1].localeCompare(b[1]))
			.map(([id, name]) => ({ id: String(id), name }));
	}, []);

	const { data: rawTrending, isLoading } = useQuery({
		queryKey: [
			"tmdb",
			"discoverTrending",
			{ pages: 10, window: timeWindow, exclude: true },
		],
		queryFn: () =>
			client.tmdb.getDiscoverTrending({
				pages: 10,
				timeWindow: timeWindow as "week" | "day",
				excludeInLibrary: true,
			}),
		staleTime: 1000 * 60 * 60 * 6,
	});

	const {
		recentlyAddedIds,
		selectedTitle,
		isDialogOpen,
		isAddTitleDialogOpen,
		addTitleInitialData,
	} = state;

	const trendingTitles = useMemo(() => {
		const titles = rawTrending ?? [];
		let filtered = titles.filter(
			(title) => !recentlyAddedIds.has(title.tmdbId),
		);
		if (mediaTypeFilter === "movies") {
			filtered = filtered.filter((t) => t.mediaType === "MOVIE");
		} else if (mediaTypeFilter === "series") {
			filtered = filtered.filter((t) => t.mediaType === "SERIES");
		}
		if (genreFilter) {
			const genreId = Number(genreFilter);
			filtered = filtered.filter(
				(t) => t.genres && t.genres.includes(genreId),
			);
		}
		return filtered;
	}, [rawTrending, recentlyAddedIds, mediaTypeFilter, genreFilter]);

	const handleTitleClick = (title: TrendingTitle) => {
		dispatch({ type: "SELECT_TITLE", title });
	};

	const handleTitleAdded = (tmdbId: number) => {
		startTransition(() => {
			dispatch({ type: "MARK_ADDED", tmdbId });
		});
	};

	const headerTitle =
		timeWindow === "week" ? "Discover Weekly" : "Trending Today";
	const headerSubtitle =
		timeWindow === "week"
			? "Popular movies and series trending this week"
			: "What's popular right now";

	const filterOptions = [
		{
			group: "window",
			options: [
				{ value: "week", label: "This Week" },
				{ value: "day", label: "Today" },
			],
			current: timeWindow,
			set: setTimeWindow,
		},
		{
			group: "type",
			options: [
				{ value: "all", label: "All" },
				{ value: "movies", label: "Movies" },
				{ value: "series", label: "Series" },
			],
			current: mediaTypeFilter,
			set: setMediaTypeFilter,
		},
	];

	return (
		<div className="min-w-0 w-full max-w-full">
			<div
				className="fixed top-[var(--header-height)] z-20 flex flex-col bg-background/80 backdrop-blur-xl border-b shadow-sm transition-all left-0 md:left-[var(--sidebar-width)]"
				style={{
					right: 0,
					...(isDesktop && sidebarState === "collapsed"
						? { left: "var(--sidebar-width-icon)" }
						: {}),
				}}
			>
				<div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
				<div className="flex-1 min-w-0">
					<h1 className="text-2xl font-semibold tracking-tight">
						{headerTitle}
					</h1>
					<p className="text-muted-foreground mt-0.5 text-sm">
						{headerSubtitle}
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-2">
						{filterOptions.map((group) => (
							<div
								key={group.group}
								className="bg-muted/60 inline-flex items-center rounded-lg p-0.5 ring-1 ring-border/30"
							>
								{group.options.map((opt) => (
									<button
										key={opt.value}
										type="button"
										onClick={() => group.set(opt.value)}
										className={cn(
											"rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-all",
											group.current === opt.value
												? "bg-background text-foreground shadow-xs"
												: "text-muted-foreground hover:text-foreground",
										)}
									>
										{opt.label}
									</button>
								))}
							</div>
						))}

						<Popover>
							<PopoverTrigger asChild>
								<button
									type="button"
									className={cn(
										"bg-muted/60 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ring-1 ring-border/30 transition-all hover:text-foreground",
										genreFilter
											? "text-foreground"
											: "text-muted-foreground",
									)}
								>
									{genreFilter
										? allGenres.find((g) => g.id === genreFilter)?.name ??
											"Genre"
										: "All Genres"}
									{genreFilter ? (
										<span
											onClick={(e) => {
												e.stopPropagation();
												setGenreFilter("");
											}}
											className="hover:bg-muted cursor-pointer rounded-sm p-0.5"
										>
											<X className="size-3" />
										</span>
									) : (
										<ChevronDown className="size-3" />
									)}
								</button>
							</PopoverTrigger>
							<PopoverContent className="w-48 p-0" align="start">
								<ScrollArea className="h-64">
									<div className="p-1">
										{allGenres.map((genre) => (
											<button
												key={genre.id}
												type="button"
												onClick={() =>
													setGenreFilter(
														genreFilter === genre.id ? "" : genre.id,
													)
												}
												className={cn(
													"flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-xs transition-all",
													genreFilter === genre.id
														? "bg-accent text-accent-foreground font-medium"
														: "text-muted-foreground hover:bg-muted hover:text-foreground",
												)}
											>
												{genre.name}
											</button>
										))}
									</div>
								</ScrollArea>
							</PopoverContent>
						</Popover>
				</div>
			</div>
			</div>

			<div className="pt-16">
			{isLoading ? (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 pt-4">
					{Array.from({ length: 16 }).map((_, idx) => (
						<div
							key={`trending-skeleton-${idx}`}
							className="ring-border/50 bg-card overflow-hidden rounded-xl ring-1"
						>
							<Skeleton className="aspect-2/3 w-full rounded-none" />
							<div className="p-2.5">
								<Skeleton className="h-2.5 w-4/5 rounded-sm" />
							</div>
						</div>
					))}
				</div>
			) : trendingTitles.length > 0 ? (
				<div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 pt-4">
					{trendingTitles.map((title, idx) => (
						<div
							key={`${title.id}-${title.mediaType}`}
							className="animate-enter"
							style={{ animationDelay: `${idx * 30}ms` }}
						>
							<TrendingTitleCard
								title={title}
								onClick={() => handleTitleClick(title)}
								disabled={isPending}
							/>
						</div>
					))}
				</div>
			) : (
				<div className="py-4">
					<p className="text-muted-foreground text-sm">
						No trending titles available.
					</p>
				</div>
			)}
			</div>

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
		</div>
	);
}
