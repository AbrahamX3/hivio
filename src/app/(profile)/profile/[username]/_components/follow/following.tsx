import { AnimatePresence, motion } from "framer-motion";
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
import { type UserSession } from "@/types/auth";

import { followUser } from "./actions";

interface Props {
  currentUser: UserSession | null;
  hiveUserProfile: HiveUser;
}

export function Following({ hiveUserProfile, currentUser }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-black dark:text-primary">
          {hiveUserProfile?.total_following ?? 0} Following
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
              currentUser === hiveUserProfile?.username ? (
                <div className="flex flex-col items-center rounded-md border border-dashed p-2 text-center">
                  You currently are not following anyone!
                </div>
              ) : (
                <div className="flex flex-col items-center rounded-md border border-dashed p-2 text-center">
                  @{hiveUserProfile.username} is currently not following anyone!
                </div>
              )
            ) : (
              <AnimatePresence mode="sync">
                {hiveUserProfile?.following.map(
                  ({ followed: { username, avatar, name } }) => (
                    <UserCard
                      key={`followed_${username}`}
                      username={username}
                      avatar={avatar}
                      name={name}
                      currentUser={currentUser}
                      hiveUserProfile={hiveUserProfile}
                    />
                  ),
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UserCard({
  username,
  avatar,
  name,
  currentUser,
  hiveUserProfile,
}: {
  username: string | null;
  avatar: string | null;
  name: string;
  currentUser: UserSession | null;
  hiveUserProfile: HiveUser;
}) {
  const isCurrentUserFollowing =
    currentUser?.following.find(
      (following) => following.followed.username === username,
    )?.followed.username === username;

  const { execute, optimisticData } = useOptimisticAction(
    followUser,
    {
      totalFollowers: hiveUserProfile?.total_following,
      following: isCurrentUserFollowing,
    },
    (state, { total = 0 }) => {
      const finalTotal = state.following ? total - 1 : total + 1;

      return {
        totalFollowers: finalTotal,
        following: !state.following,
      };
    },
  );

  if (!username) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { duration: 0.3, ease: "easeIn" },
      }}
      exit={{
        opacity: 0,
        transition: { duration: 0.2, ease: "easeOut", velocity: 5 },
      }}
      key={`follower_${username}`}
      className="flex w-full items-center justify-between gap-4 align-middle"
    >
      <Link
        href={`/profile/${username}`}
        className="h-18 flex w-64 items-center space-x-3 rounded-md border p-2 transition duration-150 ease-in-out hover:bg-primary hover:text-primary-foreground"
      >
        <Avatar className="h-10 w-10">
          {avatar && <AvatarImage alt={`@${username}`} src={avatar} />}
          <AvatarFallback className="uppercase">
            {username?.slice(0, 1)}
          </AvatarFallback>
        </Avatar>
        <div className="relative">
          <div className="max-w-44 truncate font-medium">{name}</div>
          <div className="max-w-44 truncate text-sm">@{username}</div>
        </div>
      </Link>
      {currentUser ? (
        username !== currentUser.username ? (
          <Button
            onClick={async () =>
              username &&
              execute({
                username: username,
                total: hiveUserProfile?.total_following,
              })
            }
          >
            {optimisticData.following ? "Unfollow" : "Follow"}
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
                onClick: () => (window.location.href = "/auth/signin"),
              },
            });
          }}
        >
          Follow
        </Button>
      )}
    </motion.div>
  );
}
