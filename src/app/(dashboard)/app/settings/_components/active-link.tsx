"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function ActiveLink({
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
					? "bg-muted text-primary hover:text-primary/80"
					: "text-muted-foreground hover:text-primary",
			)}
		>
			<span>{children}</span>
			<span>{name}</span>
		</Link>
	);
}
