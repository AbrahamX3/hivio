import Link from "next/link";

import { HeroShowcase } from "@/components/landing-page/hero-showcase";
import { Button } from "@/components/ui/button";

const GithubIcon = ({ className }: { className?: string }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		className={className}
	>
		<path d="M12 .297c-6.63 0-12 5.373-12 12c0 5.303 3.438 9.8 8.205 11.385c.6.113.82-.258.82-.577c0-.285-.01-1.04-.015-2.04c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729c1.205.084 1.838 1.236 1.838 1.236c1.07 1.835 2.809 1.305 3.495.998c.108-.776.417-1.305.76-1.605c-2.665-.3-5.466-1.332-5.466-5.93c0-1.31.465-2.38 1.235-3.22c-.135-.303-.54-1.523.105-3.176c0 0 1.005-.322 3.3 1.23c.96-.267 1.98-.399 3-.405c1.02.006 2.04.138 3 .405c2.28-1.552 3.285-1.23 3.285-1.23c.645 1.653.24 2.873.12 3.176c.765.84 1.23 1.91 1.23 3.22c0 4.61-2.805 5.625-5.475 5.92c.42.36.81 1.096.81 2.22c0 1.606-.015 2.896-.015 3.286c0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
	</svg>
);

export function Hero() {
	return (
		<section className="from-background via-background to-muted/60 relative bg-linear-to-b">
			<div className="mx-auto mt-16 flex max-w-6xl flex-col gap-10 px-4 py-14 lg:flex-row lg:items-center lg:py-20">
				<div className="flex-1 space-y-6">
					<div className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium">
						<a
							target="_blank"
							className="text-muted-foreground hover:text-foreground flex items-center gap-1 font-bold transition-colors"
							href="https://github.com/AbrahamX3/hivio"
						>
							<GithubIcon className="size-3" /> <span>Open Source</span>
						</a>
						<span>•</span>
						<span>Minimal tracker for Movies & Series</span>
					</div>
					<h1 className="text-4xl leading-tight font-semibold tracking-tight sm:text-5xl lg:text-6xl">
						Keep up with every episode you watch without the clutter.
					</h1>
					<p className="text-muted-foreground max-w-2xl text-lg">
						Log what you&apos;re watching, pick up where you left off, and see
						what&apos;s coming next. Built for people who juggle multiple shows
						and want a calm space to track them.
					</p>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
						<Button asChild size="lg">
							<Link href="/auth/sign-in">Start tracking for free</Link>
						</Button>
						<Button asChild variant="outline" size="lg">
							<Link href="#features">Explore the dashboard</Link>
						</Button>
					</div>
				</div>
				<div className="flex-1">
					<HeroShowcase />
				</div>
			</div>
			<div className="to-background pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-b from-transparent" />
		</section>
	);
}
