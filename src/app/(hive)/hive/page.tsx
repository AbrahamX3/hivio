import e from "@edgedb/edgeql-js";

import { getUser, verifyUser } from "@/lib/auth";
import { auth } from "@/lib/edgedb";

import { DashboardContainer } from "./_components/dashboard-container";

export const metadata = {
  title: "Your Hive",
};

async function getData() {
  const client = auth.getSession().client;

  const data = await e
    .select(e.Hive, (hive) => ({
      ...e.Hive["*"],
      title: {
        ...e.Title["*"],
      },
      filter: e.op(hive.addedBy.id, "=", e.global.CurrentUser.id),
    }))
    .run(client);

  return JSON.parse(JSON.stringify(data));
}

export default async function HiveDashboard() {
  await verifyUser();

  const user = await getUser();
  const data = await getData();

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
      <DashboardContainer data={data} user={user} />
    </main>
  );
}
