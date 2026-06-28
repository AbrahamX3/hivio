"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Compass, HomeIcon, Library, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const AddHistoryDialog = dynamic(
	() =>
		import("@/app/dashboard/_components/user-actions/add-history-dialog").then(
			(mod) => ({
				default: mod.AddHistoryDialog,
			}),
		),
	{ ssr: false },
);

const icons: Record<string, React.ReactNode> = {
	dashboard: <HomeIcon className="size-4" />,
	history: <Library className="size-4" />,
	discover: <Compass className="size-4" />,
};

const labels: Record<string, string> = {
	dashboard: "Home",
	history: "History",
	discover: "Discover",
};

export function SiteHeader() {
	const pathname = usePathname();
	const parts = pathname.split("/").filter(Boolean);
	const queryClient = useQueryClient();
	const [isAddOpen, setIsAddOpen] = React.useState(false);

	return (
		<header className="bg-background/80 sticky top-0 z-10 flex h-(--header-height) shrink-0 items-center gap-2 border-b backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
			<div className="flex w-full items-center gap-4 px-4">
				<SidebarTrigger className="-ml-1" />
				<Separator orientation="vertical" />
				<Breadcrumb>
					<BreadcrumbList className="gap-2">
						{parts.length === 0 ||
						(parts.length === 1 && parts[0] === "dashboard") ? (
							<BreadcrumbPage className="flex items-center gap-2">
								{icons.dashboard}
								{labels.dashboard}
							</BreadcrumbPage>
						) : (
							<>
								<BreadcrumbItem>
									<BreadcrumbLink
										href="/dashboard"
										className="flex items-center gap-1.5"
									>
										{icons.dashboard}
										{labels.dashboard}
									</BreadcrumbLink>
								</BreadcrumbItem>
								{parts.slice(1).map((part, index) => {
									const icon = icons[part];
									const label =
										labels[part] ??
										part.charAt(0).toUpperCase() + part.slice(1);
									const href = "/" + parts.slice(0, index + 2).join("/");
									const isLast = index === parts.slice(1).length - 1;

									return (
										<React.Fragment key={part}>
											<BreadcrumbSeparator />
											<BreadcrumbItem>
												{isLast ? (
													<BreadcrumbPage className="flex items-center gap-1.5">
														{icon}
														{label}
													</BreadcrumbPage>
												) : (
													<BreadcrumbLink
														href={href}
														className="flex items-center gap-1.5"
														asChild
													>
														<Link href={href}>
															{icon}
															{label}
														</Link>
													</BreadcrumbLink>
												)}
											</BreadcrumbItem>
										</React.Fragment>
									);
								})}
							</>
						)}
					</BreadcrumbList>
				</Breadcrumb>
				<Button
					onClick={() => setIsAddOpen(true)}
					className="ml-auto shrink-0 h-7"
					size="sm"
				>
					<Plus className="mr-1.5 h-4 w-4" />
					Add Title
				</Button>
			</div>
			<AddHistoryDialog
				open={isAddOpen}
				onOpenChange={setIsAddOpen}
				onSuccess={() => {
					queryClient.invalidateQueries({ queryKey: ["history"] });
					queryClient.invalidateQueries({ queryKey: ["watching"] });
				}}
			/>
		</header>
	);
}
