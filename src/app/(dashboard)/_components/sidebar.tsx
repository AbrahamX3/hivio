"use client";

import { SettingsIcon, UserIcon, UserRoundSearchIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import LogoFull, { LogoIcon } from "@/components/icons";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { UserSession } from "@/types/auth";

import AddTitleToHive from "../hive/_components/add-title/add-to-hive";

interface Props {
	user: UserSession | null;
}

export default function DashboardSiderbar({ user }: Props) {
	return (
		<div className="hidden h-full w-full border-r bg-muted/40 md:block">
			<div className="flex h-full max-h-screen flex-col gap-2">
				<div className="flex h-14 items-center border-b px-4 lg:px-6">
					<Link href="/" className="flex items-center gap-2 font-semibold">
						<LogoFull className="h-7 w-auto text-primary" />
					</Link>
				</div>
				<div className="flex-1">
					<nav className="grid items-start gap-2 px-2 text-sm font-medium lg:px-4">
						<SidebarLink name="My Hive" href="/hive">
							<LogoIcon className="size-4" />
						</SidebarLink>
						{user?.username && (
							<SidebarLink name="My Profile" href={`/profile/${user.username}`}>
								<UserIcon className="size-4" />
							</SidebarLink>
						)}
						<SidebarLink name="Discover Profiles" href="/discover">
							<UserRoundSearchIcon className="size-4" />
						</SidebarLink>
						<SidebarLink name="Settings" href="/hive/settings">
							<SettingsIcon className="size-4" />
						</SidebarLink>
					</nav>
				</div>
				{user?.username && (
					<div className="mt-auto p-4">
						<Card>
							<CardHeader className="p-2 pt-0 md:p-4">
								<CardTitle className="text-lg">Add To Hive</CardTitle>
								<CardDescription>
									Start adding your movies and series to your hive.
								</CardDescription>
							</CardHeader>
							<CardContent className="p-2 pt-0 md:p-4 md:pt-0">
								<AddTitleToHive className="w-full px-4" user={user} />
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
}

function SidebarLink({
	href,
	name,
	children,
}: {
	href: string;
	name: string;
	children: React.ReactNode;
}) {
	const path = usePathname();

	const isActive = path === href;

	return (
		<Link
			href={href}
			className={cn(
				"flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
				isActive
					? "bg-muted text-primary"
					: "text-muted-foreground hover:text-primary",
			)}
		>
			{children}
			<span>{name}</span>
		</Link>
	);
}
