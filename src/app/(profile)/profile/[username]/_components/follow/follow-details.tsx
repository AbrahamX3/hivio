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

export default function FollowDetails({ currentUser, hiveUserProfile }: Props) {
  const isFollowingUser = hiveUserProfile?.followers.some(
    (user) => user.follower.username === currentUser?.username,
  );

  const { execute, optimisticData } = useOptimisticAction(
    followUser,
    {
      totalFollowers: hiveUserProfile?.total_followers,
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
    <>
      {currentUser?.id ? (
        currentUser?.username !== hiveUserProfile?.username && (
          <Button
            variant="outline"
            onClick={() =>
              execute({
                username: hiveUserProfile?.username ?? "",
                total: hiveUserProfile?.total_followers ?? 0,
              })
            }
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
          currentUserUsername={currentUser?.username}
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
          currentUser={currentUser?.username}
          hiveUserProfile={hiveUserProfile}
        />
      </Suspense>
    </>
  );
}
