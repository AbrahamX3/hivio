import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { Link } from "next-view-transitions";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { getFollowers, UserFollower } from "./actions";

interface Props {
  total: number;
  username: string;
  currentUser?: string | null;
}

export function Followers({ total, username, currentUser }: Props) {
  const [followers, setFollowers] = useState<UserFollower[]>([]);

  const { execute, status } = useAction(getFollowers, {
    onSuccess: ({ followers }) => {
      setFollowers(followers);
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button onClick={() => execute({ username })} variant="link">
          {total} Followers
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>@{username}&apos;s followers</DialogTitle>
        </DialogHeader>
        <div className="max-h-[300px] overflow-y-auto">
          <div className="flex max-h-[300px] flex-col gap-1 overflow-y-auto p-1 scrollbar scrollbar-track-muted scrollbar-thumb-foreground scrollbar-thumb-rounded-md scrollbar-w-2">
            {status === "executing" || status === "idle" ? (
              <div className="flex items-center rounded-md border border-dashed p-2 text-center">
                Finding @{username}&apos;s followers...
              </div>
            ) : status === "hasSucceeded" && followers.length === 0 ? (
              currentUser === username ? (
                <div className="flex flex-col items-center rounded-md border border-dashed p-2 text-center">
                  You currently have no followers!
                </div>
              ) : (
                <div className="flex flex-col items-center rounded-md border border-dashed p-2 text-center">
                  @{username} has followers, be the first to follow them!
                </div>
              )
            ) : (
              followers.map(({ avatar, name, username }) => (
                <Link
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
        <DialogFooter>
          <DialogClose asChild>
            <Button className="place-self-end" type="button">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
