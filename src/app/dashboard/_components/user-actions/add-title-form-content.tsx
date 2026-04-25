"use client";

import type { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import type {
	AddTitleFormValues,
	Episode,
	TitleDetails,
} from "@/types/history";

import {
	EpisodeSelect,
	FavoriteCheckbox,
	RuntimeInput,
	SeasonSelect,
	StatusSelect,
} from "./history-form-fields";

interface AddTitleFormContentProps {
	form: UseFormReturn<AddTitleFormValues>;
	isPending: boolean;
	isAdding: boolean;
	isLoadingDetails: boolean;
	titleDetails: TitleDetails | null;
	isSeries: boolean;
	selectedSeason: number | null;
	episodes: Episode[];
	isLoadingEpisodes: boolean;
	onSeasonChange: (seasonNum: number) => void;
	onSubmit: (data: AddTitleFormValues) => void;
	onCancel: () => void;
}

export function AddTitleFormContent({
	form,
	isPending,
	isAdding,
	isLoadingDetails,
	titleDetails,
	isSeries,
	selectedSeason,
	episodes,
	isLoadingEpisodes,
	onSeasonChange,
	onSubmit,
	onCancel,
}: AddTitleFormContentProps) {
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<StatusSelect control={form.control} disabled={isPending} />

				{isLoadingDetails && (
					<div className="space-y-2">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				)}

				{!isLoadingDetails && titleDetails && (
					<>
						{isSeries ? (
							<>
								<SeasonSelect
									control={form.control}
									disabled={isPending}
									titleDetails={titleDetails}
									selectedSeason={selectedSeason}
									onSeasonChange={onSeasonChange}
								/>
								{selectedSeason !== null && (
									<EpisodeSelect
										control={form.control}
										disabled={isPending}
										episodes={episodes}
										isLoadingEpisodes={isLoadingEpisodes}
									/>
								)}
							</>
						) : (
							<RuntimeInput
								control={form.control}
								disabled={isPending}
								maxRuntime={titleDetails.runtime}
							/>
						)}
					</>
				)}

				<FavoriteCheckbox control={form.control} disabled={isPending} />

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
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
	);
}
