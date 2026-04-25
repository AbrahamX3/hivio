"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { TitleDetailsDialog } from "@/components/title-details-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { client } from "@/lib/orpc";
import { tmdbImageLoader } from "@/lib/utils";
import type {
	AddTitleFormValues,
	Episode,
	MediaType,
	SearchResult,
	TitleDetails,
} from "@/types/history";
import { addTitleFormSchema } from "@/types/history";

function formatEpisodeDate(dateString: string | null) {
	if (!dateString) return "";
	try {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			weekday: "long",
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	} catch {
		return "";
	}
}

function getSeasonYear(dateString: string | null) {
	if (!dateString) return "";
	try {
		const date = new Date(dateString);
		return date.getFullYear().toString();
	} catch {
		return "";
	}
}

interface AddHistoryDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
	initialTitle?: SearchResult;
	initialDetails?: TitleDetails;
}

export function AddHistoryDialog({
	open,
	onOpenChange,
	onSuccess,
	initialTitle,
	initialDetails,
}: AddHistoryDialogProps) {
	const [isPending, startTransition] = useTransition();
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [mediaTypeFilter, setMediaTypeFilter] = useState<"all" | MediaType>(
		"all",
	);
	const [selectedResult, setSelectedResult] = useState<SearchResult | null>(
		initialTitle || null,
	);

	const [isAdding, setIsAdding] = useState(false);
	const [isLoadingDetails, setIsLoadingDetails] = useState(false);
	const [titleDetails, setTitleDetails] = useState<TitleDetails | null>(
		initialDetails || null,
	);
	const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
	const [episodes, setEpisodes] = useState<Episode[]>([]);
	const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
	const { data: currentUser } = useQuery({
		queryKey: ["user", "getCurrentUser"],
		queryFn: () => client.user.getCurrentUser(),
		enabled: open,
	});

	const form = useForm<AddTitleFormValues>({
		resolver: zodResolver(addTitleFormSchema),
		defaultValues: {
			status: currentUser?.defaultStatus || "PLANNED",
			currentEpisode: "",
			currentSeason: "",
			currentRuntime: "",
			isFavourite: false,
		},
	});

	const onSubmit = async (data: AddTitleFormValues) => {
		if (!selectedResult) return;

		setIsAdding(true);

		try {
			if (!titleDetails) {
				throw new Error("Title details not found");
			}

			const result = await client.history.add({
				tmdbId: selectedResult.id,
				mediaType: selectedResult.mediaType,
				status: data.status,
				name: selectedResult.name,
				posterPath: selectedResult.posterUrl
					? selectedResult.posterUrl.replace(
							"https://image.tmdb.org/t/p/w500",
							"",
						)
					: null,
				backdropPath: selectedResult.backdropUrl
					? selectedResult.backdropUrl.replace(
							"https://image.tmdb.org/t/p/w780",
							"",
						)
					: null,
				overview: selectedResult.description ?? null,
				releaseDate: selectedResult.releaseDate || null,
				genres: selectedResult.genres,
				imdbId: titleDetails.imdbId,
				directors: titleDetails.directors,
				currentEpisode: data.currentEpisode
					? Math.floor(parseFloat(data.currentEpisode))
					: undefined,
				currentSeason: data.currentSeason
					? Math.floor(parseFloat(data.currentSeason))
					: undefined,
				currentRuntime: data.currentRuntime
					? Math.floor(parseFloat(data.currentRuntime))
					: undefined,
				isFavourite: data.isFavourite,
			});
			toast.success(
				result.isUpdate ? "Title updated in history" : "Title added to history",
			);
			onOpenChange(false);
			startTransition(() => {
				setSearchQuery("");
				setSearchResults([]);
				setMediaTypeFilter("all");
				setSelectedResult(null);
				form.reset();
			});
			onSuccess?.();
		} catch (error) {
			toast.error("Failed to add title");
			if (error instanceof Error) {
				console.error("Add title error:", error.message);
			}
		} finally {
			setIsAdding(false);
		}
	};

	const handleSearch = async () => {
		if (!searchQuery.trim()) return;

		setIsSearching(true);
		try {
			const results = await client.tmdb.search({
				query: searchQuery,
				mediaType: mediaTypeFilter === "all" ? undefined : mediaTypeFilter,
			});
			// Transform TMDB paths to full URLs for SearchResult type
			const transformedResults: SearchResult[] = results.map((r) => ({
				id: r.id,
				name: r.name,
				posterUrl: r.posterPath
					? `https://image.tmdb.org/t/p/w500${r.posterPath}`
					: undefined,
				backdropUrl: r.backdropPath
					? `https://image.tmdb.org/t/p/w780${r.backdropPath}`
					: undefined,
				description: r.overview ?? undefined,
				mediaType: r.mediaType,
				releaseDate: r.releaseDate ?? "",
				genres: [],
			}));
			startTransition(() => {
				setSearchResults(transformedResults);
			});
		} catch (error) {
			toast.error("Failed to search");
			if (error instanceof Error) {
				console.error("Search error:", error.message);
			}
		} finally {
			setIsSearching(false);
		}
	};

	const handleSelectTitle = async (result: SearchResult) => {
		setSelectedResult(result);
		setIsLoadingDetails(true);
		setTitleDetails(null);
		setSelectedSeason(null);
		setEpisodes([]);

		try {
			const details = await client.tmdb.getDetails({
				tmdbId: result.id,
				mediaType: result.mediaType,
			});
			setTitleDetails({
				imdbId: details.imdbId,
				directors: details.directors,
				runtime: details.runtime,
				seasons: details.seasons,
			});
			// Also update the selected result with details from getDetails
			setSelectedResult((prev) =>
				prev
					? {
							...prev,
							description: details.overview ?? prev.description,
							genres: details.genres ?? prev.genres,
							posterUrl: details.posterPath
								? `https://image.tmdb.org/t/p/w500${details.posterPath}`
								: prev.posterUrl,
							backdropUrl: details.backdropPath
								? `https://image.tmdb.org/t/p/w780${details.backdropPath}`
								: prev.backdropUrl,
						}
					: null,
			);
		} catch (error) {
			toast.error("Failed to load title details");
			if (error instanceof Error) {
				console.error("Load details error:", error.message);
			}
		} finally {
			setIsLoadingDetails(false);
		}
	};

	const handleSelectSeason = async (seasonNumber: number) => {
		if (!selectedResult) return;

		setSelectedSeason(seasonNumber);
		setIsLoadingEpisodes(true);
		setEpisodes([]);

		try {
			const episodeList = await client.tmdb.getSeasonEpisodes({
				tmdbId: selectedResult.id,
				seasonNumber,
			});
			setEpisodes(episodeList);
		} catch (error) {
			toast.error("Failed to load episodes");
			console.error(error);
		} finally {
			setIsLoadingEpisodes(false);
		}
	};

	const handleChangeTitle = () => {
		startTransition(() => {
			setSelectedResult(initialTitle || null);
			setTitleDetails(initialDetails || null);
			setSelectedSeason(null);
			setEpisodes([]);
			setSearchResults([]);
			form.setValue("currentSeason", "");
			form.setValue("currentEpisode", "");
			form.setValue("currentRuntime", "");
		});
	};

	useEffect(() => {
		if (currentUser?.defaultStatus && open) {
			form.setValue("status", currentUser.defaultStatus);
		}
	}, [currentUser?.defaultStatus, open, form]);

	useEffect(() => {
		if (open && initialTitle && !initialDetails && !titleDetails) {
			setIsLoadingDetails(true);
			client.tmdb
				.getDetails({
					tmdbId: initialTitle.id,
					mediaType: initialTitle.mediaType,
				})
				.then((details) => {
					setTitleDetails({
						imdbId: details.imdbId,
						directors: details.directors,
						runtime: details.runtime,
						seasons: details.seasons,
					});
					// Update selected result with full details
					setSelectedResult((prev) =>
						prev
							? {
									...prev,
									description: details.overview ?? prev.description,
									genres: details.genres ?? prev.genres,
								}
							: null,
					);
				})
				.catch((error) => {
					toast.error("Failed to load title details");
					if (error instanceof Error) {
						console.error("Load details error:", error.message);
					}
				})
				.finally(() => {
					setIsLoadingDetails(false);
				});
		}
	}, [open, initialTitle, initialDetails, titleDetails]);

	useEffect(() => {
		if (!open) {
			startTransition(() => {
				setSelectedResult(initialTitle || null);
				setTitleDetails(initialDetails || null);
				setSearchQuery("");
				setSearchResults([]);
				setMediaTypeFilter("all");
				setSelectedSeason(null);
				setEpisodes([]);
				form.reset({
					status: currentUser?.defaultStatus || "PLANNED",
					currentEpisode: "",
					currentSeason: "",
					currentRuntime: "",
					isFavourite: false,
				});
			});
		}
	}, [
		open,
		initialTitle,
		initialDetails,
		form,
		currentUser?.defaultStatus,
		startTransition,
	]);

	const isSeries = selectedResult?.mediaType === "SERIES";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-2xl">
				<DialogHeader>
					<DialogTitle>Add Title to History</DialogTitle>
					<DialogDescription>
						Search for a movie or series and add it to your watch history
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{!selectedResult && (
						<>
							<div className="flex gap-2">
								<Input
									placeholder="Search..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											handleSearch();
										}
									}}
									className="flex-1"
								/>
								<Select
									value={mediaTypeFilter}
									onValueChange={(value: "all" | MediaType) =>
										startTransition(() => setMediaTypeFilter(value))
									}
									disabled={isPending}
								>
									<SelectTrigger className="w-[140px]" disabled={isPending}>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All</SelectItem>
										<SelectItem value="MOVIE">Movies</SelectItem>
										<SelectItem value="SERIES">Series</SelectItem>
									</SelectContent>
								</Select>
								<Button
									onClick={handleSearch}
									disabled={isSearching || isPending || !searchQuery.trim()}
								>
									{isSearching ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Search className="h-4 w-4" />
									)}
								</Button>
							</div>

							{isSearching && (
								<div className="space-y-2">
									<Skeleton className="h-20 w-full" />
									<Skeleton className="h-20 w-full" />
									<Skeleton className="h-20 w-full" />
								</div>
							)}

							{!isSearching && searchResults.length > 0 && (
								<div className="max-h-64 space-y-2 overflow-y-auto">
									{searchResults.map((result) => (
										<button
											key={result.id}
											onClick={() => handleSelectTitle(result)}
											className="hover:bg-accent flex w-full items-center gap-3 rounded-lg border p-3 text-left"
										>
											{result.posterUrl && (
												<Image
													width={48}
													height={64}
													loader={tmdbImageLoader}
													src={result.posterUrl}
													alt={result.name}
													loading="lazy"
													className="h-16 w-12 rounded object-cover"
												/>
											)}
											<div className="flex-1">
												<div className="font-medium">{result.name}</div>
												<div className="text-muted-foreground text-xs">
													{result.mediaType === "MOVIE" ? "Movie" : "Series"} •{" "}
													{result.releaseDate
														? new Date(result.releaseDate).getFullYear()
														: "Unknown"}
												</div>
											</div>
										</button>
									))}
								</div>
							)}
						</>
					)}

					{selectedResult && (
						<div className="space-y-4">
							<div className="flex items-center gap-3 rounded-lg border p-3">
								{selectedResult.posterUrl && (
									<TitleDetailsDialog
										title={{
											name: selectedResult.name,
											posterUrl: selectedResult.posterUrl,
											backdropUrl: selectedResult.backdropUrl,
											description: selectedResult.description,
											tmdbId: selectedResult.id,
											mediaType: selectedResult.mediaType,
											releaseDate: selectedResult.releaseDate,
											genres: selectedResult.genres,
										}}
										triggerImage={{
											width: 56,
											height: 80,
											className: "h-20 w-14 rounded object-cover",
										}}
									/>
								)}
								<div>
									<div className="font-medium">{selectedResult.name}</div>
									<div className="text-muted-foreground text-sm">
										{selectedResult.mediaType === "MOVIE" ? "Movie" : "Series"}
									</div>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={handleChangeTitle}
									disabled={isPending}
									className="ml-auto"
								>
									Change
								</Button>
							</div>

							{isLoadingDetails && (
								<div className="space-y-2">
									<Skeleton className="h-10 w-full" />
									<Skeleton className="h-10 w-full" />
								</div>
							)}

							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-4"
								>
									<FormField
										control={form.control}
										name="status"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Status</FormLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}
													disabled={isPending}
												>
													<FormControl>
														<SelectTrigger disabled={isPending}>
															<SelectValue placeholder="Select status" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="FINISHED">Finished</SelectItem>
														<SelectItem value="WATCHING">Watching</SelectItem>
														<SelectItem value="PLANNED">Planned</SelectItem>
														<SelectItem value="ON_HOLD">On Hold</SelectItem>
														<SelectItem value="DROPPED">Dropped</SelectItem>
														<SelectItem value="REWATCHING">
															Rewatching
														</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									{!isLoadingDetails && titleDetails && (
										<>
											{isSeries ? (
												<>
													<FormField
														control={form.control}
														name="currentSeason"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Season</FormLabel>
																<Select
																	value={
																		selectedSeason !== null
																			? selectedSeason.toString()
																			: field.value || ""
																	}
																	onValueChange={(value: string) => {
																		const seasonNum = parseInt(value, 10);
																		field.onChange(value);
																		startTransition(() => {
																			setSelectedSeason(seasonNum);
																			form.setValue("currentEpisode", "");
																		});
																		void handleSelectSeason(seasonNum);
																	}}
																	disabled={isPending}
																>
																	<FormControl>
																		<SelectTrigger disabled={isPending}>
																			<SelectValue placeholder="Select season" />
																		</SelectTrigger>
																	</FormControl>
																	<SelectContent>
																		{titleDetails.seasons
																			?.filter(
																				(season) => season.episodeCount > 0,
																			)
																			.map((season) => {
																				const year = getSeasonYear(
																					season.airDate,
																				);
																				return (
																					<SelectItem
																						key={season.seasonNumber}
																						value={season.seasonNumber.toString()}
																					>
																						{season.name}
																						{year && ` (${year})`} (
																						{season.episodeCount} episodes)
																					</SelectItem>
																				);
																			})}
																	</SelectContent>
																</Select>
																<FormMessage />
															</FormItem>
														)}
													/>
													{selectedSeason !== null && (
														<FormField
															control={form.control}
															name="currentEpisode"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Episode</FormLabel>
																	{isLoadingEpisodes ? (
																		<Skeleton className="h-10 w-full" />
																	) : (
																		<Select
																			value={field.value ?? ""}
																			onValueChange={field.onChange}
																			disabled={isPending}
																		>
																			<FormControl>
																				<SelectTrigger disabled={isPending}>
																					<SelectValue placeholder="Select episode" />
																				</SelectTrigger>
																			</FormControl>
																			<SelectContent>
																				{episodes.map((ep) => {
																					const dateStr = formatEpisodeDate(
																						ep.airDate,
																					);
																					return (
																						<SelectItem
																							key={ep.episodeNumber}
																							value={ep.episodeNumber.toString()}
																						>
																							{ep.episodeNumber}. {ep.name}
																							{dateStr && ` - ${dateStr}`}
																						</SelectItem>
																					);
																				})}
																			</SelectContent>
																		</Select>
																	)}
																	<FormMessage />
																</FormItem>
															)}
														/>
													)}
												</>
											) : (
												<FormField
													control={form.control}
													name="currentRuntime"
													render={({ field }) => (
														<FormItem>
															<FormLabel>
																Runtime (minutes)
																{titleDetails.runtime && (
																	<span className="text-muted-foreground ml-2 text-xs">
																		Max: {titleDetails.runtime} min
																	</span>
																)}
															</FormLabel>
															<FormControl>
																<Input
																	type="number"
																	min="0"
																	max={titleDetails.runtime || undefined}
																	placeholder="Runtime in minutes"
																	disabled={isPending}
																	{...field}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											)}
										</>
									)}

									<FormField
										control={form.control}
										name="isFavourite"
										render={({ field }) => (
											<FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
												<FormControl>
													<Checkbox
														checked={field.value}
														onCheckedChange={field.onChange}
													/>
												</FormControl>
												<div className="space-y-1 leading-none">
													<FormLabel>Favorite</FormLabel>
													<p className="text-muted-foreground text-sm">
														Mark this title as a favorite
													</p>
												</div>
											</FormItem>
										)}
									/>

									<DialogFooter>
										<Button
											type="button"
											variant="outline"
											onClick={() => {
												onOpenChange(false);
												handleChangeTitle();
												startTransition(() => {
													setSearchQuery("");
													setMediaTypeFilter("all");
													form.reset();
												});
											}}
											disabled={isPending}
										>
											Cancel
										</Button>
										<Button type="submit" disabled={isAdding || isPending}>
											{isAdding ? "Adding..." : "Add to History"}
										</Button>
									</DialogFooter>
								</form>
							</Form>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
