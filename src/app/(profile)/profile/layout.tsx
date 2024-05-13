import { Footer } from "@/components/footer";
import { TitleDetailsProvider } from "@/context/title-details-context";

import Header from "./_components/header";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TitleDetailsProvider>
      <Header />
      <main className="container flex min-h-screen flex-col justify-between gap-4 px-5 py-8 align-middle">
        {children}
      </main>
      <Footer />
    </TitleDetailsProvider>
  );
}
