import e from "@edgedb/edgeql-js";

import { getUser, verifyUser } from "@/lib/auth";
import { auth } from "@/lib/edgedb";
import { type HiveRowData } from "@/types/hive";

import { DashboardContainer } from "./_components/dashboard-container";

export const metadata = {
  title: "Your Hive",
};

async function getHiveData() {
  const client = auth.getSession().client;

  const data = await e
    .select(e.Hive, (hive) => ({
      ...e.Hive["*"],
      title: {
        ...e.Title["*"],
        seasons: {
          ...e.Season["*"],
        },
      },
      filter: e.op(hive.addedBy.id, "=", e.global.CurrentUser.id),
    }))
    .run(client);

  return JSON.parse(JSON.stringify(data)) as HiveRowData[];
}

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
