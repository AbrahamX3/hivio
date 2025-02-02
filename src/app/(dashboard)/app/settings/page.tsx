import { getUser } from "@/lib/auth";

import AvatarForm from "./_components/general/avatar";
import DefaultStatusForm from "./_components/general/default-status";
import DisplayNameForm from "./_components/general/display-name";
import UsernameForm from "./_components/general/username";

export const metadata = {
	title: "Settings",
};

export default async function Settings() {
	const user = await getUser();

	if (!user) {
		return null;
	}

	return (
		<main className="flex w-full flex-1 flex-col gap-4">
			<UsernameForm username={user?.username} />
			<DisplayNameForm name={user?.name} />
			<DefaultStatusForm status={user?.status} />
			<AvatarForm avatar={user?.avatar} />
		</main>
	);
}
