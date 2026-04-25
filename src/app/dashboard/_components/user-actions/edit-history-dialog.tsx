"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { client } from "@/lib/orpc";
import type {
	EditHistoryFormValues,
	HistoryItem,
	HistoryUpdateData,
} from "@/types/history";
import { editHistoryFormSchema } from "@/types/history";

import {
	EpisodeSelect,
	FavoriteCheckbox,
	RuntimeInput,
	SeasonSelect,
	StatusSelect,
} from "./history-form-fields";

interface EditHistoryDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	item: HistoryItem | null;
	onSave: (id: string, data: HistoryUpdateData) => Promise<void>;
}

export function EditHistoryDialog({
	open,
	onOpenChange,
	item,
	onSave,
}: EditHistoryDialogProps) {
	const [isPending, startTransition] = useTransition();
	const [isSaving, setIsSaving] = useState(false);
	const [selectedSeason, setSelectedSeason] = useState<number | null>(
		item?.currentSeason ?? null,
	);

	const { data: titleDetails, isPending: isLoadingDetails } = useQuery({
		queryKey: ["tmdb", "details", item?.title?.tmdbId, item?.title?.mediaType],
		queryFn: () =>
			client.tmdb.getDetails({
				tmdbId: item!.title!.tmdbId,
				mediaType: item!.title!.mediaType,
			}),
		enabled: open && !!item?.title,
		staleTime: 1000 * 60 * 5,
	});

	const { data: episodes = [], isPending: isLoadingEpisodes } = useQuery({
		queryKey: ["tmdb", "episodes", item?.title?.tmdbId, selectedSeason],
		queryFn: () =>
			client.tmdb.getSeasonEpisodes({
				tmdbId: item!.title!.tmdbId,
				seasonNumber: selectedSeason!,
			}),
		enabled: open && !!item?.title && selectedSeason != null,
		staleTime: 1000 * 60 * 5,
	});

	const handleSelectSeason = (seasonNumber: number) => {
		if (!item?.title) return;
		startTransition(() => {
			setSelectedSeason(seasonNumber);
			form.setValue("currentEpisode", "");
		});
	};

	const form = useForm<EditHistoryFormValues>({
		resolver: zodResolver(editHistoryFormSchema),
		defaultValues: {
			status: item?.status ?? "PLANNED",
			currentEpisode: item?.currentEpisode?.toString() ?? "",
			currentSeason: item?.currentSeason?.toString() ?? "",
			currentRuntime: item?.currentRuntime?.toString() ?? "",
			isFavourite: item?.isFavourite ?? false,
		},
	});

	const onSubmit = async (data: EditHistoryFormValues) => {
		if (!item) return;

		setIsSaving(true);
		try {
			await onSave(item.id, {
				status: data.status,
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
			onOpenChange(false);
		} catch (error) {
			toast.error("Failed to update history");
			if (error instanceof Error) {
				console.error("Update error:", error.message);
			}
		} finally {
			setIsSaving(false);
		}
	};

	if (!item) return null;

	const isSeries = item.title?.mediaType === "SERIES";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit History</DialogTitle>
					<DialogDescription>
						Update details for {item.title?.name || "this item"}
					</DialogDescription>
				</DialogHeader>
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
											titleDetails={
												titleDetails as import("@/types/history").TitleDetails
											}
											selectedSeason={selectedSeason}
											onSeasonChange={(seasonNum) => {
												void handleSelectSeason(seasonNum);
												startTransition(() => {
													form.setValue("currentEpisode", "");
												});
											}}
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
								onClick={() => onOpenChange(false)}
								disabled={isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSaving || isPending}>
								{isSaving ? "Saving..." : "Save"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
