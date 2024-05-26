"use client";

import { Suspense } from "react";
import { useOptimisticAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { type HiveUser } from "@/app/(profile)/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type UserSession } from "@/types/auth";

import { followUser } from "./actions";
import { Followers } from "./followers";
import { Following } from "./following";

interface Props {
  hiveUserProfile: HiveUser;
  currentUser: UserSession | null;
}

export default function Follow({ currentUser, hiveUserProfile }: Props) {
  const isFollowingUser = hiveUserProfile?.followers.some(
    (user) => user.follower.username === currentUser?.username,
  );

  const { execute, optimisticData, status } = useOptimisticAction(
    followUser,
    {
      totalFollowers: hiveUserProfile?.total_followers,
      following: isFollowingUser,
    },
    (state, { total = 0 }) => {
      return {
        totalFollowers: total,
        following: state.following,
      };
    },
  );

  return (
    <div className="flex flex-col items-center gap-2">
      {currentUser ? (
        currentUser?.username !== hiveUserProfile?.username && (
          <Button
            variant="outline"
            disabled={status === "executing"}
            className={cn(status === "executing" && "animate-pulse")}
            onClick={() =>
              execute({
                username: hiveUserProfile?.username ?? "",
                total: hiveUserProfile?.total_followers ?? 0,
              })
            }
          >
            {status === "executing"
              ? optimisticData.following
                ? "Unfollowing"
                : "Following"
              : optimisticData.following
                ? "Unfollow"
                : "Follow"}
          </Button>
        )
      ) : (
        <Button
          variant="outline"
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
      <Suspense
        fallback={
          <Button disabled variant="link">
            Loading...
          </Button>
        }
      >
        <Following
          hiveUserProfile={hiveUserProfile}
          currentUser={currentUser}
        />
      </Suspense>
      <Suspense
        fallback={
          <Button disabled variant="link">
            Loading...
          </Button>
        }
      >
        <Followers
          currentUser={currentUser}
          hiveUserProfile={hiveUserProfile}
        />
      </Suspense>
    </div>
  );
}
