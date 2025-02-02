"use client";

import {
	ChevronsUpDown,
	CogIcon,
	LaptopIcon,
	LogInIcon,
	MoonIcon,
	SunIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import type { UserSession } from "@/types/auth";
import { useTheme } from "next-themes";
import Link from "next/link";

interface NavUserProps {
	user: UserSession;
	signOutUrl: string;
}
export function NavUser({ user, signOutUrl }: NavUserProps) {
	const { isMobile } = useSidebar();
	const { name, avatar, username } = user;
	const { setTheme } = useTheme();

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								{avatar && <AvatarImage alt={`@${username}`} src={avatar} />}
								<AvatarFallback className="rounded-lg">
									{name?.slice(0, 1)}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{user.username}</span>
								<span className="truncate text-xs">{user.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									{avatar && <AvatarImage alt={`@${username}`} src={avatar} />}
									<AvatarFallback className="rounded-lg">
										{name?.slice(0, 1)}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										{user.username}
									</span>
									<span className="truncate text-xs">{user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem asChild>
								<Link
									className="flex items-center justify-between gap-2"
									href="/app/settings"
								>
									Settings <CogIcon className="ml-2 size-4" />
								</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>
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
							<Link prefetch={false} href={signOutUrl}>
								Sign Out <LogInIcon className="ml-2 size-4" />
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
