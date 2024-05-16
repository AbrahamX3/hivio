"use client";

import { Suspense } from "react";
import { useOptimisticAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { type UserSession } from "@/types/auth";

import {
  followUser,
  totalFollowers,
  type UserFollower,
  type UserFollowing,
} from "./actions";
import { Followers } from "./followers";
import { Following } from "./following";

interface Props {
  username: string;
  userFollowers: UserFollower[];
  userFollowing: UserFollowing[];
  currentUserFollowing: UserFollowing[];
  currentUser: UserSession | null;
}

export default function FollowDetails({
  username,
  userFollowers,
  userFollowing,
  currentUser,
  currentUserFollowing,
}: Props) {
  const isFollowingUser = userFollowers.some(
    (user) => user.username === currentUser?.username,
  );
  const { execute, optimisticData } = useOptimisticAction(
    followUser,
    { totalFollowers: userFollowers.length, following: isFollowingUser },
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
        currentUser?.username !== username && (
          <Button
            variant="outline"
            onClick={() =>
              execute({
                username,
                total: totalFollowers.length,
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
          currentUserFollowing={currentUserFollowing}
          followers={userFollowers}
          following={userFollowing}
          currentUser={currentUser?.username}
          username={username}
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
          followers={userFollowers}
          following={userFollowing}
          username={username}
          currentUserFollowing={currentUserFollowing}
        />
      </Suspense>
    </>
  );
}
