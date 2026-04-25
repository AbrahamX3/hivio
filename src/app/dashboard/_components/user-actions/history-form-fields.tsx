"use client";

import type { Control, FieldValues, Path } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import {
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
import type { Episode, TitleDetails } from "@/types/history";

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

interface StatusSelectProps<T extends FieldValues> {
	control: Control<T>;
	disabled?: boolean;
}

export function StatusSelect<T extends FieldValues>({
	control,
	disabled,
}: StatusSelectProps<T>) {
	return (
		<FormField
			control={control}
			name={"status" as Path<T>}
			render={({ field }) => (
				<FormItem>
					<FormLabel>Status</FormLabel>
					<Select
						onValueChange={field.onChange}
						value={field.value}
						disabled={disabled}
					>
						<FormControl>
							<SelectTrigger disabled={disabled}>
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
						</FormControl>
						<SelectContent>
							<SelectItem value="FINISHED">Finished</SelectItem>
							<SelectItem value="WATCHING">Watching</SelectItem>
							<SelectItem value="PLANNED">Planned</SelectItem>
							<SelectItem value="ON_HOLD">On Hold</SelectItem>
							<SelectItem value="DROPPED">Dropped</SelectItem>
							<SelectItem value="REWATCHING">Rewatching</SelectItem>
						</SelectContent>
					</Select>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

interface SeasonSelectProps<T extends FieldValues> {
	control: Control<T>;
	disabled?: boolean;
	titleDetails: TitleDetails | null;
	selectedSeason: number | null;
	onSeasonChange: (seasonNumber: number) => void;
}

export function SeasonSelect<T extends FieldValues>({
	control,
	disabled,
	titleDetails,
	selectedSeason,
	onSeasonChange,
}: SeasonSelectProps<T>) {
	return (
		<FormField
			control={control}
			name={"currentSeason" as Path<T>}
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
							onSeasonChange(seasonNum);
						}}
						disabled={disabled}
					>
						<FormControl>
							<SelectTrigger disabled={disabled}>
								<SelectValue placeholder="Select season" />
							</SelectTrigger>
						</FormControl>
						<SelectContent>
							{titleDetails?.seasons
								?.filter((season) => season.episodeCount > 0)
								.map((season) => {
									const year = getSeasonYear(season.airDate);
									return (
										<SelectItem
											key={season.seasonNumber}
											value={season.seasonNumber.toString()}
										>
											{season.name}
											{year && ` (${year})`} ({season.episodeCount} episodes)
										</SelectItem>
									);
								})}
						</SelectContent>
					</Select>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

interface EpisodeSelectProps<T extends FieldValues> {
	control: Control<T>;
	disabled?: boolean;
	episodes: Episode[];
	isLoadingEpisodes: boolean;
}

export function EpisodeSelect<T extends FieldValues>({
	control,
	disabled,
	episodes,
	isLoadingEpisodes,
}: EpisodeSelectProps<T>) {
	return (
		<FormField
			control={control}
			name={"currentEpisode" as Path<T>}
			render={({ field }) => (
				<FormItem>
					<FormLabel>Episode</FormLabel>
					{isLoadingEpisodes ? (
						<Skeleton className="h-10 w-full" />
					) : (
						<Select
							value={field.value ?? ""}
							onValueChange={field.onChange}
							disabled={disabled}
						>
							<FormControl>
								<SelectTrigger disabled={disabled}>
									<SelectValue placeholder="Select episode" />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								{episodes.map((ep) => {
									const dateStr = formatEpisodeDate(ep.airDate);
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
	);
}

interface RuntimeInputProps<T extends FieldValues> {
	control: Control<T>;
	disabled?: boolean;
	maxRuntime?: number | null;
}

export function RuntimeInput<T extends FieldValues>({
	control,
	disabled,
	maxRuntime,
}: RuntimeInputProps<T>) {
	return (
		<FormField
			control={control}
			name={"currentRuntime" as Path<T>}
			render={({ field }) => (
				<FormItem>
					<FormLabel>
						Runtime (minutes)
						{maxRuntime && (
							<span className="text-muted-foreground ml-2 text-xs">
								Max: {maxRuntime} min
							</span>
						)}
					</FormLabel>
					<FormControl>
						<Input
							type="number"
							min="0"
							max={maxRuntime || undefined}
							placeholder="Runtime in minutes"
							disabled={disabled}
							{...field}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

interface FavoriteCheckboxProps<T extends FieldValues> {
	control: Control<T>;
	disabled?: boolean;
}

export function FavoriteCheckbox<T extends FieldValues>({
	control,
	disabled,
}: FavoriteCheckboxProps<T>) {
	return (
		<FormField
			control={control}
			name={"isFavourite" as Path<T>}
			render={({ field }) => (
				<FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
					<FormControl>
						<Checkbox
							checked={field.value}
							onCheckedChange={field.onChange}
							disabled={disabled}
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
	);
}
