"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PanelLeft, SettingsIcon, UserIcon } from "lucide-react";

import { LogoIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface Props {
  username: string | null;
}
export default function MobileNavbar({ username }: Props) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="size-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href="/"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
          >
            <LogoIcon className="size-6 transition-all group-hover:scale-110" />
            <span className="sr-only">Hivio</span>
          </Link>
          <ActiveLink name="Hive" href="/hive">
            <Home className="size-5" />
          </ActiveLink>
          {username && (
            <ActiveLink name="My Profile" href={`/profile/${username}`}>
              <UserIcon className="size-5" />
            </ActiveLink>
          )}
          <ActiveLink name="Settings" href="/hive/settings">
            <SettingsIcon className="size-5" />
          </ActiveLink>
        </nav>
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
        "flex flex-row items-center gap-4 px-2.5 align-middle",
        isActive
          ? "text-primary transition-colors hover:text-primary/70"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <span>{children}</span>
      <span>{name}</span>
    </Link>
  );
}
