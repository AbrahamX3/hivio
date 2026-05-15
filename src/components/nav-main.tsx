"use client";

import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavMainProps {
	items: {
		title: string;
		url: string;
		icon: LucideIcon;
		items?: {
			title: string;
			url: string;
		}[];
	}[];
}

export function NavMain({ items }: NavMainProps) {
	const pathname = usePathname();

	return (
		<SidebarGroup>
			<SidebarGroupContent>
				<SidebarMenu className="flex flex-col gap-1">
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								tooltip={item.title}
								asChild
								isActive={pathname === item.url}
							>
								<Link href={item.url}>
									<item.icon className="hover:scale-3d" />
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
