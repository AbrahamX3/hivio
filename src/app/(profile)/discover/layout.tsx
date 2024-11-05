import type React from "react";

import { Footer } from "@/components/footer";

import Header from "../_components/header";

export default async function ProfileLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<Header />
			<main className="container flex min-h-screen flex-col justify-between gap-4 px-5 py-8 align-middle">
				{children}
			</main>
			<Footer />
		</>
	);
}
