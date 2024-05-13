import { getUserSession } from "@/lib/auth";

import { totalFollowers } from "./actions";
import FollowDetails from "./follow-details";

interface FollowButtonProps {
  username: string;
}

export default async function Follow({ username }: FollowButtonProps) {
  const { data: total = 0 } = await totalFollowers({ username });
  const user = await getUserSession();

  return (
    <div className="flex flex-col items-center gap-2">
      <FollowDetails username={username} totalFollowers={total} user={user} />
    </div>
  );
}
