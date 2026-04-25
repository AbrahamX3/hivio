"use client";

import { TitleDetailsDialog } from "@/components/title-details-dialog";
import { Button } from "@/components/ui/button";
import type { SearchResult } from "@/types/history";

interface SelectedTitlePreviewProps {
	result: SearchResult;
	onChange: () => void;
	disabled?: boolean;
}

export function SelectedTitlePreview({
	result,
	onChange,
	disabled,
}: SelectedTitlePreviewProps) {
	return (
		<div className="flex items-center gap-3 rounded-lg border p-3">
			{result.posterUrl && (
				<TitleDetailsDialog
					title={{
						name: result.name,
						posterUrl: result.posterUrl,
						backdropUrl: result.backdropUrl,
						description: result.description,
						tmdbId: result.id,
						mediaType: result.mediaType,
						releaseDate: result.releaseDate,
						genres: result.genres,
					}}
					triggerImage={{
						width: 56,
						height: 80,
						className: "h-20 w-14 rounded object-cover",
					}}
				/>
			)}
			<div>
				<div className="font-medium">{result.name}</div>
				<div className="text-muted-foreground text-sm">
					{result.mediaType === "MOVIE" ? "Movie" : "Series"}
				</div>
			</div>
			<Button
				variant="ghost"
				size="sm"
				onClick={onChange}
				disabled={disabled}
				className="ml-auto"
			>
				Change
			</Button>
		</div>
	);
}
