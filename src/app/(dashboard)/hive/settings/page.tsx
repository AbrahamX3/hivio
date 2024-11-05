import { getUser, verifyUser } from "@/lib/auth";

import AvatarForm from "./_components/general/avatar";
import DefaultStatusForm from "./_components/general/default-status";
import DisplayNameForm from "./_components/general/display-name";
import UsernameForm from "./_components/general/username";

export const metadata = {
	title: "Settings",
};

export default async function Settings() {
	await verifyUser();

	const user = await getUser();

	return (
		<>
			<UsernameForm username={user?.username} />
			<DisplayNameForm name={user?.name} />
			<DefaultStatusForm status={user?.status} />
			<AvatarForm avatar={user?.avatar} />
		</>
	);
}
