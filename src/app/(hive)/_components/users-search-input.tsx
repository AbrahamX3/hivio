"use client";

import { useState } from "react";
import { SearchIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export default function UsersSearchInput() {
  const [query, setQuery] = useState("");

  const [results, setResults] = useState<string[]>([]);
  return (
    <div className="relative ml-auto flex-1 md:grow-0">
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
      {query.length > 0 && (
        <div className="absolute mt-2 w-full rounded-md border bg-background shadow-sm md:w-[200px] lg:w-[320px]">
          <div className="max-h-[300px] overflow-y-auto">
            <div className="max-h-[300px] space-y-2 overflow-y-auto p-4 scrollbar scrollbar-track-muted scrollbar-thumb-foreground scrollbar-thumb-rounded-md scrollbar-w-2 selection:bg-gray-600 selection:text-white">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage alt="@shadcn" src="/placeholder-avatar.jpg" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">John Doe</div>
                  <div className="text-sm text-gray-500">@johndoe</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage alt="@shadcn" src="/placeholder-avatar.jpg" />
                  <AvatarFallback>JA</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">Jane Appleseed</div>
                  <div className="text-sm text-gray-500">@janeappleseed</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage alt="@shadcn" src="/placeholder-avatar.jpg" />
                  <AvatarFallback>SM</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">Sarah Mayer</div>
                  <div className="text-sm text-gray-500">@sarahmayer</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage alt="@shadcn" src="/placeholder-avatar.jpg" />
                  <AvatarFallback>MJ</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">Michael Johnson</div>
                  <div className="text-sm text-gray-500">@michaeljohnson</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage alt="@shadcn" src="/placeholder-avatar.jpg" />
                  <AvatarFallback>EW</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">Emily Wilson</div>
                  <div className="text-sm text-gray-500">@emilywilson</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage alt="@shadcn" src="/placeholder-avatar.jpg" />
                  <AvatarFallback>JB</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">John Bauer</div>
                  <div className="text-sm text-gray-500">@johnbauer</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage alt="@shadcn" src="/placeholder-avatar.jpg" />
                  <AvatarFallback>SA</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">Sarah Anderson</div>
                  <div className="text-sm text-gray-500">@sarahanderson</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage alt="@shadcn" src="/placeholder-avatar.jpg" />
                  <AvatarFallback>MR</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">Michael Ramirez</div>
                  <div className="text-sm text-gray-500">@michaelramirez</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage alt="@shadcn" src="/placeholder-avatar.jpg" />
                  <AvatarFallback>LG</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">Lisa Garcia</div>
                  <div className="text-sm text-gray-500">@lisagarcia</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage alt="@shadcn" src="/placeholder-avatar.jpg" />
                  <AvatarFallback>DW</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">David Wang</div>
                  <div className="text-sm text-gray-500">@davidwang</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
