import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import View from "./_components/view";

export const metadata: Metadata = {
	title: "Dashboard",
	description:
		"Manage your watch history and track your favorite movies and series",
};

export default async function DashboardIndex() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/auth/sign-in");
	}

	return <View />;
}
