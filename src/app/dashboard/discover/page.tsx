import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { DiscoverTrending } from "@/components/dashboard/discover-trending";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
	title: "Discover",
	description: "Discover trending movies and TV shows",
};

export default async function DiscoverPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/auth/sign-in");
	}

	return (
		<div className="space-y-6 min-w-0">
			<h1 className="text-2xl font-semibold">Discover</h1>
			<DiscoverTrending />
		</div>
	);
}
