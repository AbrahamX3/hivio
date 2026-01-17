"use client";

import Link from "next/link";
import { useTransition } from "react";

import { HivioLogo } from "@/components/icons";
import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";

export default function SignInForm() {
  const [isPending, startTransition] = useTransition();

  const signIn = () => {
    startTransition(async () => {
      try {
        await authClient.signIn.social({
          provider: "discord",
          callbackURL: "/dashboard",
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error("Sign in error:", error.message);
        }
      }
    });
  };

  return (
    <main className="bg-background text-foreground flex min-h-screen flex-col">
      <div className="pointer-events-none sticky top-4 z-50 w-full px-4">
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

      <section className="flex flex-1 items-center justify-center px-4 py-14 sm:py-16">
        <div className="mx-auto flex max-w-md flex-col items-center gap-8 text-center">
          <div className="space-y-4">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase">
              Welcome back
            </p>
            <h1 className="text-3xl font-semibold sm:text-4xl">
              Sign in to your account
            </h1>
            <p className="text-muted-foreground max-w-sm">
              Access your personal dashboard, track your favorite shows, and
              never lose your place again.
            </p>
          </div>

          <div className="w-full space-y-4">
            <Button
              onClick={signIn}
              disabled={isPending}
              size="lg"
              className="w-full bg-[#5865F2] text-white shadow-sm hover:bg-[#4752C4]"
            >
              {isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  Continue with Discord
                </div>
              )}
            </Button>

            <p className="text-muted-foreground text-xs">
              By signing in, you agree to our{" "}
              <Link
                href="/terms-of-service"
                className="underline hover:no-underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                className="underline hover:no-underline"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
