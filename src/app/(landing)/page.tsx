import { CircleUserIcon, RocketIcon, TelescopeIcon } from "lucide-react";
import { Link } from "next-view-transitions";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { isUserSignedIn } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Home",
};

export default async function Component() {
  const isSignedIn = await isUserSignedIn();
  return (
    <main className="flex-1 bg-primary pt-14">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2 text-secondary-foreground dark:text-secondary">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Your watchlist, amplified with Hivio
              </h1>
              <p className="mx-auto max-w-[700px] md:text-xl">
                Manage your favorite shows and movies, and discover new content
                with the help of the Hivio community.
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg" variant="outline">
                {isSignedIn ? (
                  <Link href="/hive">Get Started</Link>
                ) : (
                  <Link href="/auth/signin">Get Started</Link>
                )}
              </Button>
              <Link
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                )}
                href="/discover"
              >
                Discover Profiles
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section
        id="features"
        className="w-full bg-background py-12 md:py-24 lg:py-32"
      >
        <div className="container space-y-12 px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <Badge>Features</Badge>
              <h2 className="text-balance pt-2 text-3xl font-bold tracking-tighter sm:text-5xl">
                The Hivio Experience
              </h2>
              <p className="text-balance text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Curate your watchlist, discover new titles, and engage with the
                Hivio community
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-sm items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
            <div className="grid gap-1">
              <Card className="min-h-[200px] border border-dashed border-primary">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <RocketIcon className="size-6 text-primary" />
                    <h3 className="text-xl font-bold">Simple & Intuitive</h3>
                  </div>
                </CardHeader>
                <CardContent className="text-pretty leading-snug tracking-tight">
                  Streamline your viewing experience with Hivio&apos;s intuitive
                  interface. Easily find, add and manage your favorite titles!
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-1">
              <Card className="min-h-[200px] border border-dashed border-primary">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CircleUserIcon className="size-6 text-primary" />
                    <h3 className="text-xl font-bold">Public Profile</h3>
                  </div>
                </CardHeader>
                <CardContent className="text-pretty leading-snug tracking-tight">
                  Showcase your viewing history and engage with the Hivio
                  community with your own public profile.
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-1">
              <Card className="min-h-[200px] border border-dashed border-primary">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TelescopeIcon className="size-6 text-primary" />
                    <h3 className="text-xl font-bold">Discover</h3>
                  </div>
                </CardHeader>
                <CardContent className="text-pretty leading-snug tracking-tight">
                  Get personalized recommendations for new shows and movies
                  based on your viewing habits and interests.
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
