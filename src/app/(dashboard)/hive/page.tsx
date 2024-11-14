import { getUser, verifyUser } from "@/lib/auth";

import { DashboardContainer } from "../../../components/dashboard/dashboard-container";
import { type HiveData, getHiveData } from "./actions";

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
				data={JSON.parse(JSON.stringify(hive)) as HiveData}
				user={user}
			/>
		</main>
	);
}
