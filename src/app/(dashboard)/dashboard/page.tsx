import e from "@edgedb/edgeql-js";

import { getUser, verifyUser } from "@/lib/auth";
import { auth } from "@/lib/edgedb";

import { DashboardContainer } from "./_components/dashboard-container";

export default async function Dashboard() {
  await verifyUser();
  const client = auth.getSession().client;
  const user = await getUser();

  const data = await e
    .select(e.Hive, (hive) => ({
      ...e.Hive["*"],
      title: {
        ...e.Title["*"],
      },
      filter: e.op(hive.createdBy.id, "=", e.global.CurrentUser.id),
    }))
    .run(client);

  return (
    <main className="grid w-full flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 lg:grid-cols-3 xl:grid-cols-3">
      <DashboardContainer data={data} user={user} />
    </main>
  );
}
