import type { Metadata } from "next";

import { Features } from "@/components/landing-page/features";
import { Footer } from "@/components/landing-page/footer";
import { Hero } from "@/components/landing-page/hero";
import { HowItWorks } from "@/components/landing-page/how-it-works";
import { LandingNavbar } from "@/components/landing-page/navbar";

export const metadata: Metadata = {
	title: "Home",
	description: "Track your favorite movies and TV shows",
};

export default function Home() {
	return (
		<main className="bg-background text-foreground flex min-h-screen flex-col">
			<LandingNavbar />
			<Hero />
			<Features />
			<HowItWorks />
			<Footer />
		</main>
	);
}
