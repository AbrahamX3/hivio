"use client";

import { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { Link } from "next-view-transitions";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

import { searchUsers, UserSearch } from "./actions";

export default function UsersSearchInput() {
  const [query, setQuery] = useState("");
  const debouncedSearch = useDebounce(query, 500);
  const [results, setResults] = useState<UserSearch[]>([]);
  const { execute, reset, status } = useAction(searchUsers, {
    onSuccess: (users) => {
      setResults(users);
    },
  });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (debouncedSearch.length > 0) {
      execute({ search: debouncedSearch });
      setOpen(true);
    } else {
      reset();
    }
  }, [debouncedSearch, execute, reset]);

  return (
    <div className="relative ml-auto flex-1 text-black dark:text-white md:grow-0">
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg bg-background pr-10 md:w-[200px] lg:w-[320px]"
          placeholder="Search users..."
          type="search"
        />
        <SearchIcon className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
      </div>
      {open && query.length > 0 && (
        <div className="absolute mt-2 w-full rounded-md border-2 bg-background shadow-sm md:w-[200px] lg:w-[320px]">
          <div className="max-h-[300px] overflow-y-auto">
            <div className="flex max-h-[300px] flex-col gap-1 overflow-y-auto p-1 scrollbar scrollbar-track-muted scrollbar-thumb-foreground scrollbar-thumb-rounded-md scrollbar-w-2">
              {status === "executing" || status === "idle" ? (
                <div className="flex animate-pulse items-center space-x-3 rounded-md p-2">
                  Searching users...
                </div>
              ) : status === "hasSucceeded" && results.length === 0 ? (
                <div className="flex items-center space-x-3 rounded-md p-2">
                  No users found with that username or name
                </div>
              ) : (
                results.map(({ avatar, name, username }) => (
                  <Link
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    href={`/profile/${username}`}
                    key={username}
                    className="flex items-center space-x-3 rounded-md p-2 transition duration-150 ease-in-out hover:bg-primary hover:text-primary-foreground"
                  >
                    <Avatar className="h-10 w-10">
                      {avatar && (
                        <AvatarImage alt={`@${username}`} src={avatar} />
                      )}
                      <AvatarFallback>{username?.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="truncate font-medium">{name}</div>
                      <div className="text-sm">@{username}</div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
