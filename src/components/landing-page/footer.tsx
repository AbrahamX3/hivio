import Link from "next/link";

import { HivioLogo, TMDBIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="max-w-md space-y-4">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 font-semibold transition-opacity hover:opacity-90"
            >
              <HivioLogo className="text-primary" />
            </Link>
            <p className="text-muted-foreground text-sm">
              Keep up with every episode you watch without the clutter. Track
              movies and series with a calm, minimal interface.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
            >
              <Link href="#features">Features</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
            >
              <Link href="/auth/sign-in">Sign In</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
            >
              <Link href="/privacy-policy">Privacy</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
            >
              <Link href="/terms-of-service">Terms</Link>
            </Button>
          </div>

          <div className="border-border/50 flex w-full max-w-md flex-col items-center gap-4 border-t pt-4">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-xs tracking-widest uppercase">
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
              © {new Date().getFullYear()} Hivio. Open source media tracker.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
