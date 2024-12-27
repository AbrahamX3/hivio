"use client";

import { CogIcon, UserIcon, UserSearchIcon } from "lucide-react";

import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { LogoIcon } from "./icons";

export function NavMain({
	username,
}: {
	username: string | null;
}) {
	const items = [
		{
			title: "My Hive",
			url: "/hive",
			icon: LogoIcon,
			isActive: true,
		},
		{
			title: "My Profile",
			url: `/profile/${username}`,
			icon: UserIcon,
		},
		{
			title: "Discover Profiles",
			url: "/discover",
			icon: UserSearchIcon,
		},
		{
			title: "Settings",
			url: "/hive/settings",
			icon: CogIcon,
		},
	];

	return (
		<SidebarGroup>
			<SidebarMenu>
				{items.map((item) => (
					<SidebarMenuItem key={item.title}>
						<SidebarMenuButton tooltip={item.title} asChild>
							<Link href={item.url}>
								{item.icon && <item.icon />}
								<span>{item.title}</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
