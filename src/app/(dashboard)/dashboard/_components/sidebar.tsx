"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Home, ListIcon, Package2, SettingsIcon } from "lucide-react";

export default function DashboardSiderbar() {
  return (
    <>
      <nav className="flex flex-col items-center gap-4 px-2 py-4">
        <Link
          href="#"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">Acme Inc</span>
        </Link>
        <SidebarLink name="Dashboard" href="/dashboard">
          <Home className="h-5 w-5" />
        </SidebarLink>
        <SidebarLink name="List" href="/dashboard/list">
          <ListIcon className="h-5 w-5" />
        </SidebarLink>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
        <SidebarLink name="Settings" href="/dashboard/settings">
          <SettingsIcon className="h-5 w-5" />
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
