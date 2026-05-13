"use client";

import { BarChart3, Compass, HomeIcon, Library } from "lucide-react";
import Link from "next/link";

import { HivioIcon } from "@/components/icons";
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
} from "@/components/ui/sidebar";

const data = {
	navMain: [
		{
			title: "Home",
			url: "/dashboard",
			icon: HomeIcon,
		},
		{
			title: "History",
			url: "/dashboard/history",
			icon: Library,
		},
		{
			title: "Discover",
			url: "/dashboard/discover",
			icon: Compass,
		},
		{
			title: "Analytics",
			url: "/dashboard/analytics",
			icon: BarChart3,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader className="h-(--header-height) shrink-0 justify-center border-b">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:p-1.5! text-primary hover:text-primary/90"
						>
							<Link href="/dashboard">
								<HivioIcon className="size-5!" />
								<span className="text-base font-semibold">Hivio</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
