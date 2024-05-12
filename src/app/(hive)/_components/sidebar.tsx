"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, SettingsIcon, UserIcon } from "lucide-react";

import { LogoIcon } from "@/components/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Props {
  username: string | null;
}
export default function DashboardSiderbar({ username }: Props) {
  return (
    <>
      <nav className="flex flex-col items-center gap-4 px-2 py-4">
        <Link
          href="/"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <LogoIcon className="size-6" />
          <span className="sr-only">Hivio</span>
        </Link>
        <SidebarLink name="Hive" href="/hive">
          <Home className="size-5" />
        </SidebarLink>
        {username && (
          <SidebarLink name="My Profile" href={`/profile/${username}`}>
            <UserIcon className="size-5" />
          </SidebarLink>
        )}
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
        <SidebarLink name="Settings" href="/hive/settings">
          <SettingsIcon className="size-5" />
        </SidebarLink>
      </nav>
    </>
  );
}

function SidebarLink({
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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg md:h-8 md:w-8",
              isActive
                ? "bg-accent text-accent-foreground transition-colors hover:text-foreground"
                : "transition-colors hover:text-foreground",
            )}
          >
            {children}
            <span className="sr-only">{name}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{name}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
