import Link from "next/link";

import { Button } from "@/components/ui/button";
import { HivioIcon, HivioLogo } from "../icons";

export function LandingNavbar() {
  return (
    <div className="pointer-events-none sticky top-4 z-50 w-full px-4">
      <div className="mx-auto flex max-w-6xl">
        <div className="pointer-events-auto flex w-full items-center justify-between rounded-full border border-border/60 bg-background/80 px-3 py-2 shadow-lg shadow-black/5 ring-1 ring-border/40 backdrop-blur">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold transition-opacity hover:opacity-90"
          >
            <HivioLogo className="text-primary" />
            <HivioIcon className="text-primary" />
          </Link>
          <div className="flex items-center gap-1.5">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex rounded-full px-3 text-xs text-muted-foreground hover:text-foreground"
            >
              <Link href="#features">Features</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="rounded-full px-4 text-xs shadow-sm"
            >
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
