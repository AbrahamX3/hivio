"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

import { HivioLogo } from "../icons";

export function LandingNavbar() {
	const { data: session, isPending } = authClient.useSession();

	return (
		<div className="fixed top-4 right-0 left-0 z-50 w-full px-4">
			<div className="mx-auto w-full max-w-6xl">
				<div className="border-border/60 bg-background/80 ring-border/40 ring-primary/5 flex w-full items-center justify-between rounded-full border px-3 py-2 shadow-lg ring-1 backdrop-blur-2xl">
					<Link
						href="/"
						className="flex items-center gap-2 font-semibold transition-spring hover:opacity-90"
					>
						<HivioLogo className="text-primary" />
					</Link>
					<div className="flex items-center gap-1.5">
						<Button
							asChild
							variant="ghost"
							size="sm"
							className="text-muted-foreground hover:text-foreground hidden rounded-full px-3 text-xs sm:inline-flex"
						>
							<Link href="#features">Features</Link>
						</Button>
						{isPending ? (
							<Button
								asChild
								size="sm"
								className="rounded-full px-4 text-xs shadow-sm"
							>
								<Link href="/dashboard">Dashboard</Link>
							</Button>
						) : session ? (
							<Button
								asChild
								size="sm"
								className="rounded-full px-4 text-xs shadow-sm"
							>
								<Link href="/dashboard">Dashboard</Link>
							</Button>
						) : (
							<Button
								asChild
								size="sm"
								className="rounded-full px-4 text-xs shadow-sm"
							>
								<Link href="/auth/sign-in">Sign in</Link>
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
