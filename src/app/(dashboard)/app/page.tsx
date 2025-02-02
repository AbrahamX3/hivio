import { getUser } from "@/lib/auth";

import { DashboardContainer } from "../../../components/dashboard/dashboard-container";

export const metadata = {
	title: "Your Hive",
};

export default async function HiveDashboard() {
	const user = await getUser();

	if (!user) {
		return null;
	}

	return (
		<main className="flex flex-1 flex-col overflow-y-auto bg-background p-4">
			<div className="grid w-full flex-1 items-start gap-4 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
				<DashboardContainer user={user} />
			</div>
		</main>
	);
}
