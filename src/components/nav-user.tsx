"use client";

import {
	Check,
	ChevronsUpDown,
	LogOut,
	MonitorIcon,
	MoonIcon,
	Settings,
	SunIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { SettingsDialog } from "@/components/settings-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { getAvatarUrl } from "@/lib/utils";

export function NavUser() {
	const { isMobile } = useSidebar();
	const { data: session } = authClient.useSession();
	const router = useRouter();
	const [settingsOpen, setSettingsOpen] = useState(false);
	const { theme, setTheme } = useTheme();

	const user = session?.user;
	const avatarUrl = getAvatarUrl(user?.image);

	if (!user) return null;

	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/auth/sign-in");
				},
			},
		});
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							variant="outline"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage src={avatarUrl ?? undefined} alt={user.name} />
								<AvatarFallback className="rounded-lg">
									{user.name.charAt(0)}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{user.name}</span>
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
									<AvatarImage src={avatarUrl ?? undefined} alt={user.name} />
									<AvatarFallback className="rounded-lg">
										{user.name.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">{user.name}</span>
									<span className="truncate text-xs">{user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>
								{theme === "system" && <MonitorIcon className="size-4" />}
								{theme === "light" && <SunIcon className="size-4" />}
								{theme === "dark" && <MoonIcon className="size-4" />}
								<span>Theme</span>
							</DropdownMenuSubTrigger>
							<DropdownMenuSubContent>
								<DropdownMenuItem onClick={() => setTheme("system")}>
									<MonitorIcon className="size-4" />
									System
									{theme === "system" && <Check className="ml-auto size-4" />}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setTheme("light")}>
									<SunIcon className="size-4" />
									Light
									{theme === "light" && <Check className="ml-auto size-4" />}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setTheme("dark")}>
									<MoonIcon className="size-4" />
									Dark
									{theme === "dark" && <Check className="ml-auto size-4" />}
								</DropdownMenuItem>
							</DropdownMenuSubContent>
						</DropdownMenuSub>
						<DropdownMenuItem onClick={() => setSettingsOpen(true)}>
							<Settings className="size-4" />
							Settings
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="text-destructive hover:bg-destructive/80 hover:text-destructive-foreground/80 focus:bg-destructive/80 focus:text-destructive-foreground/80"
							onClick={handleSignOut}
						>
							<LogOut className="size-4" />
							Sign Out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
			<SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
		</SidebarMenu>
	);
}
