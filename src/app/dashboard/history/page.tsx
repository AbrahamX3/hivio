import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { HistoryContent } from "@/app/dashboard/_components/history-content";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
	title: "History",
	description: "View and manage your complete watch history library",
};

export default async function HistoryPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/auth/sign-in");
	}

	return <HistoryContent />;
}
