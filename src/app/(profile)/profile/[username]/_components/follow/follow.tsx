import { type HiveUser } from "@/app/(profile)/actions";
import { getUserSession } from "@/lib/auth";

import FollowDetails from "./follow-details";

interface FollowButtonProps {
  hiveUserProfile: HiveUser;
}

export default async function Follow({ hiveUserProfile }: FollowButtonProps) {
  const currentUser = await getUserSession();

  return (
    <div className="flex flex-col items-center gap-2">
      <FollowDetails
        hiveUserProfile={hiveUserProfile}
        currentUser={currentUser}
      />
    </div>
  );
}
