import { useAction } from "next-safe-action/hooks";
import { Link } from "next-view-transitions";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  followUser,
  getFollowers,
  type UserFollower,
  type UserFollowing,
} from "./actions";

interface Props {
  followers: UserFollower[];
  following: UserFollowing[];
  username: string;
  currentUser?: string | null;
  currentUserFollowing: UserFollowing[];
}

export function Followers({
  username,
  currentUser,
  followers,
  following,
  currentUserFollowing,
}: Props) {
  const { execute, status } = useAction(getFollowers);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button onClick={() => execute({ username })} variant="link">
          {followers.length} Followers
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>@{username}&apos;s followers</DialogTitle>
        </DialogHeader>
        <div className="max-h-[300px] overflow-y-auto">
          <div className="flex max-h-[300px] flex-col gap-1 overflow-y-auto p-1 scrollbar scrollbar-track-muted scrollbar-thumb-foreground scrollbar-thumb-rounded-md scrollbar-w-2">
            {status === "executing" || status === "idle" ? (
              <div className="flex flex-col items-center rounded-md p-2 text-center">
                Finding @{username}&apos;s followers...
              </div>
            ) : status === "hasSucceeded" && followers.length === 0 ? (
              currentUser === username ? (
                <div className="flex flex-col items-center rounded-md border border-dashed p-2 text-center">
                  You currently have no followers!
                </div>
              ) : (
                <div className="flex flex-col items-center rounded-md border border-dashed p-2 text-center">
                  @{username} has no followers, be the first to follow them!
                </div>
              )
            ) : (
              followers.map((user) => (
                <div
                  key={`follower_${user.username}`}
                  className="flex w-full items-center justify-between gap-4 align-middle"
                >
                  <Link
                    href={`/profile/${user.username}`}
                    className="h-18 flex w-64 items-center space-x-3 rounded-md border p-2 transition duration-150 ease-in-out hover:bg-primary hover:text-primary-foreground"
                  >
                    <Avatar className="h-10 w-10">
                      {user.avatar && (
                        <AvatarImage
                          alt={`@${user.username}`}
                          src={user.avatar}
                        />
                      )}
                      <AvatarFallback>
                        {user.username?.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="relative">
                      <div className="max-w-44 truncate font-medium">
                        {user.name}
                      </div>
                      <div className="max-w-44 truncate text-sm">
                        @{user.username}
                      </div>
                    </div>
                  </Link>
                  {currentUser ? (
                    user.username !== currentUser ? (
                      <Button
                        onClick={async () =>
                          await followUser({
                            username: user.username ?? "",
                            total: following.length,
                          })
                        }
                      >
                        {currentUserFollowing.find(
                          (following) => following.username === user.username,
                        )
                          ? "Following"
                          : "Follow"}
                      </Button>
                    ) : (
                      <Button disabled>Follow</Button>
                    )
                  ) : (
                    <Button
                      onClick={() => {
                        toast.error("You are not signed in!", {
                          description: "Please sign in to follow a user.",
                          action: {
                            label: "Sign in",
                            onClick: () =>
                              (window.location.href = "/auth/signin"),
                          },
                        });
                      }}
                    >
                      Follow
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
