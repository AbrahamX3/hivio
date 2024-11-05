"use client";

import {
	CogIcon,
	LaptopIcon,
	LogInIcon,
	MoonIcon,
	SunIcon,
	UserIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Link } from "next-view-transitions";
import NextLink from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserSession } from "@/types/auth";

import { LogoIcon } from "./icons";

interface AvatarDropDownProps {
	user: UserSession;
	signOutUrl: string;
}
export default function DashboardAvatar({
	user,
	signOutUrl,
}: AvatarDropDownProps) {
	const { name, avatar, username } = user;
	const { setTheme } = useTheme();
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="overflow-hidden rounded-full"
				>
					<Avatar>
						{avatar && <AvatarImage alt={`@${username}`} src={avatar} />}
						<AvatarFallback className="uppercase">
							{name?.slice(0, 1)}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link
						className="flex items-center justify-between gap-2"
						href="/hive"
					>
						My Hive <LogoIcon className="ml-2 size-4" />
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link
						className="flex items-center justify-between gap-2"
						href={`/profile/${user.username}`}
					>
						My Profile <UserIcon className="ml-2 size-4" />
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link
						className="flex items-center justify-between gap-2"
						href="/hive/settings"
					>
						Settings <CogIcon className="ml-2 size-4" />
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuItem onClick={() => setTheme("light")}>
							Light <SunIcon className="ml-2 size-4" />
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setTheme("dark")}>
							Dark <MoonIcon className="ml-2 size-4" />
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setTheme("system")}>
							System <LaptopIcon className="ml-2 size-4" />
						</DropdownMenuItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					asChild
					className="flex items-center justify-between gap-2"
				>
					<NextLink prefetch={false} href={signOutUrl}>
						Sign Out <LogInIcon className="ml-2 size-4" />
					</NextLink>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
