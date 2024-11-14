"use client";

import { formatDate } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { env } from "@/env";

export function ProfileHeader({
	username = "unknown",
	avatar,
	name,
	joinedDate = new Date(),
}: {
	username: string | null;
	avatar: string | null;
	name: string | null;
	joinedDate?: Date | null;
}) {
	return (
		<div className="flex items-center gap-4">
			<Avatar className="h-16 w-16">
				{avatar && <AvatarImage alt={`@${username}`} src={avatar} />}
				<AvatarFallback className="uppercase">
					{username?.slice(0, 1)}
				</AvatarFallback>
			</Avatar>
			<div className="grid gap-1">
				<h1 className="text-2xl font-bold">{name}</h1>
				<h2 className="flex items-center gap-2 align-middle text-sm text-gray-500 dark:text-gray-400">
					<Button
						className="m-0 h-fit p-0 text-black dark:text-primary"
						variant="link"
						onClick={async () => {
							toast.promise(
								navigator.clipboard.writeText(
									`${env.NEXT_PUBLIC_BASE_URL}/profile/${username}`,
								),
								{
									loading: "Copying to clipboard...",
									success: "User profile link copied to clipboard!",
									error: "Failed to copy to clipboard",
								},
							);
						}}
					>
						@{username}
					</Button>
					<span className="h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400" />
					{joinedDate && (
						<>
							<span className="hidden sm:block">
								Joined {formatDate(joinedDate, "MMMM d, yyyy")}
							</span>

							<HoverCard>
								<HoverCardTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										className="block sm:hidden"
									>
										<CalendarIcon className="size-3" />
									</Button>
								</HoverCardTrigger>
								<HoverCardContent className="w-fit">
									Joined {formatDate(joinedDate, "MMMM d, yyyy")}
								</HoverCardContent>
							</HoverCard>
						</>
					)}
				</h2>
			</div>
		</div>
	);
}
