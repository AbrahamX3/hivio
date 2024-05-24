import { getUserSession } from "@/lib/auth";

import Background from "./_components/background";
import HiveProfileFilter from "./_components/filter";
import { getHiveProfiles } from "./actions";

export const metadata = {
  title: "Discover",
};

export default async function Discover() {
  const { data } = await getHiveProfiles({ limit: 100 });
  const currentUser = await getUserSession();
  return (
    <Background>
      <div className="mx-auto grid w-full gap-6">
        <HiveProfileFilter
          currentUser={currentUser}
          hive={data?.data?.hive ?? []}
        />
      </div>
    </Background>
  );
}
