import { CallToAction } from "@/components/landing-page/cta";
import { Features } from "@/components/landing-page/features";
import { Footer } from "@/components/landing-page/footer";
import { Hero } from "@/components/landing-page/hero";
import { LandingNavbar } from "@/components/landing-page/navbar";

export default function Home() {
  return (
    <main className="bg-background text-foreground flex min-h-screen flex-col">
      <LandingNavbar />
      <Hero />
      <Features />
      <CallToAction />
      <Footer />
    </main>
  );
}
