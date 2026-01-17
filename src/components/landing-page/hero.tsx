import Link from "next/link";

import { HeroShowcase } from "@/components/landing-page/hero-showcase";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "lucide-react";

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
