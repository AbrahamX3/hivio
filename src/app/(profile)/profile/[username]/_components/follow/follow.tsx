"use client";

import { Suspense } from "react";
import { useOptimisticAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { type HiveUser } from "@/app/(profile)/actions";
import { Button } from "@/components/ui/button";
import { type UserSession } from "@/types/auth";

import { followUser } from "./actions";
import { Followers } from "./followers";
import { Following } from "./following";

interface Props {
  hiveUserProfile: HiveUser;
  currentUser: UserSession | null;
}

export default function Follow({ currentUser, hiveUserProfile }: Props) {
  const isFollowingHiveUserProfile = hiveUserProfile?.followers.some(
    (user) => user.follower.username === currentUser?.username,
  );

  const { execute, optimisticData } = useOptimisticAction(
    followUser,
    {
      totalFollowers: hiveUserProfile?.total_followers,
      following: isFollowingHiveUserProfile,
    },
    (state, { total = 0 }) => {
      return {
        totalFollowers: total,
        following: !state.following,
      };
    },
  );

  return (
    <div className="flex flex-col items-center gap-2">
      {currentUser ? (
        currentUser?.username !== hiveUserProfile?.username && (
          <Button
            variant="outline"
            onClick={() => {
              if (!hiveUserProfile?.username) return;
              execute({
                username: hiveUserProfile?.username,
                total: hiveUserProfile?.total_followers ?? 0,
              });
            }}
          >
            {optimisticData.following ? "Unfollow" : "Follow"}
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
