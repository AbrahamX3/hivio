"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CircleHelpIcon,
  HomeIcon,
  LaptopIcon,
  LogInIcon,
  LogOutIcon,
  MoonIcon,
  SettingsIcon,
  SunIcon,
  UserIcon,
  UserSearchIcon,
} from "lucide-react";
import { useTheme } from "next-themes";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { type UserSession } from "@/types/auth";

import { LogoIcon } from "./icons";

export function QuickMenu({
  currentUser,
}: {
  currentUser: UserSession | null;
}) {
  const { setTheme } = useTheme();
  const router = useRouter();

  const [open, setOpen] = useState(false);

  useEffect(
    function handlQuickMenuShortcut() {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          setOpen((prevOpen) => !prevOpen);
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    },
    [setOpen],
  );

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results found</CommandEmpty>
        {currentUser ? (
          <CommandGroup heading="My Profile">
            <CommandItem
              value="hive"
              onSelect={() => {
                runCommand(() => router.push("/hive"));
              }}
            >
              <LogoIcon className="mr-2 size-4" />
              My Hive
            </CommandItem>
            <CommandItem
              value="profile"
              onSelect={() => {
                runCommand(() =>
                  router.push(`/profile/${currentUser.username}`),
                );
              }}
            >
              <UserIcon className="mr-2 size-4" />
              My Profile
            </CommandItem>
            <CommandItem
              value="settings"
              onSelect={() => {
                runCommand(() => router.push("/hive/settings"));
              }}
            >
              <SettingsIcon className="mr-2 size-4" />
              Settings
            </CommandItem>
            <CommandItem
              value="sign-out"
              onSelect={() => {
                runCommand(() => router.push("/api/auth/signout"));
              }}
            >
              <LogOutIcon className="mr-2 size-4" />
              Sign Out
            </CommandItem>
          </CommandGroup>
        ) : null}
        <CommandGroup heading="Hivio">
          <CommandItem
            value="home"
            onSelect={() => {
              runCommand(() => router.push("/"));
            }}
          >
            <HomeIcon className="mr-2 size-4" />
            Homepage
          </CommandItem>
          {!currentUser ? (
            <CommandItem
              value="sign-in"
              onSelect={() => {
                runCommand(() => router.push("/auth/signin"));
              }}
            >
              <LogInIcon className="mr-2 size-4" />
              Sign In
            </CommandItem>
          ) : null}

          <CommandItem
            value="discover"
            onSelect={() => {
              runCommand(() => router.push("/discover"));
            }}
          >
            <UserSearchIcon className="mr-2 size-4" />
            Discover Profiles
          </CommandItem>

          <CommandItem
            value="about"
            onSelect={() => {
              runCommand(() => router.push("/about"));
            }}
          >
            <CircleHelpIcon className="mr-2 size-4" />
            About
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
            <SunIcon className="mr-2 size-4" />
            Light
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
            <MoonIcon className="mr-2 size-4" />
            Dark
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
            <LaptopIcon className="mr-2 size-4" />
            System
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
