import { getUserSession } from "@/lib/auth";

import { getFollowers, getFollowing } from "./actions";
import FollowDetails from "./follow-details";

interface FollowButtonProps {
  username: string;
}

export default async function Follow({ username }: FollowButtonProps) {
  const following = await getFollowing({ username });
  const followers = await getFollowers({ username });
  const currentUser = await getUserSession();
  const currentUserFollowing = await getFollowing({
    username: currentUser?.username ?? "",
  });

  return (
    <div className="flex flex-col items-center gap-2">
      <FollowDetails
        username={username}
        currentUserFollowing={currentUserFollowing.data?.following ?? []}
        userFollowing={following.data?.following ?? []}
        userFollowers={followers.data?.followers ?? []}
        currentUser={currentUser}
      />
    </div>
  );
}
