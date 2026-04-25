import Link from "next/link";
import type { ReactNode } from "react";

import { HivioLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";

interface LegalPageLayoutProps {
	title: string;
	children: ReactNode;
}

export function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
	return (
		<main className="bg-background text-foreground flex min-h-screen flex-col">
			<div className="pointer-events-none fixed top-4 z-50 w-full px-4">
				<div className="mx-auto flex max-w-6xl">
					<div className="border-border/60 bg-background/80 ring-border/40 pointer-events-auto flex w-full items-center justify-between rounded-full border px-3 py-2 shadow-lg ring-1 shadow-black/5 backdrop-blur">
						<Link
							href="/"
							className="flex items-center gap-2 font-semibold transition-opacity hover:opacity-90"
						>
							<HivioLogo className="text-primary" />
						</Link>
						<Button
							asChild
							variant="ghost"
							size="sm"
							className="text-muted-foreground hover:text-foreground hidden rounded-full px-3 text-xs sm:inline-flex"
						>
							<Link href="/">← Back to home</Link>
						</Button>
					</div>
				</div>
			</div>

			<section className="px-4 py-14 sm:py-16">
				<div className="mx-auto max-w-4xl">
					<div className="mb-8 text-center">
						<p className="text-primary text-sm font-semibold tracking-widest uppercase">
							Legal
						</p>
						<h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{title}</h1>
						<p className="text-muted-foreground mt-4">
							Last updated:{" "}
							{new Date().toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</p>
					</div>

					<div className="text-muted-foreground space-y-8">{children}</div>
				</div>
			</section>
		</main>
	);
}
