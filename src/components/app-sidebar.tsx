"use client";

import type * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	useSidebar,
} from "@/components/ui/sidebar";
import type { UserSession } from "@/types/auth";
import Link from "next/link";
import LogoFull, { LogoIcon } from "./icons";

interface AppSidebarProps {
	user: UserSession;
	signOutUrl: string;
}

export function AppSidebar({
	user,
	signOutUrl,
	...props
}: React.ComponentProps<typeof Sidebar> & AppSidebarProps) {
	const { state } = useSidebar();
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" variant="default" asChild>
							<Link href="/hive">
								{state === "expanded" ? (
									<div className="flex items-center justify-center text-center align-middle">
										<LogoFull className="h-6 w-auto text-primary" />
									</div>
								) : (
									<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-background text-sidebar-primary-foreground">
										<LogoIcon className="h-5 w-auto text-primary" />
									</div>
								)}
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain username={user.username} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} signOutUrl={signOutUrl} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
