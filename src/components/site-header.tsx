"use client"

import {
	Compass,
	HomeIcon,
	Library,
} from "lucide-react"
import { usePathname } from "next/navigation"
import * as React from "react"

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const icons: Record<string, React.ReactNode> = {
	dashboard: <HomeIcon className="size-4" />,
	history: <Library className="size-4" />,
	discover: <Compass className="size-4" />,
}

const labels: Record<string, string> = {
	dashboard: "Home",
	history: "History",
	discover: "Discover",
}

export function SiteHeader() {
	const pathname = usePathname()
	const parts = pathname.split("/").filter(Boolean)

	return (
		<header className="sticky top-0 z-10 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
			<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
				<SidebarTrigger className="-ml-1" />
				<Separator
					orientation="vertical"
					className="mx-2 data-[orientation=vertical]:h-4"
				/>
				<Breadcrumb>
					<BreadcrumbList className="gap-2">
						{parts.length === 0 || (parts.length === 1 && parts[0] === "dashboard") ? (
							<BreadcrumbPage className="flex items-center gap-2">
								{icons.dashboard}
								{labels.dashboard}
							</BreadcrumbPage>
						) : (
							<>
								<BreadcrumbItem>
									<BreadcrumbLink href="/dashboard" className="flex items-center gap-1.5">
										{icons.dashboard}
										{labels.dashboard}
									</BreadcrumbLink>
								</BreadcrumbItem>
								{parts.slice(1).map((part, index) => {
									const icon = icons[part]
									const label = labels[part] ?? part.charAt(0).toUpperCase() + part.slice(1)
									const href = "/" + parts.slice(0, index + 2).join("/")
									const isLast = index === parts.slice(1).length - 1

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
													<BreadcrumbLink href={href} className="flex items-center gap-1.5">
														{icon}
														{label}
													</BreadcrumbLink>
												)}
											</BreadcrumbItem>
										</React.Fragment>
									)
								})}
							</>
						)}
					</BreadcrumbList>
				</Breadcrumb>
			</div>
		</header>
	)
}
