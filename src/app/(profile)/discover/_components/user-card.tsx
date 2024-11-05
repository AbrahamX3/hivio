"use client";

import { UsersIcon } from "lucide-react";
import { Link } from "next-view-transitions";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { genreOptions } from "@/lib/options";
import type { UserSession } from "@/types/auth";

import type { HiveProfiles } from "../actions";

interface UserCardProps {
	user: HiveProfiles[0];
	currentUser: UserSession | null;
}

export function getGenreCounts(genres: HiveProfiles[0]["genres"]) {
	const counts = new Map<number, number>();

	for (const item of genres) {
		const genres = item.title.genres;

		for (const genre of genres) {
			counts.set(genre, (counts.get(genre) ?? 0) + 1);
		}
	}

	const result = Array.from(counts, ([key, value]) => ({
		id: key,
		count: value,
	}));

	result.sort((a, b) => b.count - a.count);

	const resultWithLabels = result.map((item) => {
		const genreOption = genreOptions.find((option) => option.value === item.id);
		return { ...item, label: genreOption ? genreOption.label : "" };
	});

	return resultWithLabels;
}

export default function UserCard({ user }: UserCardProps) {
	const { username, avatar, name, total_followers, genres } = user;

	const topGenres = getGenreCounts(genres).slice(0, 3);

	return (
		<Card className="group p-4">
			<Link prefetch={false} className="block" href={`/profile/${username}`}>
				<div className="flex items-center gap-4">
					<Avatar className="size-12">
						{avatar && <AvatarImage alt={`@${username}`} src={avatar} />}
						<AvatarFallback className="uppercase">
							{username?.slice(0, 1)}
						</AvatarFallback>
					</Avatar>
					<div>
						<h2 className="text-lg font-semibold group-hover:underline group-hover:underline-offset-4">
							@{username}
						</h2>
						<p className="text-gray-500 dark:text-gray-400">{name}</p>
					</div>
				</div>
				<TooltipProvider>
					<div className="mt-4 flex items-center gap-2">
						<Badge className="flex items-center gap-2 align-middle text-xs">
							{total_followers}
							<UsersIcon className="size-4" />
						</Badge>
						{topGenres.map((item) => (
							<Tooltip key={item.id}>
								<TooltipTrigger>
									<Badge variant="secondary" className="line-clamp-1">
										{item.label}
									</Badge>
								</TooltipTrigger>
								<TooltipContent>
									<p className="text-xs">{item.label}</p>
								</TooltipContent>
							</Tooltip>
						))}
					</div>
				</TooltipProvider>
			</Link>
		</Card>
	);
}
