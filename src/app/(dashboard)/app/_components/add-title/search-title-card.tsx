import { DialogTitle } from "@radix-ui/react-dialog";
import {
	BookOpenTextIcon,
	BookTextIcon,
	ChevronRightIcon,
	ExpandIcon,
	ExternalLinkIcon,
	LinkIcon,
	MaximizeIcon,
	MousePointerClickIcon,
} from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/types/tmdb";

interface SearchTitleCardProps {
	result: SearchResult;
	selectedTitleId: number;
}

export default function SearchTitleCard({
	result,
	selectedTitleId,
}: SearchTitleCardProps) {
	const titleName = result.media_type === "movie" ? result.title : result.name;
	const releaseDate =
		result.media_type === "movie" ? result.release_date : result.first_air_date;
	const mediaType = result.media_type === "movie" ? "MOVIE" : "SERIES";

	return (
		<div
			className={cn(
				"shaddow-sm group/card relative w-full max-w-md cursor-pointer rounded-lg border-2 md:max-w-2xl",
				selectedTitleId === result.id && "border-primary",
			)}
		>
			{selectedTitleId === result.id && (
				<>
					<div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 z-50 rounded-md bg-background/80 backdrop-blur-sm">
						<Button
							onClick={(e) => {
								e.stopPropagation();
							}}
							size="sm"
							type="submit"
							className="flex w-fit items-center justify-between gap-2 px-4 align-middle"
						>
							<span>Continue</span>
							<ChevronRightIcon className="size-4" />
						</Button>
					</div>
					<div className="absolute bottom-0 z-40 h-full w-full rounded-md bg-background/50 px-4 py-2 backdrop-blur-sm transition-all ease-in-out" />
				</>
			)}
			<div className="relative h-[400px] overflow-hidden rounded-md sm:h-[400px]">
				<Image
					unoptimized
					alt={titleName}
					className="aspect-[231/154] h-full w-full object-cover"
					src={`https://image.tmdb.org/t/p/w500${result.poster_path}`}
					height={231}
					width={154}
				/>
				<ViewPosterButton poster={result.poster_path} alt={titleName} />
				<Badge className="absolute top-3 left-3 z-20">{mediaType}</Badge>
				<MousePointerClickIcon
					className={cn(
						"-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 z-20 opacity-0 transition-opacity duration-150 ease-in-out",
						selectedTitleId !== result.id &&
							"group-hover/card:animate-pulse group-hover/card:opacity-100",
					)}
				/>
				<div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-gray-900/80 to-transparent p-2">
					<div className="flex flex-col justify-start gap-2">
						<div className="flex flex-col items-start gap-[4px]">
							<h3 className="flex items-center gap-2 text-balance align-middle font-bold text-white text-xl">
								{titleName}{" "}
								<ViewExternalPlatformsButton
									type={result.media_type}
									tmdbId={result.id}
								/>
							</h3>
							<div className="flex items-center gap-2 text-balance align-middle text-sm">
								<Badge
									variant="outline"
									className="text-white dark:bg-background"
								>
									{releaseDate
										? new Date(releaseDate).toLocaleDateString()
										: "N/A"}
								</Badge>
								<Badge variant="secondary">
									{result.vote_average ? result.vote_average.toFixed(1) : 0} /
									10
								</Badge>
								<ViewDescriptionButton description={result.overview} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export function ViewPosterButton({
	poster,
	alt,
}: {
	poster: string;
	alt: string;
}) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					onClick={(e) => {
						e.stopPropagation();
					}}
					variant="ghost"
					size="icon"
					className="group absolute top-1 right-1 z-20 hover:bg-transparent"
				>
					<MaximizeIcon className="block size-4 group-hover:hidden" />
					<ExpandIcon className="hidden size-4 group-hover:block" />
				</Button>
			</DialogTrigger>
			<DialogContent className="h-[90vh]">
				<div className="max-h-[85vh] w-full p-6">
					<Image
						src={`https://image.tmdb.org/t/p/w500${poster}`}
						alt={alt}
						unoptimized
						width={780}
						height={1170}
						className="mx-auto h-full w-auto rounded-md object-cover"
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export function ViewDescriptionButton({
	description,
}: {
	description: string;
}) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					onClick={(e) => {
						e.stopPropagation();
					}}
					variant="ghost"
					size="icon"
					className="group size-4 hover:bg-transparent"
				>
					<BookTextIcon className="size-4 group-hover:hidden" />
					<BookOpenTextIcon className="hidden size-4 group-hover:block" />
				</Button>
			</DialogTrigger>
			<DialogContent className="h-screen max-h-[90dvh] sm:h-auto">
				<DialogHeader>
					<DialogTitle className="font-semibold text-2xl">
						Description
					</DialogTitle>
				</DialogHeader>
				<ScrollArea className="my-4 w-full">
					<div className="flex flex-col items-center justify-center gap-4 align-middle md:flex-row">
						<div className="max-w-prose text-pretty leading-6 tracking-wide">
							{description}
						</div>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}

export function ViewExternalPlatformsButton({
	type,
	tmdbId,
}: {
	type: "movie" | "tv";
	tmdbId: number;
}) {
	return (
		<a
			href={`https://www.themoviedb.org/${type}/${tmdbId}`}
			target="_blank"
			rel="noreferrer"
			onClick={(e) => {
				e.stopPropagation();
			}}
			className="group flex items-center justify-between gap-4"
		>
			<LinkIcon className="block size-3 group-hover:hidden" />
			<ExternalLinkIcon className="hidden size-3 group-hover:block" />
		</a>
	);
}
