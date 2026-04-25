"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { SearchResult, TitleDetails } from "@/types/history";

import { AddTitleFormContent } from "./add-title-form-content";
import { SelectedTitlePreview } from "./selected-title-preview";
import { TitleSearch } from "./title-search";
import { useAddHistoryDialog } from "./use-add-history-dialog";

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
	const {
		isPending,
		startTransition,
		state,
		dispatch,
		form,
		onSubmit,
		handleSearch,
		handleSelectTitle,
		handleSelectSeason,
		handleChangeTitle,
		isSeries,
		handleOpenChange,
	} = useAddHistoryDialog({
		open,
		onOpenChange,
		onSuccess,
		initialTitle,
		initialDetails,
	});

	const {
		searchQuery,
		searchResults,
		isSearching,
		mediaTypeFilter,
		selectedResult,
		isAdding,
		isLoadingDetails,
		titleDetails,
		selectedSeason,
		episodes,
		isLoadingEpisodes,
	} = state;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-2xl">
				<DialogHeader>
					<DialogTitle>Add Title to History</DialogTitle>
					<DialogDescription>
						Search for a movie or series and add it to your watch history
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{!selectedResult && (
						<TitleSearch
							searchQuery={searchQuery}
							onSearchQueryChange={(value) =>
								dispatch({ type: "SET_SEARCH_QUERY", query: value })
							}
							mediaTypeFilter={mediaTypeFilter}
							onMediaTypeFilterChange={(value) =>
								startTransition(() =>
									dispatch({ type: "SET_MEDIA_TYPE_FILTER", filter: value }),
								)
							}
							onSearch={handleSearch}
							isSearching={isSearching}
							isPending={isPending}
							searchResults={searchResults}
							onSelectTitle={handleSelectTitle}
						/>
					)}

					{selectedResult && (
						<div className="space-y-4">
							<SelectedTitlePreview
								result={selectedResult}
								onChange={handleChangeTitle}
								disabled={isPending}
							/>

							<AddTitleFormContent
								form={form}
								isPending={isPending}
								isAdding={isAdding}
								isLoadingDetails={isLoadingDetails}
								titleDetails={titleDetails}
								isSeries={isSeries}
								selectedSeason={selectedSeason}
								episodes={episodes}
								isLoadingEpisodes={isLoadingEpisodes}
								onSeasonChange={(seasonNum) => {
									startTransition(() => {
										dispatch({
											type: "SET_SELECTED_SEASON",
											season: seasonNum,
										});
										form.setValue("currentEpisode", "");
									});
									void handleSelectSeason(seasonNum);
								}}
								onSubmit={onSubmit}
								onCancel={() => {
									onOpenChange(false);
									handleChangeTitle();
									startTransition(() => {
										form.reset();
									});
								}}
							/>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
