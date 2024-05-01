import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isUserSignedIn } from "@/lib/auth";
import { Link } from "next-view-transitions";
import { SVGProps } from "react";

export default async function Component() {
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
      <main className="flex-1 pt-14 bg-primary">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl text-secondary md:text-5xl lg:text-6xl/none">
                  Your watchlist, amplified with Hivio
                </h1>
                <p className="mx-auto max-w-[700px] md:text-xl text-secondary">
                  Add and organize your favorite shows and movies, and discover
                  new content through like-minded users.
                </p>
              </div>
              <div className="space-x-4">
                {isSignedIn ? (
                  <Button asChild variant="outline">
                    <Link href="/dashboard">Get Started</Link>
                  </Button>
                ) : (
                  <Button size="lg" asChild variant="outline">
                    <Link href="/auth/signin">Get Started</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container space-y-12 px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge>Features</Badge>
                <h2 className="text-3xl text-balance font-bold tracking-tighter sm:text-5xl">
                  Everything you need to build your app
                </h2>
                <p className="text-balance text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Acme provides a comprehensive set of tools and services to
                  help you build, deploy, and scale your web applications.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-sm items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
              <div className="grid gap-1">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <RocketIcon className="h-6 w-6 text-gray-900 dark:text-gray-50" />
                      <h3 className="text-lg font-bold">Rapid Development</h3>
                    </div>
                  </CardHeader>
                  <CardContent>
                    Acmes intuitive tools and pre-built components help you
                    build and ship features faster.
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-1">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <BoldIcon className="h-6 w-6 text-gray-900 dark:text-gray-50" />
                      <h3 className="text-lg font-bold">
                        Scalable Infrastructure
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent>
                    Acmes serverless infrastructure scales automatically to
                    handle your apps traffic.
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-1">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <ShieldCheckIcon className="h-6 w-6 text-gray-900 dark:text-gray-50" />
                      <h3 className="text-lg font-bold">Secure by Design</h3>
                    </div>
                  </CardHeader>
                  <CardContent>
                    Acmes security features keep your app and your users data
                    safe.
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary">
          <div className="container px-4 md:px-6">
            <div className="mx-auto w-full max-w-sm space-y-2">
              <div className="space-y-3">
                <h2 className="text-3xl text-secondary font-bold tracking-tighter md:text-4xl/tight">
                  Get started with Acme
                </h2>
                <p className="text-balance text-secondary md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Sign up to get started with Acme and build your dream app.
                </p>
              </div>
              <form className="flex space-x-2">
                <Input
                  className="max-w-lg flex-1"
                  placeholder="Name"
                  type="text"
                />
                <Input
                  className="max-w-lg flex-1"
                  placeholder="Email"
                  type="email"
                />
                <Button type="submit">Get Started</Button>
              </form>
            </div>
          </div>
        </section>
      </main>
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

function BoldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 12a4 4 0 0 0 0-8H6v8" />
      <path d="M15 20a4 4 0 0 0 0-8H6v8Z" />
    </svg>
  );
}

function MountainIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}

function RocketIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function ShieldCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
