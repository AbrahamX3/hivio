"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, formatDate } from "date-fns";
import {
	CalendarCheck2Icon,
	CalendarIcon,
	CalendarMinusIcon,
	CalendarOffIcon,
	CircleEllipsisIcon,
	RefreshCwIcon,
	SaveIcon,
	TrashIcon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Image from "next/image";
import { notFound, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
	type HiveFormValues,
	hiveFormSchema,
} from "@/app/(dashboard)/app/validations";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { genreOptions, statusOptions } from "@/lib/options";
import { cn, convertMinutesToHrMin } from "@/lib/utils";

import { Skeleton } from "@/components/ui/skeleton";
import { type RouterOutputs, api } from "@/trpc/react";
import type { GetById } from "@/types/hive";
import type { LocalDate } from "edgedb";
import { deleteTitle } from "../app/(dashboard)/app/actions";
import { FloatingDrawer } from "./floating-panel";
import MovieRuntimeInput from "./runtime-input";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "./ui/accordion";
import { Badge } from "./ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Separator } from "./ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";

const createSeasonsMap = (hive: HiveById) => {
	const seasonsMap = new Map<
		number,
		{
			id: string;
			createdAt: Date;
			name: string;
			updatedAt: Date | null;
			runtime: number;
			air_date: LocalDate;
			episode_number: number;
			overview: string;
		}[]
	>();
	const seasons = hive?.title.seasons;
	if (!seasons) return seasonsMap;

	for (const season of seasons) {
		if (season.air_date === null) continue;

		const episodes = season.episodes || [];
		const sortedEpisodes = episodes.sort(
			(a, b) => a.episode_number - b.episode_number,
		);

		seasonsMap.set(season.season_number, sortedEpisodes);
	}

	return seasonsMap;
};

function handleValues(hive: GetById): HiveFormValues {
	const runtime = hive?.currentRunTime;

	const hours = runtime ? Math.floor(runtime / 60) : 0;
	const minutes = runtime ? runtime % 60 : 0;

	if (hive?.status === "WATCHING") {
		return {
			currentEpisode: hive.currentEpisode ?? undefined,
			currentSeason: hive.currentSeason ?? undefined,
			status: hive.status,
			startedAt: hive.startedAt ? new Date(hive.startedAt) : undefined,
			isFavorite: hive.isFavorite,
			currentRuntimeHours: hours ?? 0,
			currentRuntimeMinutes: minutes ?? 0,
		};
	}
	if (hive?.status === "UNFINISHED") {
		return {
			currentEpisode: hive.currentEpisode ?? undefined,
			currentSeason: hive.currentSeason ?? undefined,
			startedAt: hive.startedAt ? new Date(hive.startedAt) : undefined,
			status: hive.status,
			currentRuntimeHours: hours ?? 0,
			currentRuntimeMinutes: minutes ?? 0,
		};
	}
	if (hive?.status === "FINISHED") {
		return {
			currentEpisode: hive.currentEpisode ?? undefined,
			currentSeason: hive.currentSeason ?? undefined,
			finishedAt: hive.finishedAt ? new Date(hive.finishedAt) : undefined,
			status: hive.status,
			isFavorite: hive.isFavorite,
			rating: hive.rating ?? undefined,
			startedAt: hive.startedAt ? new Date(hive.startedAt) : undefined,
			currentRuntimeHours: hours ?? 0,
			currentRuntimeMinutes: minutes ?? 0,
		};
	}
	if (hive?.status === "PENDING") {
		return {
			currentEpisode: hive.currentEpisode ?? undefined,
			currentSeason: hive.currentSeason ?? undefined,
			startedAt: hive.startedAt ? new Date(hive.startedAt) : undefined,
			status: hive.status,
			currentRuntimeHours: hours ?? 0,
			currentRuntimeMinutes: minutes ?? 0,
		};
	}

	return {
		status: "WATCHING",
	};
}

type HiveById = RouterOutputs["hive"]["getById"];

export function HiveForm({ id }: { id: string }) {
	const utils = api.useUtils();
	const hive = api.hive.getById.useQuery(
		{ id },
		{
			refetchInterval: false,
			refetchOnReconnect: false,
			refetchOnWindowFocus: false,
			experimental_prefetchInRender: true,
		},
	);

	const hiveForm = useForm<HiveFormValues>({
		resolver: zodResolver(hiveFormSchema),
		defaultValues: async () => {
			const data = await hive.promise;

			if (!data) {
				return {
					status: "WATCHING",
				};
			}

			return handleValues(data);
		},
	});

	const [isPanelOpen, setIsPanelOpen] = useState(false);

	const isTitleWatchable =
		new Date() >= new Date(hive.data?.title.release_date.toString() ?? "");

	const update = api.hive.update.useMutation({
		onSuccess: async (data) => {
			if (data) {
				await utils.hive.getAll.invalidate();
				await utils.hive.getById.invalidate({ id: data.id });
			}
		},
	});

	function handleSubmit(values: HiveFormValues) {
		if (!hive.data) return;

		toast.promise(update.mutateAsync({ form: values, id: hive.data?.id }), {
			loading: "Updating title...",
			success: "Title updated successfully!",
			error: "Error updating title!",
		});
	}

	const seasonsMap = useMemo(
		() => hive.data && createSeasonsMap(hive.data),
		[hive.data],
	);

	const canSetSeason =
		hiveForm.watch("status") === "UNFINISHED" ||
		hiveForm.watch("status") === "WATCHING" ||
		hiveForm.watch("status") === "FINISHED";

	const currentSeason = hiveForm.watch("currentSeason");
	const episodes = seasonsMap?.get(Number(currentSeason)) ?? [];
	const genres = genreOptions
		.filter((genre) => hive.data?.title.genres.includes(genre.value))
		.map((genre) => genre.label);

	const isFinished = hiveForm.watch("status") === "FINISHED";

	const startDate = hiveForm.watch("startedAt");
	const finishDate = hiveForm.watch("finishedAt");

	if (hive.status === "pending") {
		return (
			<div className="col-span-3 mx-auto flex w-full flex-col gap-4">
				<div
					className={cn(
						"sticky top-0 flex justify-between gap-2 rounded-md border bg-background/80 px-6 py-2 align-middle backdrop-blur-sm transition-all duration-300",
					)}
				>
					<div className="mx-auto flex flex-start items-center justify-center gap-2 align-middle">
						<Skeleton className="h-9 w-12" />
						<Skeleton className="h-9 w-24" />
						<Skeleton className="h-9 w-36 " />
						<Skeleton className="h-9 w-24" />
					</div>
				</div>

				<div className="mx-auto w-full max-w-lg space-y-8 pb-4">
					<div className="space-y-2">
						<Skeleton className="h-5 w-16" />
						<Skeleton className="h-10 w-full" />
					</div>

					<div className="space-y-2">
						<Skeleton className="h-5 w-32" />
						<Skeleton className="h-10 w-full" />
					</div>

					<div className="space-y-2">
						<Skeleton className="h-5 w-32" />
						<Skeleton className="h-10 w-full" />
					</div>

					<div className="space-y-2">
						<Skeleton className="h-5 w-24" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-4 w-full max-w-[250px]" />
						<div className="flex flex-wrap items-center gap-2 pt-2">
							<Skeleton className="h-9 w-20" />
							<Skeleton className="h-9 w-24" />
							<Skeleton className="h-9 w-24" />
							<Skeleton className="h-9 w-16" />
						</div>
					</div>

					<div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
						<div className="space-y-0.5">
							<Skeleton className="h-5 w-32" />
							<Skeleton className="h-4 w-60" />
						</div>
						<Skeleton className="h-6 w-11" />
					</div>

					<div className="space-y-2">
						<Skeleton className="h-5 w-24" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>

				<div className="flex items-center justify-center gap-2 md:hidden">
					<Skeleton className="h-9 w-24" />
					<Skeleton className="h-9 w-24" />
					<Skeleton className="h-9 w-32" />
				</div>
			</div>
		);
	}

	if (hive.status === "success" && !hive) {
		return notFound();
	}

	return (
		<>
			{isPanelOpen && hive.data && (
				<FloatingDrawer
					isOpen={isPanelOpen}
					onClose={() => setIsPanelOpen(false)}
					title={hive.data.title.name}
					status={hive.data.status}
					side="right"
				>
					<div className="grid gap-3">
						<div className="flex w-full justify-between gap-4">
							<div className="flex w-full flex-col justify-between align-middle">
								<dl className="flex w-full flex-col justify-between gap-3">
									<dt className="font-semibold text-muted-foreground">
										Release Date
									</dt>
									<dd>
										{formatDate(hive.data.title.release_date.toString(), "PPP")}
									</dd>
									<dt className="font-semibold text-muted-foreground">Type</dt>
									<dd className="capitalize">
										{hive.data.title.type?.toLocaleLowerCase()}
									</dd>
									<dt className="font-semibold text-muted-foreground">
										Genres
									</dt>
									<dd>{genres.join(", ")}</dd>
								</dl>
							</div>
							{hive.data?.title.poster && (
								<Dialog>
									<DialogTrigger asChild>
										<Image
											unoptimized
											src={`https://image.tmdb.org/t/p/w500${hive.data?.title.poster}`}
											alt={hive.data?.title.name}
											blurDataURL={hive.data.title.posterBlur ?? ""}
											placeholder="blur"
											width={154}
											height={231}
											className="h-56 w-auto cursor-pointer rounded-md transition-all hover:scale-105"
										/>
									</DialogTrigger>
									<DialogContent className="h-[90vh]">
										<div className="max-h-[85vh] w-full p-6">
											<Image
												src={`https://image.tmdb.org/t/p/original${hive.data.title.poster}`}
												alt={hive.data.title.name}
												blurDataURL={hive.data.title.posterBlur ?? ""}
												placeholder="blur"
												unoptimized
												width={780}
												height={1170}
												className="h-full rounded-md"
											/>
										</div>
									</DialogContent>
								</Dialog>
							)}
						</div>
						<div className="w-full py-4">
							<h4 className="pb-2 font-semibold text-xl">Description</h4>
							<p className="w-full text-pretty text-sm leading-relaxed tracking-wide">
								{hive.data?.title.description}
							</p>
						</div>
						<Dialog>
							<DialogTrigger asChild>
								<Button>View Seasons</Button>
							</DialogTrigger>
							<DialogContent className="rounded-md bg-background/80 shadow-lg backdrop-blur-sm">
								<DialogHeader>
									<DialogTitle>Seasons</DialogTitle>
									<DialogDescription>
										{hive.data.currentSeason && hive.data.currentSeason && (
											<div>
												{hive.data.status === "WATCHING" && (
													<p className="flex items-center gap-2 align-middle">
														<span className="font-semibold">Currently on:</span>
														<Badge className="gap-1.5" variant="outline">
															<span className="opacity-60">S</span>
															{hive.data.currentSeason
																?.toString()
																.padStart(2, "0")}
															<span className="opacity-60">E</span>
															{hive.data.currentEpisode
																?.toString()
																.padStart(2, "0")}
														</Badge>
													</p>
												)}

												{hive.data.status === "UNFINISHED" && (
													<p className="flex items-center gap-2 align-middle">
														<span className="font-semibold">Stayed on:</span>
														<Badge className="gap-1.5" variant="outline">
															<span className="opacity-60">S</span>
															{hive.data.currentSeason
																?.toString()
																.padStart(2, "0")}
															<span className="opacity-60">E</span>
															{hive.data.currentEpisode
																?.toString()
																.padStart(2, "0")}
														</Badge>
													</p>
												)}

												{hive.data.status === "FINISHED" && (
													<p className="flex items-center gap-2 align-middle">
														<span className="font-semibold">Finished on:</span>
														<Badge className="gap-1.5" variant="outline">
															<span className="opacity-60">S</span>
															{hive.data.currentSeason
																?.toString()
																.padStart(2, "0")}
															<span className="opacity-60">E</span>
															{hive.data.currentEpisode
																?.toString()
																.padStart(2, "0")}
														</Badge>
													</p>
												)}
											</div>
										)}
									</DialogDescription>
								</DialogHeader>
								<Accordion type="single" collapsible className="w-full">
									{hive.data.title.seasons
										.sort((a, b) => a.season_number - b.season_number)
										.map(({ season_number, total_episodes, air_date, id }) => (
											<AccordionItem key={id} value={id}>
												<AccordionTrigger className="hover:no-underline hover:opacity-70">
													<div className="flex w-full justify-between gap-2 align-middle">
														<span className="font-bold">
															<span className="text-primary">
																Season {season_number}
															</span>{" "}
															<span className="font-mono text-xs tabular-nums">
																({total_episodes} episodes)
															</span>
														</span>
														<span className="mr-4 font-extralight">
															{new Date(
																air_date.toString(),
															).toLocaleDateString()}
														</span>
													</div>
												</AccordionTrigger>
												<AccordionContent>
													<Accordion
														type="single"
														collapsible
														className="w-full"
													>
														<AccordionContent>
															{episodes.map((episode) => (
																<AccordionItem
																	key={episode.id}
																	value={`${episode.id}-${episode.episode_number}`}
																	className="ml-4"
																>
																	<AccordionTrigger>
																		<div className="flex w-full justify-between gap-2 align-middle">
																			<span className="font-bold">
																				Episode {episode.episode_number}
																			</span>
																			<span className="mr-4 font-extralight">
																				<TooltipProvider>
																					<Tooltip>
																						<TooltipTrigger>
																							{episode.name}
																						</TooltipTrigger>
																						<TooltipContent>
																							{episode.name}
																						</TooltipContent>
																					</Tooltip>
																				</TooltipProvider>
																			</span>
																		</div>
																	</AccordionTrigger>
																	<AccordionContent className="flex flex-col gap-2">
																		<div className="flex flex-col gap-2 align-middle">
																			<span className="font-bold">
																				Air Date
																			</span>
																			<span className="font-extralight">
																				<TooltipProvider>
																					<Tooltip>
																						<TooltipTrigger>
																							{format(
																								episode.air_date.toString(),
																								"PPP",
																							)}
																						</TooltipTrigger>
																						<TooltipContent>
																							{episode.air_date.toString()}
																						</TooltipContent>
																					</Tooltip>
																				</TooltipProvider>
																			</span>
																		</div>
																		<div className="flex flex-col gap-2 align-middle">
																			<span className="font-bold">Runtime</span>
																			<span className="font-extralight">
																				{convertMinutesToHrMin(episode.runtime)}
																			</span>
																		</div>
																		<div className="flex flex-col gap-2 align-middle">
																			<span className="font-bold">
																				Overview
																			</span>
																			<span className="w-full font-extralight">
																				{episode.overview}
																			</span>
																		</div>
																	</AccordionContent>
																</AccordionItem>
															))}
														</AccordionContent>
													</Accordion>
												</AccordionContent>
											</AccordionItem>
										))}
								</Accordion>
							</DialogContent>
						</Dialog>

						<div className="flex w-full flex-col justify-between align-middle">
							<h4 className="pb-2 font-semibold text-xl">Rating</h4>
							<dl className="flex w-full justify-between gap-3">
								<dt className="font-semibold text-muted-foreground">
									My Rating
								</dt>
								<dd className="capitalize">
									{hive.data?.rating?.toFixed(1) ?? 0} / 10
								</dd>
								<dt className="font-semibold text-muted-foreground">
									Public Rating
								</dt>
								<dd>
									{/* {selectedTitle?.type === "MOVIE"
											? (movieDetailsResult.data?.vote_average.toFixed(
													1,
												) ?? 0)
											: (seriesDetailsResult.data?.vote_average.toFixed(
													1,
												) ?? 0)}{" "}
										/ 10 */}
								</dd>
							</dl>
						</div>
					</div>
					<Separator className="my-4" />

					{hive.data?.title.updatedAt && (
						<div className="text-muted-foreground text-xs">
							<span className="font-semibold">Last Updated: </span>{" "}
							{format(hive.data?.title.updatedAt, "PPPP p")}
						</div>
					)}
				</FloatingDrawer>
			)}

			<Form {...hiveForm}>
				<form
					onSubmit={hiveForm.handleSubmit(handleSubmit)}
					className="col-span-3 flex w-full flex-col gap-4"
				>
					<div
						className={cn(
							"sticky top-0 flex justify-between gap-2 rounded-md border bg-background/80 px-6 py-2 align-middle backdrop-blur-sm transition-all duration-300",
						)}
					>
						<div className="mx-auto flex flex-start items-center justify-center gap-2 align-middle">
							{hive.data && (
								<>
									<DeleteTitle id={hive.data.id} type={hive.data.title.type} />
									<Button
										type="button"
										variant="secondary"
										size="sm"
										className="flex items-center gap-2"
										onClick={() => setIsPanelOpen(true)}
									>
										<span className="hidden md:inline-block">View Details</span>
										<CircleEllipsisIcon className="size-4 md:ml-1" />
									</Button>
									{hive.data && <RefreshTitleData id={hive.data.id} />}
								</>
							)}
							<Button
								disabled={!hiveForm.formState.isDirty}
								type="submit"
								size="sm"
							>
								<span>Save</span>
								<SaveIcon className="ml-1 size-4" />
							</Button>
						</div>
					</div>
					<div className="mx-auto w-full max-w-lg space-y-8 pb-4">
						<FormField
							control={hiveForm.control}
							name="status"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormLabel isRequired>Status</FormLabel>
									<Select
										disabled={!isTitleWatchable}
										onValueChange={field.onChange}
										value={field.value}
									>
										<FormControl>
											<SelectTrigger className="w-full truncate">
												<SelectValue
													aria-label="Status"
													placeholder="Select the status..."
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<ScrollArea className="h-30 w-full">
												{statusOptions.map((item) => (
													<SelectItem
														key={item.value}
														title={item.label}
														value={item.value}
													>
														<div className="flex items-center gap-2 align-middle">
															<item.icon className="h-3 w-3" />
															<span>{item.label}</span>
														</div>
													</SelectItem>
												))}
											</ScrollArea>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{canSetSeason &&
							hive &&
							hive.data?.title.type === "SERIES" &&
							hive.data?.title.seasons.length > 0 && (
								<>
									<FormField
										control={hiveForm.control}
										name="currentSeason"
										render={({ field }) => (
											<FormItem>
												<FormLabel isRequired>Current Season</FormLabel>
												<Select
													onValueChange={field.onChange}
													defaultValue={String(field.value)}
													value={String(hiveForm.watch("currentSeason"))}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue
																aria-label="Current Season"
																placeholder="Select the season you are on"
															/>
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{hive.data?.title.seasons.map(
															({ season_number }) => (
																<SelectItem
																	key={`season_${season_number}`}
																	value={String(season_number)}
																>
																	Season {season_number}
																</SelectItem>
															),
														)}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									{hiveForm.watch("currentSeason") !== 0 && (
										<FormField
											control={hiveForm.control}
											name="currentEpisode"
											render={({ field }) => (
												<FormItem>
													<FormLabel isRequired>Current Episode</FormLabel>
													<Select
														onValueChange={field.onChange}
														defaultValue={String(field.value)}
														value={String(hiveForm.watch("currentEpisode"))}
													>
														<FormControl>
															<SelectTrigger>
																<SelectValue
																	aria-label="Current Episode"
																	placeholder="Select the episode you are on"
																/>
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															{episodes.map(({ name, episode_number }) => (
																<SelectItem
																	key={`episode_${episode_number}`}
																	value={String(episode_number)}
																>
																	{episode_number}. {name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}
								</>
							)}

						{hive &&
							hive.data?.title.type === "MOVIE" &&
							hiveForm.watch("status") !== "FINISHED" && (
								<>
									<MovieRuntimeInput />
									{(hiveForm.formState.errors.currentRuntimeHours ||
										hiveForm.formState.errors.currentRuntimeMinutes) && (
										<p className="text-red-500 text-sm">
											{hiveForm.formState.errors.currentRuntimeHours?.message ||
												hiveForm.formState.errors.currentRuntimeMinutes
													?.message}
										</p>
									)}
								</>
							)}

						{canSetSeason && (
							<>
								<FormField
									control={hiveForm.control}
									name="startedAt"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<FormLabel>Date Started</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<FormControl>
														<Button
															variant={"outline"}
															className={cn(
																"w-full pl-3 text-left font-normal",
																!field.value && "text-muted-foreground",
															)}
														>
															{startDate ? (
																format(startDate, "PPP")
															) : (
																<span>Pick start date</span>
															)}
															<CalendarIcon className="ml-auto size-4 opacity-50" />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0" align="start">
													<Calendar
														mode="single"
														selected={field.value}
														onSelect={field.onChange}
														disabled={(date) =>
															date > new Date() || date < new Date("1900-01-01")
														}
														initialFocus
													/>
												</PopoverContent>
											</Popover>
											<FormDescription>
												<p>The date you started watching this title.</p>
												<div className="flex w-full flex-wrap items-center gap-2 pt-2">
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => field.onChange(new Date())}
													>
														Today <CalendarCheck2Icon className="ml-2 size-4" />
													</Button>
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() =>
															field.onChange(
																new Date(Date.now() - 1000 * 60 * 60 * 24),
															)
														}
													>
														Yesterday{" "}
														<CalendarMinusIcon className="ml-2 size-4" />
													</Button>

													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() =>
															field.onChange(
																new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
															)
														}
													>
														2 days ago{" "}
														<CalendarMinusIcon className="ml-2 size-4" />
													</Button>
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => field.onChange(undefined)}
													>
														Clear <CalendarOffIcon className="ml-2 size-4" />
													</Button>
												</div>
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={hiveForm.control}
									name="isFavorite"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
											<div className="space-y-0.5">
												<FormLabel>Is this a favorite?</FormLabel>
												<FormDescription>
													This will be visibile on your public profile marked
													with a star.
												</FormDescription>
											</div>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</>
						)}

						{isFinished && (
							<FormField
								control={hiveForm.control}
								name="finishedAt"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>Date Finished</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															"w-full pl-3 text-left font-normal",
															!field.value && "text-muted-foreground",
														)}
													>
														{finishDate ? (
															format(finishDate, "PPP")
														) : (
															<span>Pick finish date</span>
														)}
														<CalendarIcon className="ml-auto size-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													disabled={(date) =>
														date > new Date() || date < new Date("1900-01-01")
													}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
										<FormDescription>
											<p>The date you finished watching this title.</p>
											<div className="flex w-full flex-wrap items-center gap-2 pt-2">
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => field.onChange(new Date())}
												>
													Today <CalendarCheck2Icon className="ml-2 size-4" />
												</Button>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() =>
														field.onChange(
															new Date(Date.now() - 1000 * 60 * 60 * 24),
														)
													}
												>
													Yesterday{" "}
													<CalendarMinusIcon className="ml-2 size-4" />
												</Button>

												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() =>
														field.onChange(
															new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
														)
													}
												>
													2 days ago{" "}
													<CalendarMinusIcon className="ml-2 size-4" />
												</Button>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => field.onChange(undefined)}
												>
													Clear <CalendarOffIcon className="ml-2 size-4" />
												</Button>
											</div>
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{canSetSeason && (
							<FormField
								control={hiveForm.control}
								name="rating"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Your Rating</FormLabel>
										<FormControl>
											<Input
												step={0.5}
												type="number"
												pattern="[0-9]*"
												placeholder="1-10"
												min={0}
												max={10}
												{...field}
											/>
										</FormControl>
										<FormDescription>
											0 = No Rating. It won&apos;t be visible on your public
											profile.
											<br />
											1-10 = Your Rating. It will be visbile on your public
											profile.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
					</div>
				</form>
			</Form>
		</>
	);
}

function RefreshTitleData({ id }: { id: string }) {
	const utils = api.useUtils();
	const refresh = api.title.refresh.useMutation({
		onSuccess: ({ id }) => {
			if (id) {
				utils.hive.getById.invalidate({ id });
			}
		},
	});

	return (
		<Button
			onClick={() => {
				toast.promise(refresh.mutateAsync({ id }), {
					loading: "Refreshing title data...",
					success: "Title data refreshed!",
					error: "Error refreshing title data!",
				});
			}}
			size="sm"
			variant="outline"
			type="button"
			disabled={refresh.status === "pending"}
			className="flex items-center gap-2"
		>
			<span className="hidden md:inline-block">Refresh Title</span>
			<RefreshCwIcon className="size-4 md:ml-1" />
		</Button>
	);
}

function DeleteTitle({ id, type }: { id: string; type: "MOVIE" | "SERIES" }) {
	const router = useRouter();

	const { execute, status } = useAction(deleteTitle, {
		onSuccess: ({ data }) => {
			if (data?.success) {
				toast.success("Title deleted from your hive!", {
					id: "delete-title",
				});
				router.replace("/app");
			}
		},
		onError: ({ error }) => {
			toast.error("Server Error", {
				description: error.serverError,
				id: "delete-title",
			});
		},
		onExecute: () => {
			toast.loading("Deleting title from your hive...", {
				id: "delete-title",
			});
		},
	});

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button type="button" variant="destructive" size="sm">
					<TrashIcon className="size-4" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>¡Warning!</AlertDialogTitle>
					<AlertDialogDescription>
						¿Are you sure you want to delete this {type.toLowerCase()} from your
						hive?
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						disabled={status === "executing"}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						onClick={() => execute({ id })}
					>
						Confirm
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
