import { verifyUser } from "@/lib/auth";

import DeleteAccount from "../_components/danger/delete-profile";

export default async function Settings() {
	await verifyUser();

	return <DeleteAccount />;
}
