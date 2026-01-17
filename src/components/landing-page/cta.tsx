import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CallToAction() {
  return (
    <section className="from-primary/10 via-primary/5 to-background border-t bg-linear-to-r py-14 sm:py-16">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 text-center">
        <p className="text-primary text-sm font-semibold tracking-widest uppercase">
          Ready to track smarter?
        </p>
        <h3 className="text-3xl font-semibold sm:text-4xl">
          Start logging your shows in minutes.
        </h3>
        <p className="text-muted-foreground max-w-2xl">
          Sign in and build your watch history, keep tabs on weekly episodes,
          and discover what to watch next—all in one calm dashboard.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg">
            <Link href="/auth/sign-in">Go to your dashboard</Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href="#features">See what’s included</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
