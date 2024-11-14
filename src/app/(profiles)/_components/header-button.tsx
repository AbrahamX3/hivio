"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserSession } from "@/types/auth";

export default function HeaderButton({ user }: { user: UserSession | null }) {
	const path = usePathname();
	const isInDiscoverPage = path.includes("/discover");

	return isInDiscoverPage ? (
		user && (
			<Link
				className={cn(
					buttonVariants({
						variant: "secondary",
						size: "sm",
					}),
					"text-sm font-medium",
				)}
				href={`/profile/${user?.username}`}
			>
				My Profile
			</Link>
		)
	) : (
		<Link
			className={cn(
				buttonVariants({
					variant: "secondary",
					size: "sm",
				}),
				"text-sm font-medium",
			)}
			href="/discover"
		>
			Discover
		</Link>
	);
}
