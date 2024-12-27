"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
	CalendarCheck2Icon,
	CalendarIcon,
	CalendarMinusIcon,
	CalendarOffIcon,
	ChevronLeftIcon,
	RefreshCwIcon,
	SaveIcon,
	TrashIcon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
	type HiveFormValues,
	hiveFormSchema,
} from "@/app/(dashboard)/hive/validations";
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
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { statusOptions } from "@/lib/options";
import { cn } from "@/lib/utils";

import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import type { GetById } from "@/types/hive";
import { type HiveData, deleteTitle } from "../app/(dashboard)/hive/actions";

const createSeasonsMap = (titleSeasons: HiveData[0]["title"]["seasons"]) => {
	const seasonsMap = new Map<number, number[]>();

	for (const season of titleSeasons) {
		if (season.air_date === null) continue;

		const episodesArray = Array.from(
			{ length: season.episodes },
			(_, index) => index + 1,
		);
		seasonsMap.set(season.season, episodesArray);
	}

	return seasonsMap;
};

function handleValues(hive: GetById): HiveFormValues {
	if (hive?.status === "WATCHING") {
		return {
			currentEpisode: hive.currentEpisode ?? undefined,
			currentSeason: hive.currentSeason ?? undefined,
			status: hive.status,
			startedAt: hive.startedAt ? new Date(hive.startedAt) : undefined,
			isFavorite: hive.isFavorite,
		};
	}
	if (hive?.status === "UNFINISHED") {
		return {
			currentEpisode: hive.currentEpisode ?? undefined,
			currentSeason: hive.currentSeason ?? undefined,
			startedAt: hive.startedAt ? new Date(hive.startedAt) : undefined,
			status: hive.status,
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
		};
	}
	if (hive?.status === "PENDING") {
		return {
			currentEpisode: hive.currentEpisode ?? undefined,
			currentSeason: hive.currentSeason ?? undefined,
			startedAt: hive.startedAt ? new Date(hive.startedAt) : undefined,
			status: hive.status,
		};
	}

	return {
		status: "WATCHING",
	};
}

export function HiveForm({
	id,
	isScrolled,
}: { id: string; isScrolled: boolean }) {
	const utils = api.useUtils();
	const hive = api.hive.getById.useQuery(
		{ id },
		{
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

	const seasons = hive.data?.title.seasons ?? [];
	const isTitleWatchable =
		new Date() >= new Date(hive.data?.title.release_date.toString() ?? "");

	const router = useRouter();

	const update = api.hive.update.useMutation({
		onSuccess: async (data) => {
			if (data) {
				await utils.hive.getAll.invalidate();
				await utils.hive.getById.invalidate({ id: data.id });
				router.push("/hive");
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

	const seasonsMap = useMemo(() => createSeasonsMap(seasons), [seasons]);

	const canSetSeason =
		hiveForm.watch("status") === "UNFINISHED" ||
		hiveForm.watch("status") === "WATCHING" ||
		hiveForm.watch("status") === "FINISHED";

	const currentSeason = hiveForm.watch("currentSeason");
	const episodes = seasonsMap.get(Number(currentSeason)) ?? [];

	const isFinished = hiveForm.watch("status") === "FINISHED";

	const startDate = hiveForm.watch("startedAt");
	const finishDate = hiveForm.watch("finishedAt");

	if (hive.status === "pending") {
		return (
			<div className="col-span-3 mx-auto flex w-full flex-col gap-4">
				<div className="sticky top-0 flex justify-between gap-2 rounded-md border bg-background/80 px-6 py-2 align-middle backdrop-blur-sm transition-all duration-300">
					<Link
						href="/hive"
						className={cn(
							"size-7",
							buttonVariants({
								variant: "outline",
								size: "icon",
							}),
						)}
					>
						<ChevronLeftIcon className="h-4 w-4" />
						<span className="sr-only">Back to Hive</span>
					</Link>
					<Skeleton className="h-9 w-24" />
					<Skeleton className="h-9 w-36 " />
					<Skeleton className="h-9 w-36" />
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Edit Hive Title</CardTitle>
						<CardDescription>
							Make changes to the title in your hive to better reflect your
							current watch status or to add more information.
						</CardDescription>
					</CardHeader>
					<CardContent>
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
					</CardContent>
				</Card>

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
		<Form {...hiveForm}>
			<form
				onSubmit={hiveForm.handleSubmit(handleSubmit)}
				className="col-span-3 flex w-full flex-col gap-4"
			>
				<div
					className={cn(
						"sticky top-0 flex justify-between gap-2 rounded-md border bg-background/80 px-6 py-2 align-middle backdrop-blur-sm transition-all duration-300",
						isScrolled ? "rounded-none" : "rounded-md",
					)}
				>
					<Link
						href="/hive"
						className={cn(
							"size-7",
							buttonVariants({
								variant: "outline",
								size: "icon",
							}),
						)}
					>
						<ChevronLeftIcon className="h-4 w-4" />
						<span className="sr-only">Back to Hive</span>
					</Link>
					<div className="flex flex-start items-center gap-2 align-middle">
						{hive.data && (
							<>
								<DeleteTitle id={hive.data.id} type={hive.data.title.type} />
								<RefreshTitleData id={hive.data.id} />
							</>
						)}
						<Button
							disabled={!hiveForm.formState.isDirty}
							type="submit"
							size="sm"
						>
							<span>Save Changes</span>
							<SaveIcon className="ml-1 size-4" />
						</Button>
					</div>
				</div>
				<Card>
					<CardHeader>
						<CardTitle>{hive.data?.title.name}</CardTitle>
						<CardDescription>
							Make changes to the title in your hive to better reflect your
							current watch status or to add more information.
						</CardDescription>
					</CardHeader>
					<CardContent>
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
												<SelectSeparator />
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
								seasons.length > 0 && (
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
															{seasons.map(({ season }) => (
																<SelectItem
																	key={`season_${season}`}
																	value={String(season)}
																>
																	Season {season}
																</SelectItem>
															))}
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
																{episodes.map((episode) => (
																	<SelectItem
																		key={`episode_${episode}`}
																		value={String(episode)}
																	>
																		Episode {episode}
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
																date > new Date() ||
																date < new Date("1900-01-01")
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
															Today{" "}
															<CalendarCheck2Icon className="ml-2 size-4" />
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
																	new Date(
																		Date.now() - 1000 * 60 * 60 * 24 * 2,
																	),
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
					</CardContent>
				</Card>
			</form>
		</Form>
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
				router.replace("/hive");
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
					<span className="hidden md:inline-block">Delete</span>
					<TrashIcon className="size-4 md:ml-1" />
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
