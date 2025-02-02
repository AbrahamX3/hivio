import { getSession } from "@/lib/auth";

import { getUserProfilesAction } from "@/actions/profiles/discover/actions";
import Background from "./_components/background";
import HiveProfileFilter from "./_components/filter";

export const metadata = {
	title: "Discover",
};

export default async function Discover() {
	const data = await getUserProfilesAction({ limit: 100 });
	const currentUser = await getSession();
	return (
		<Background>
			<div className="mx-auto grid w-full gap-6">
				<HiveProfileFilter
					currentUser={currentUser}
					hive={data?.data?.data?.hive ?? []}
				/>
			</div>
		</Background>
	);
}
