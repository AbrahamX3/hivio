"use client";

import { Suspense, useEffect, useState } from "react";
import { useAction, useOptimisticAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { UserSession } from "@/types/auth";

import { followUser, isFollowingUser } from "./actions";
import { Followers } from "./followers";

interface Props {
  username: string;
  totalFollowers: number;
  user: UserSession | null;
}

export default function FollowDetails({
  username,
  totalFollowers,
  user,
}: Props) {
  const [following, setFollowing] = useState(false);
  const { execute: getIsFollowingUser } = useAction(isFollowingUser, {
    onSuccess: (data) => {
      setFollowing(data);
    },
  });

  const { execute, optimisticData } = useOptimisticAction(
    followUser,
    { totalFollowers, following },
    (state, { total }) => {
      return {
        totalFollowers: total ?? 0,
        following: state.following,
      };
    },
    {
      onSuccess: ({ following }) => {
        setFollowing(following ?? false);
      },
    },
  );

  useEffect(() => {
    if (user?.id) {
      getIsFollowingUser({ username });
    }
  }, [getIsFollowingUser, user?.id, username]);

  return (
    <>
      {user?.id ? (
        user?.username !== username && (
          <Button
            variant="outline"
            onClick={() =>
              execute({
                username,
                total: totalFollowers,
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
        <Followers
          currentUser={user?.username}
          total={optimisticData.totalFollowers}
          username={username}
        />
      </Suspense>
    </>
  );
}
