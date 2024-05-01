import { Button } from "@/components/ui/button";
import { isUserSignedIn } from "@/lib/auth";
import { Link } from "next-view-transitions";

export default async function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isSignedIn = await isUserSignedIn();

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="px-4 lg:px-6 h-14 flex items-center fixed w-full backdrop-blur supports-[backdrop-filter]:bg-primary/60">
        <Link className="flex items-center justify-center" href="#">
          <p className="text-2xl font-bold">Hivio</p>
        </Link>
        <nav className="ml-auto flex gap-4 items-center align-middle sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            Features
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            About
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
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
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 Acme Inc. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
