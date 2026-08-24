import type { Metadata } from "next";

import { HomeContent } from "@/app/dashboard/_components/home-content";

export const metadata: Metadata = {
	title: "Dashboard",
};

export default function Page() {
	return <HomeContent />;
}
