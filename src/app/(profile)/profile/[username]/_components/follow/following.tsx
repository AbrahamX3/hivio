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

import { followUser } from "./actions";

interface Props {
  currentUserUsername?: string | null;
  hiveUserProfile: HiveUser;
}

export function Following({ hiveUserProfile, currentUserUsername }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-black dark:text-primary">
          {hiveUserProfile?.total_following} Following
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            @{hiveUserProfile?.username}&apos;s is following
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[300px] overflow-y-auto">
          <div className="flex max-h-[300px] flex-col gap-1 overflow-y-auto p-1 scrollbar scrollbar-track-muted scrollbar-thumb-foreground scrollbar-thumb-rounded-md scrollbar-w-2">
            {hiveUserProfile?.total_following === 0 ? (
              currentUserUsername === hiveUserProfile?.username ? (
                <div className="flex flex-col items-center rounded-md border border-dashed p-2 text-center">
                  You currently are not following anyone!
                </div>
              ) : (
                <div className="flex flex-col items-center rounded-md border border-dashed p-2 text-center">
                  @{hiveUserProfile.username} is currently not following anyone!
                </div>
              )
            ) : (
              hiveUserProfile?.following.map(
                ({ followed: { username, avatar, name } }) => (
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
                    {currentUserUsername ? (
                      username !== currentUserUsername ? (
                        <Button
                          onClick={async () =>
                            await followUser({
                              username: username ?? "",
                              total: hiveUserProfile.total_following,
                            })
                          }
                        >
                          {hiveUserProfile.following.find(
                            (following) =>
                              following.followed.username === username,
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
                ),
              )
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
