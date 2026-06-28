"use client";

import { useQuery } from "@tanstack/react-query";
import {
	endOfMonth,
	format,
	parse,
	startOfMonth,
	startOfYear,
	subMonths,
} from "date-fns";
import { BarChart3, CalendarIcon } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import * as React from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	LabelList,
	Pie,
	PieChart,
	XAxis,
	YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { getGenreName } from "@/lib/genres";
import { client } from "@/lib/orpc";
import { cn } from "@/lib/utils";

const today = new Date();
const defaultStart = format(startOfMonth(today), "yyyy-MM-dd");
const defaultEnd = format(today, "yyyy-MM-dd");

const STATUS_COLORS: Record<string, string> = {
	WATCHING: "var(--chart-1)",
	FINISHED: "var(--chart-2)",
	PLANNED: "var(--chart-3)",
	ON_HOLD: "var(--chart-4)",
	DROPPED: "hsl(var(--destructive))",
	REWATCHING: "var(--chart-5)",
};

function DatePickerButton({
	label,
	dateStr,
	setDateStr,
}: {
	label: string;
	dateStr: string;
	setDateStr: (d: string) => void;
}) {
	const date = parse(dateStr, "yyyy-MM-dd", new Date());

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"h-10 justify-start gap-2 text-left font-normal",
						!dateStr && "text-muted-foreground",
					)}
				>
					<CalendarIcon className="size-4" />
					<span className="hidden sm:inline">{label}:</span>
					{format(date, "MMM d, yyyy")}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					captionLayout="dropdown"
					selected={date}
					onSelect={(d) => {
						if (d) setDateStr(format(d, "yyyy-MM-dd"));
					}}
				/>
			</PopoverContent>
		</Popover>
	);
}

function EmptyChart({ message }: { message: string }) {
	return (
		<div className="flex h-[300px] items-center justify-center">
			<p className="text-muted-foreground text-sm">{message}</p>
		</div>
	);
}
function KpiCard({
	title,
	value,
	icon: Icon,
}: {
	title: string;
	value: number | string;
	icon: React.ComponentType<{ className?: string }>;
}) {
	return (
		<div className="bg-card ring-border/50 rounded-xl p-4 ring-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
			<div className="flex items-center justify-between">
				<p className="text-muted-foreground text-xs font-medium">{title}</p>
				<Icon className="text-muted-foreground size-4" />
			</div>
			<div className="mt-2 text-2xl font-bold tabular-nums">{value}</div>
		</div>
	);
}

