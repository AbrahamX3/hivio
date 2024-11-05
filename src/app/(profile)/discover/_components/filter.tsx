"use client";

import { ListIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	MultiSelector,
	MultiSelectorContent,
	MultiSelectorInput,
	MultiSelectorItem,
	MultiSelectorList,
	MultiSelectorTrigger,
} from "@/components/ui/multi-select";
import { genreOptions } from "@/lib/options";
import type { UserSession } from "@/types/auth";

import type { HiveProfiles } from "../actions";
import UserCard, { getGenreCounts } from "./user-card";

interface HiveProfileFilterProps {
	hive: HiveProfiles;
	currentUser: UserSession | null;
}

export default function HiveProfileFilter({
	hive,
	currentUser,
}: HiveProfileFilterProps) {
	const [data, setData] = useState<HiveProfiles>(hive);
	const [genres, setGenres] = useState<string[]>([]);
	const [sortBy, setSortBy] = useState<
		"most_followers" | "least_followers" | null
	>(null);

	function handleFilter(genres: string[]) {
		setGenres(genres);

		if (genres.length === 0) {
			setData(hive);
		} else {
			const results: number[] = [];

			for (const option of genreOptions) {
				const matchingLabel = genres.find((label) => label === option.label);
				if (matchingLabel) {
					results.push(option.value);
				}
			}

			setData(
				hive.filter((user) => {
					const topGenres = getGenreCounts(user.genres)
						.slice(0, 3)
						.map((item) => item.id);
					return results.some((id) => topGenres.includes(id));
				}),
			);
		}
	}

	function handleSort(sortBy: "most_followers" | "least_followers") {
		setSortBy(sortBy);
		setData(
			sortBy === "most_followers"
				? data.sort((a, b) => b.total_followers - a.total_followers)
				: data.sort((a, b) => a.total_followers - b.total_followers),
		);
	}

	function handleReset() {
		setGenres([]);
		setSortBy(null);
		setData(hive);
	}

	return (
		<>
			<div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
				<h1 className="text-2xl font-bold">Discover Hive Profiles</h1>
				<div className="flex flex-col items-center gap-2 sm:flex-row sm:flex-nowrap">
					<Button variant="outline" onClick={handleReset}>
						Reset
					</Button>
					<MultiSelector
						values={genres}
						onValuesChange={handleFilter}
						loop={true}
					>
						<MultiSelectorTrigger>
							<MultiSelectorInput
								aria-label="Filter by Genres"
								className="w-full"
								placeholder="Filter by Genres"
							/>
						</MultiSelectorTrigger>
						<MultiSelectorContent>
							<MultiSelectorList>
								{genreOptions.map((option, i) => (
									<MultiSelectorItem
										key={`${option.label}_${i + 1}`}
										value={option.label}
									>
										{option.label}
									</MultiSelectorItem>
								))}
							</MultiSelectorList>
						</MultiSelectorContent>
					</MultiSelector>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">
								<ListIcon className="mr-2 h-5 w-5" />
								{sortBy
									? `Sorted by ${
											sortBy === "most_followers" ? "Most" : "Least"
										} Followers`
									: "Sort by"}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-fit">
							<DropdownMenuLabel>Sort by</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => handleSort("most_followers")}>
								Most Followers
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => handleSort("least_followers")}>
								Least Followers
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
				{data.length > 0 ? (
					data?.map((user) => (
						<UserCard currentUser={currentUser} key={user.id} user={user} />
					))
				) : (
					<div className="col-span-4 flex w-full items-center justify-center rounded-md border bg-background p-4">
						<div className="text-sm text-gray-500 dark:text-gray-400">
							No profiles found
						</div>
					</div>
				)}
			</div>
		</>
	);
}
