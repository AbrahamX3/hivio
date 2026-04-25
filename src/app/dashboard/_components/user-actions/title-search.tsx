"use client";

import { Loader2, Search } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { tmdbImageLoader } from "@/lib/utils";
import type { MediaType, SearchResult } from "@/types/history";

interface TitleSearchProps {
	searchQuery: string;
	onSearchQueryChange: (query: string) => void;
	mediaTypeFilter: "all" | MediaType;
	onMediaTypeFilterChange: (filter: "all" | MediaType) => void;
	onSearch: () => void;
	isSearching: boolean;
	isPending: boolean;
	searchResults: SearchResult[];
	onSelectTitle: (result: SearchResult) => void;
}

export function TitleSearch({
	searchQuery,
	onSearchQueryChange,
	mediaTypeFilter,
	onMediaTypeFilterChange,
	onSearch,
	isSearching,
	isPending,
	searchResults,
	onSelectTitle,
}: TitleSearchProps) {
	return (
		<>
			<div className="flex gap-2">
				<Input
					placeholder="Search..."
					value={searchQuery}
					onChange={(e) => onSearchQueryChange(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							onSearch();
						}
					}}
					className="flex-1"
				/>
				<Select
					value={mediaTypeFilter}
					onValueChange={(value: "all" | MediaType) =>
						onMediaTypeFilterChange(value)
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
					onClick={onSearch}
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
							onClick={() => onSelectTitle(result)}
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
	);
}
