import { getUser, verifyUser } from "@/lib/auth";
import { type HiveRowData } from "@/types/hive";

import { DashboardContainer } from "./_components/dashboard-container";
import { getHiveData } from "./actions";

export const metadata = {
  title: "Your Hive",
};

export default async function HiveDashboard() {
  await verifyUser();

  const user = await getUser();
  const hive = await getHiveData();

  return (
    <main className="grid w-full flex-1 items-start gap-4 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <DashboardContainer
        data={JSON.parse(JSON.stringify(hive)) as HiveRowData[]}
        user={user}
      />
    </main>
  );
}