export default function AnalyticsPage() {
	const [startDate, setStartDate] = useQueryState(
		"start",
		parseAsString.withDefault(defaultStart),
	);
	const [endDate, setEndDate] = useQueryState(
		"end",
		parseAsString.withDefault(defaultEnd),
	);

	const { data: overview, isLoading: overviewLoading } = useQuery({
		queryKey: ["analytics", "overview", { startDate, endDate }],
		queryFn: () => client.analytics.getOverview({ startDate, endDate }),
	});

	const { data: activity, isLoading: activityLoading } = useQuery({
		queryKey: ["analytics", "activity", { startDate, endDate }],
		queryFn: () => client.analytics.getActivityTimeline({ startDate, endDate }),
	});

	const { data: statusDist, isLoading: statusLoading } = useQuery({
		queryKey: ["analytics", "status", { startDate, endDate }],
		queryFn: () =>
			client.analytics.getStatusDistribution({ startDate, endDate }),
	});

	const { data: content, isLoading: contentLoading } = useQuery({
		queryKey: ["analytics", "content", { startDate, endDate }],
		queryFn: () => client.analytics.getContentBreakdown({ startDate, endDate }),
	});

	const { data: progress, isLoading: progressLoading } = useQuery({
		queryKey: ["analytics", "progress", { startDate, endDate }],
		queryFn: () => client.analytics.getProgressTimeline({ startDate, endDate }),
	});

	const { data: transitions, isLoading: transitionsLoading } = useQuery({
		queryKey: ["analytics", "transitions", { startDate, endDate }],
		queryFn: () =>
			client.analytics.getStatusTransitions({ startDate, endDate }),
	});

	const statusChartConfig: ChartConfig = {
		count: { label: "Count" },
		WATCHING: { label: "Watching", color: "var(--chart-1)" },
		FINISHED: { label: "Finished", color: "var(--chart-2)" },
		PLANNED: { label: "Planned", color: "var(--chart-3)" },
		ON_HOLD: { label: "On Hold", color: "var(--chart-4)" },
		DROPPED: { label: "Dropped", color: "hsl(var(--destructive))" },
		REWATCHING: { label: "Rewatching", color: "var(--chart-5)" },
	};

	const activityChartConfig: ChartConfig = {
		count: { label: "Titles Added" },
	};

	const progressChartConfig: ChartConfig = {
		episodesCompleted: { label: "Episodes", color: "var(--chart-1)" },
		minutesWatched: { label: "Minutes", color: "var(--chart-2)" },
	};

	const pieData = (statusDist ?? []).map((s) => ({
		name: s.status,
		value: s.count,
		fill: STATUS_COLORS[s.status] ?? "var(--chart-3)",
	}));

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Analytics</h1>
					<p className="text-muted-foreground text-sm">
						Track your watching habits over time.
					</p>
				</div>
			</div>

			<div className="rounded-xl border border-border/50 p-4 shadow-[inset_0_1px_2px_rgba(255,255,255,0.03)]">
				<div className="flex flex-wrap items-end gap-3">
					<DatePickerButton
						label="Start"
						dateStr={startDate}
						setDateStr={setStartDate}
					/>
					<DatePickerButton
						label="End"
						dateStr={endDate}
						setDateStr={setEndDate}
					/>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								setStartDate(format(startOfMonth(today), "yyyy-MM-dd"));
								setEndDate(format(today, "yyyy-MM-dd"));
							}}
						>
							This Month
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								const last = subMonths(today, 1);
								setStartDate(format(startOfMonth(last), "yyyy-MM-dd"));
								setEndDate(format(endOfMonth(last), "yyyy-MM-dd"));
							}}
						>
							Last Month
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								setStartDate(format(startOfYear(today), "yyyy-MM-dd"));
								setEndDate(format(today, "yyyy-MM-dd"));
							}}
						>
							This Year
						</Button>
					</div>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
				{overviewLoading ? (
					Array.from({ length: 6 }).map((_, i) => (
						<div
							key={`skeleton-${i}`}
							className="bg-card ring-border/50 rounded-xl p-4 ring-1"
						>
							<Skeleton className="h-4 w-20" />
							<Skeleton className="mt-2 h-8 w-16" />
						</div>
					))
				) : (
					<>
						<KpiCard
							title="Total Titles"
							value={overview?.total ?? 0}
							icon={BarChart3}
						/>
						<KpiCard
							title="Watching"
							value={overview?.watching ?? 0}
							icon={BarChart3}
						/>
						<KpiCard
							title="Finished"
							value={overview?.finished ?? 0}
							icon={BarChart3}
						/>
						<KpiCard
							title="Minutes"
							value={overview?.totalMinutes ?? 0}
							icon={BarChart3}
						/>
						<KpiCard
							title="Episodes"
							value={overview?.totalEpisodes ?? 0}
							icon={BarChart3}
						/>
						<KpiCard
							title="Favourites"
							value={overview?.favourites ?? 0}
							icon={BarChart3}
						/>
					</>
				)}
			</div>

			<div className="grid gap-4 lg:grid-cols-2 grid-cols-1">
				<Card>
					<CardHeader>
						<CardTitle>Activity Timeline</CardTitle>
					</CardHeader>
					<CardContent>
						{activityLoading ? (
							<Skeleton className="h-[300px] w-full" />
						) : (activity?.length ?? 0) === 0 ? (
							<EmptyChart message="No titles added in this date range." />
						) : (
							<ChartContainer
								config={activityChartConfig}
								className="h-[300px] w-full"
							>
								<BarChart data={activity ?? []}>
									<CartesianGrid vertical={false} />
									<XAxis
										dataKey="date"
										tickLine={false}
										axisLine={false}
										tickMargin={8}
										tickFormatter={(d: string) => format(new Date(d), "MMM d")}
									/>
									<ChartTooltip
										content={
											<ChartTooltipContent
												labelFormatter={(label) =>
													format(new Date(String(label)), "MMMM d, yyyy")
												}
											/>
										}
									/>
									<Bar
										dataKey="count"
										fill="var(--chart-1)"
										radius={[4, 4, 0, 0]}
									/>
								</BarChart>
							</ChartContainer>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Status Distribution</CardTitle>
					</CardHeader>
					<CardContent>
						{statusLoading ? (
							<Skeleton className="h-[300px] w-full" />
						) : pieData.length === 0 ? (
							<EmptyChart message="No titles in this date range." />
						) : (
							<ChartContainer config={statusChartConfig}>
								<PieChart>
									<Pie
										data={pieData}
										dataKey="value"
										nameKey="name"
										cx="50%"
										cy="50%"
										innerRadius={60}
										outerRadius={100}
									>
										<LabelList
											dataKey="name"
											className="fill-foreground text-xs"
											stroke="none"
											position="outside"
										/>
										{pieData.map((entry) => (
											<Cell key={entry.name} fill={entry.fill} />
										))}
									</Pie>
									<ChartTooltip content={<ChartTooltipContent />} />
								</PieChart>
							</ChartContainer>
						)}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Progress Timeline</CardTitle>
				</CardHeader>
				<CardContent>
					{progressLoading ? (
						<Skeleton className="h-[300px] w-full" />
					) : (progress?.length ?? 0) === 0 ? (
						<EmptyChart message="No progress recorded in this date range." />
					) : (
						<ChartContainer
							config={progressChartConfig}
							className="h-[300px] w-full"
						>
							<AreaChart data={progress ?? []}>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="date"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									tickFormatter={(d: string) => format(new Date(d), "MMM d")}
								/>
								<ChartTooltip
									content={
										<ChartTooltipContent
											labelFormatter={(label) =>
												format(new Date(String(label)), "MMMM d, yyyy")
											}
										/>
									}
								/>
								<Area
									dataKey="episodesCompleted"
									fill="var(--chart-1)"
									fillOpacity={0.2}
									stroke="var(--chart-1)"
									strokeWidth={2}
									type="monotone"
								/>
								<Area
									dataKey="minutesWatched"
									fill="var(--chart-2)"
									fillOpacity={0.2}
									stroke="var(--chart-2)"
									strokeWidth={2}
									type="monotone"
								/>
							</AreaChart>
						</ChartContainer>
					)}
				</CardContent>
			</Card>

			<div className="grid gap-4 lg:grid-cols-2 grid-cols-1">
				<Card>
					<CardHeader>
						<CardTitle>Content Breakdown</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						{contentLoading ? (
							<>
								<Skeleton className="h-[200px] w-full" />
								<Skeleton className="h-[200px] w-full" />
							</>
						) : !content?.types?.length ? (
							<EmptyChart message="No titles in this date range." />
						) : (
							<>
								<ChartContainer
									config={{
										count: { label: "Count" },
									}}
									className="h-[200px] w-full"
								>
									<BarChart data={content?.types ?? []} layout="vertical">
										<CartesianGrid horizontal={false} />
										<XAxis type="number" hide />
										<YAxis
											dataKey="type"
											type="category"
											tickLine={true}
											axisLine={true}
										/>
										<ChartTooltip content={<ChartTooltipContent />} />
										<Bar
											dataKey="count"
											fill="var(--chart-1)"
											radius={[0, 4, 4, 0]}
										>
											<LabelList
												dataKey="count"
												position="insideRight"
												className="fill-background font-bold text-sm"
											/>
										</Bar>
									</BarChart>
								</ChartContainer>
								{content?.topGenres && content.topGenres.length > 0 && (
									<ChartContainer
										config={{
											count: { label: "Count" },
										}}
										className="h-[200px] w-full"
									>
										<BarChart
											data={content.topGenres.map((g) => ({
												name: getGenreName(g.genreId, "MOVIE"),
												count: g.count,
											}))}
											layout="vertical"
										>
											<CartesianGrid horizontal={false} />
											<XAxis type="number" hide />
											<YAxis
												dataKey="name"
												type="category"
												tickLine={false}
												axisLine={false}
												width={100}
											/>
											<ChartTooltip content={<ChartTooltipContent />} />
											<Bar
												dataKey="count"
												fill="var(--chart-2)"
												radius={[0, 4, 4, 0]}
											>
												<LabelList
													dataKey="count"
													position="insideRight"
													className="fill-foreground font-bold text-sm"
												/>
											</Bar>
										</BarChart>
									</ChartContainer>
								)}
							</>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Status Transitions</CardTitle>
					</CardHeader>
					<CardContent>
						{transitionsLoading ? (
							<Skeleton className="h-[400px] w-full" />
						) : (
							<ChartContainer
								config={{
									count: { label: "Count" },
								}}
								className="h-[400px] w-full"
							>
								<BarChart
									data={(transitions ?? []).map((t) => ({
										name: `${t.from} → ${t.to}`,
										count: t.count,
									}))}
									layout="vertical"
								>
									<CartesianGrid horizontal={false} />
									<XAxis type="number" hide />
									<YAxis
										dataKey="name"
										type="category"
										tickLine={false}
										axisLine={false}
										width={130}
									/>
									<ChartTooltip content={<ChartTooltipContent />} />
									<Bar
										dataKey="count"
										fill="var(--chart-3)"
										radius={[0, 4, 4, 0]}
									>
										<LabelList
											dataKey="count"
											position="insideRight"
											className="fill-foreground font-bold text-sm"
										/>
									</Bar>
								</BarChart>
							</ChartContainer>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
