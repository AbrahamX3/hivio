import { CallToAction } from "@/components/landing-page/cta";
import { Features } from "@/components/landing-page/features";
import { Hero } from "@/components/landing-page/hero";
import { LandingNavbar } from "@/components/landing-page/navbar";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <LandingNavbar />
      <Hero />
      <Features />
      <CallToAction />
    </main>
  );
}
