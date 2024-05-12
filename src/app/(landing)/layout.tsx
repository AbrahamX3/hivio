import { Footer } from "@/components/footer";
import Header from "@/components/header";

export default async function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
