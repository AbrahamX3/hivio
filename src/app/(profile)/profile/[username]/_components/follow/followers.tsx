import { useOptimisticAction } from "next-safe-action/hooks";
import { Link } from "next-view-transitions";
import { toast } from "sonner";

import { type HiveUser } from "@/app/(profile)/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { type UserSession } from "@/types/auth";

import { followUser } from "./actions";

interface Props {
  hiveUserProfile: HiveUser;
  currentUser: UserSession | null;
}

export function Followers({ currentUser, hiveUserProfile }: Props) {
  const isFollowingUser = hiveUserProfile?.following.some(
    (user) => user.followed.username === currentUser?.username,
  );

  const { execute, optimisticData, status } = useOptimisticAction(
    followUser,
    {
      totalFollowers: hiveUserProfile?.total_following,
      following: isFollowingUser,
    },
    (state, { total }) => {
      return {
        totalFollowers: total ?? 0,
        following: state.following,
      };
    },
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-black dark:text-primary">
          {hiveUserProfile?.total_followers} Followers
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            @{hiveUserProfile?.username}&apos;s followers
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[300px] overflow-y-auto">
          <div className="flex max-h-[300px] flex-col gap-1 overflow-y-auto p-1 scrollbar scrollbar-track-muted scrollbar-thumb-foreground scrollbar-thumb-rounded-md scrollbar-w-2">
            {hiveUserProfile?.total_followers === 0 ? (
              currentUser === hiveUserProfile?.username ? (
                <div className="flex flex-col items-center rounded-md border border-dashed p-2 text-center">
                  You currently have no followers!
                </div>
              ) : (
                <div className="flex flex-col items-center rounded-md border border-dashed p-2 text-center">
                  @{hiveUserProfile?.username} has no followers, be the first to
                  follow them!
                </div>
              )
            ) : (
              hiveUserProfile?.followers.map(
                ({ follower: { username, avatar, name } }) => (
                  <div
                    key={`follower_${username}`}
                    className="flex w-full items-center justify-between gap-4 align-middle"
                  >
                    <Link
                      href={`/profile/${username}`}
                      className="h-18 flex w-64 items-center space-x-3 rounded-md border p-2 transition duration-150 ease-in-out hover:bg-primary hover:text-primary-foreground"
                    >
                      <Avatar className="h-10 w-10">
                        {avatar && (
                          <AvatarImage alt={`@${username}`} src={avatar} />
                        )}
                        <AvatarFallback className="uppercase">
                          {username?.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="relative">
                        <div className="max-w-44 truncate font-medium">
                          {name}
                        </div>
                        <div className="max-w-44 truncate text-sm">
                          @{username}
                        </div>
                      </div>
                    </Link>
                    {currentUser ? (
                      username !== currentUser.username ? (
                        <Button
                          disabled={status === "executing"}
                          className={cn(
                            status === "executing" && "animate-pulse",
                          )}
                          onClick={async () =>
                            execute({
                              username: username ?? "",
                              total: hiveUserProfile?.total_following,
                            })
                          }
                        >
                          {status === "executing"
                            ? optimisticData.following
                              ? "Unfollowing"
                              : "Following"
                            : currentUser?.following.find(
                                  (following) =>
                                    following.followed.username === username,
                                )
                              ? "Unfollow"
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
                ),
              )
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
