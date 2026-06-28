import Link from "next/link";

import { HivioLogo, TMDBIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

export function Footer() {
	return (
		<footer className="bg-muted/20 from-border/30 to-transparent border-t bg-linear-to-r">
			<div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
				<div className="flex flex-col items-center gap-8 text-center">
					<div className="max-w-md space-y-4">
						<Link
							href="/"
							className="flex items-center justify-center gap-2 font-semibold transition-spring hover:opacity-90"
						>
							<HivioLogo className="text-primary" />
						</Link>
						<p className="text-muted-foreground text-sm leading-relaxed">
							Keep up with every episode you watch without the clutter. Track
							movies and series with a calm, minimal interface.
						</p>
					</div>

					<div className="flex flex-wrap justify-center gap-8">
						<Link
							href="/auth/sign-in"
							className="text-foreground hover:text-primary text-sm transition-spring"
						>
							Sign In
						</Link>
						<Link
							href="#features"
							className="text-foreground hover:text-primary text-sm transition-spring"
						>
							Features
						</Link>
						<Link
							href="/privacy-policy"
							className="text-foreground hover:text-primary text-sm transition-spring"
						>
							Privacy
						</Link>
						<Link
							href="/terms-of-service"
							className="text-foreground hover:text-primary text-sm transition-spring"
						>
							Terms
						</Link>
					</div>

					<div className="border-border/50 flex w-full max-w-md flex-col items-center gap-4 border-t pt-4">
						<div className="flex items-center gap-1">
							<span className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
								Powered By
							</span>
							<Button
								variant="ghost"
								size="sm"
								className="h-6 px-2 text-xs [&_svg]:size-12"
							>
								<a target="_blank" href="https://www.themoviedb.org/">
									<TMDBIcon className="size-12" />
								</a>
							</Button>
						</div>

						<p className="text-muted-foreground text-sm">
							&copy; {new Date().getFullYear()} Hivio. Open source media
							tracker.
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
