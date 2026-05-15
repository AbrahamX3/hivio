"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useReducer, useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { client } from "@/lib/orpc";
import type {
	AddTitleFormValues,
	SearchResult,
	TitleDetails,
} from "@/types/history";
import { addTitleFormSchema } from "@/types/history";

import { addDialogReducer, getInitialState } from "./add-dialog-reducer";

interface UseAddHistoryDialogOptions {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
	initialTitle?: SearchResult;
	initialDetails?: TitleDetails;
}

export function useAddHistoryDialog({
	open,
	onOpenChange,
	onSuccess,
	initialTitle,
	initialDetails,
}: UseAddHistoryDialogOptions) {
	const [isPending, startTransition] = useTransition();
	const [state, dispatch] = useReducer(
		addDialogReducer,
		getInitialState(initialTitle, initialDetails),
	);

	const { selectedResult } = state;
	const selectedResultRef = useRef(selectedResult);
	selectedResultRef.current = selectedResult;

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

		dispatch({ type: "SET_IS_ADDING", isAdding: true });

		try {
			if (!state.titleDetails) {
				throw new Error("Title details not found");
			}

			let finalEpisode = data.currentEpisode
				? Math.floor(parseFloat(data.currentEpisode))
				: undefined;
			let finalSeason = data.currentSeason
				? Math.floor(parseFloat(data.currentSeason))
				: undefined;
			let finalRuntime = data.currentRuntime
				? Math.floor(parseFloat(data.currentRuntime))
				: undefined;

			if (data.status === "FINISHED") {
				if (
					selectedResult.mediaType === "MOVIE" &&
					state.titleDetails.runtime
				) {
					finalRuntime = state.titleDetails.runtime;
				} else if (
					selectedResult.mediaType === "SERIES" &&
					state.titleDetails.seasons?.length
				) {
					const validSeasons = state.titleDetails.seasons.filter(
						(s) => s.episodeCount > 0,
					);
					if (validSeasons.length > 0) {
						const lastSeason = validSeasons[validSeasons.length - 1];
						finalSeason = lastSeason.seasonNumber;
						finalEpisode = lastSeason.episodeCount;
					}
				}
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
				imdbId: state.titleDetails.imdbId,
				directors: state.titleDetails.directors,
				currentEpisode: finalEpisode,
				currentSeason: finalSeason,
				currentRuntime: finalRuntime,
				isFavourite: data.isFavourite,
			});
			toast.success(
				result.isUpdate ? "Title updated in history" : "Title added to history",
			);
			onOpenChange(false);
			startTransition(() => {
				dispatch({ type: "RESET_SEARCH" });
				dispatch({ type: "CLEAR_SELECTION" });
				form.reset();
			});
			onSuccess?.();
		} catch (error) {
			toast.error("Failed to add title");
			if (error instanceof Error) {
				console.error("Add title error:", error.message);
			}
		} finally {
			dispatch({ type: "SET_IS_ADDING", isAdding: false });
		}
	};

	const handleSearch = async () => {
		if (!state.searchQuery.trim()) return;

		dispatch({ type: "SET_IS_SEARCHING", isSearching: true });
		try {
			const results = await client.tmdb.search({
				query: state.searchQuery,
				mediaType:
					state.mediaTypeFilter === "all" ? undefined : state.mediaTypeFilter,
			});
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
				dispatch({ type: "SET_SEARCH_RESULTS", results: transformedResults });
			});
		} catch (error) {
			toast.error("Failed to search");
			if (error instanceof Error) {
				console.error("Search error:", error.message);
			}
		} finally {
			dispatch({ type: "SET_IS_SEARCHING", isSearching: false });
		}
	};

	const handleSelectTitle = async (result: SearchResult) => {
		dispatch({ type: "SELECT_RESULT", result });

		try {
			const details = await client.tmdb.getDetails({
				tmdbId: result.id,
				mediaType: result.mediaType,
			});
			dispatch({
				type: "SET_TITLE_DETAILS",
				details: {
					imdbId: details.imdbId,
					directors: details.directors,
					runtime: details.runtime,
					seasons: details.seasons,
				},
			});
			dispatch({
				type: "UPDATE_RESULT",
				result: {
					...result,
					description: details.overview ?? result.description,
					genres: details.genres ?? result.genres,
					posterUrl: details.posterPath
						? `https://image.tmdb.org/t/p/w500${details.posterPath}`
						: result.posterUrl,
					backdropUrl: details.backdropPath
						? `https://image.tmdb.org/t/p/w780${details.backdropPath}`
						: result.backdropUrl,
				},
			});
		} catch (error) {
			toast.error("Failed to load title details");
			if (error instanceof Error) {
				console.error("Load details error:", error.message);
			}
		} finally {
			dispatch({ type: "SET_IS_LOADING_DETAILS", isLoading: false });
		}
	};

	const handleSelectSeason = async (seasonNumber: number) => {
		if (!selectedResult) return;

		dispatch({ type: "SET_SELECTED_SEASON", season: seasonNumber });
		dispatch({ type: "SET_IS_LOADING_EPISODES", isLoading: true });
		dispatch({ type: "SET_EPISODES", episodes: [] });

		try {
			const episodeList = await client.tmdb.getSeasonEpisodes({
				tmdbId: selectedResult.id,
				seasonNumber,
			});
			dispatch({ type: "SET_EPISODES", episodes: episodeList });
		} catch (error) {
			toast.error("Failed to load episodes");
			console.error(error);
		} finally {
			dispatch({ type: "SET_IS_LOADING_EPISODES", isLoading: false });
		}
	};

	const handleChangeTitle = () => {
		startTransition(() => {
			dispatch({
				type: "RESET_TO_INITIAL",
				initialTitle,
				initialDetails,
			});
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

	const { data: fetchedInitialDetails } = useQuery({
		queryKey: ["tmdb", "details", initialTitle?.id, initialTitle?.mediaType],
		queryFn: () =>
			client.tmdb.getDetails({
				tmdbId: initialTitle!.id,
				mediaType: initialTitle!.mediaType,
			}),
		enabled: open && !!initialTitle && !initialDetails && !state.titleDetails,
		staleTime: 1000 * 60 * 5,
	});

	useEffect(() => {
		if (!fetchedInitialDetails) return;
		dispatch({
			type: "SET_TITLE_DETAILS",
			details: {
				imdbId: fetchedInitialDetails.imdbId,
				directors: fetchedInitialDetails.directors,
				runtime: fetchedInitialDetails.runtime,
				seasons: fetchedInitialDetails.seasons,
			},
		});
		const currentResult = selectedResultRef.current;
		if (currentResult) {
			dispatch({
				type: "UPDATE_RESULT",
				result: {
					...currentResult,
					description:
						fetchedInitialDetails.overview ?? currentResult.description,
					genres: fetchedInitialDetails.genres ?? currentResult.genres,
				},
			});
		}
	}, [fetchedInitialDetails]);

	const isSeries = selectedResult?.mediaType === "SERIES";

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			startTransition(() => {
				dispatch({
					type: "RESET_TO_INITIAL",
					initialTitle,
					initialDetails,
				});
				dispatch({ type: "RESET_SEARCH" });
				form.reset({
					status: currentUser?.defaultStatus || "PLANNED",
					currentEpisode: "",
					currentSeason: "",
					currentRuntime: "",
					isFavourite: false,
				});
			});
		}
		onOpenChange(newOpen);
	};

	return {
		isPending,
		startTransition,
		state,
		dispatch,
		form,
		currentUser,
		onSubmit,
		handleSearch,
		handleSelectTitle,
		handleSelectSeason,
		handleChangeTitle,
		isSeries,
		handleOpenChange,
	};
}
