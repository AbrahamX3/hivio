"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MenuIcon,
  SettingsIcon,
  UserIcon,
  UserRoundSearchIcon,
} from "lucide-react";

import LogoFull from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { type UserSession } from "@/types/auth";

import AddTitleToHive from "../hive/_components/add-title/add-to-hive";

interface Props {
  user: UserSession | null;
}

export default function MobileNavbar({ user }: Props) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <MenuIcon className="size-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <nav className="grid gap-2 text-lg font-medium">
          <Link href="/" className="mb-4 flex items-center gap-2 font-semibold">
            <LogoFull className="h-7 w-auto text-primary" />
          </Link>
          <ActiveLink name="My Hive" href="/hive">
            <Home className="size-5" />
          </ActiveLink>
          {user?.username && (
            <ActiveLink name="My Profile" href={`/profile/${user?.username}`}>
              <UserIcon className="size-5" />
            </ActiveLink>
          )}
          <ActiveLink name="Discover Profiles" href="/discover">
            <UserRoundSearchIcon className="size-5" />
          </ActiveLink>
          <ActiveLink name="Settings" href="/hive/settings">
            <SettingsIcon className="size-5" />
          </ActiveLink>
        </nav>
        {user?.username && (
          <div className="mt-auto">
            <Card>
              <CardHeader className="p-2">
                <CardTitle className="text-lg">Add To Hive</CardTitle>
                <CardDescription>
                  Start adding your movies and series to your hive.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2">
                <AddTitleToHive className="w-full px-4" user={user} />
              </CardContent>
            </Card>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ActiveLink({
  href,
  name,
  children,
}: {
  href: string;
  name: string;
  children: React.ReactNode;
}) {
  const path = usePathname();

  const isActive = path === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
        isActive
          ? "bg-muted text-primary hover:text-primary/80"
          : "text-muted-foreground hover:text-primary",
      )}
    >
      <span>{children}</span>
      <span>{name}</span>
    </Link>
  );
}
