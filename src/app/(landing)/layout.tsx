import { Link } from "next-view-transitions";

import LogoFull from "@/components/icons";
import { Button } from "@/components/ui/button";
import { isUserSignedIn } from "@/lib/auth";

export default async function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isSignedIn = await isUserSignedIn();

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="fixed flex h-14 w-full items-center px-4 backdrop-blur supports-[backdrop-filter]:bg-primary/60 lg:px-6">
        <Link className="flex items-center justify-center" href="#">
          <LogoFull />
        </Link>
        <nav className="ml-auto flex items-center gap-4 align-middle sm:gap-6">
          <Link
            className="text-sm font-medium underline-offset-4 hover:underline"
            href="#"
          >
            Features
          </Link>
          <Link
            className="text-sm font-medium underline-offset-4 hover:underline"
            href="#"
          >
            About
          </Link>
          <Link
            className="text-sm font-medium underline-offset-4 hover:underline"
            href="#"
          >
            Contact
          </Link>
          <Button variant="secondary" asChild>
            {isSignedIn ? (
              <Link href="/dashboard">Dashboard</Link>
            ) : (
              <Link href="/auth/signin">Sign In</Link>
            )}
          </Button>
        </nav>
      </header>
      {children}
      <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 Acme Inc. All rights reserved.
        </p>
        <nav className="flex gap-4 sm:ml-auto sm:gap-6">
          <Link className="text-xs underline-offset-4 hover:underline" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs underline-offset-4 hover:underline" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
