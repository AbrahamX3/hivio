import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { ViewTransitions } from "next-view-transitions";

import { TailwindIndicator } from "@/components/providers/tailwind-indicator";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QuickMenu } from "@/components/quick-menu";
import { Toaster } from "@/components/ui/sonner";
import { Confetti } from "@/context/confetti";
import { env } from "@/env";
import { getUserSession } from "@/lib/auth";

import "@/styles/globals.css";

import Script from "next/script";

export const metadata: Metadata = {
  title: {
    default: "Hivio",
    template: "Hivio - %s",
  },
  description: "Your Amplified Watchlist Companion",
  icons: [{ rel: "icon", url: "/icon.svg" }],
  metadataBase: new URL(env.NEXT_PUBLIC_BASE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Hivio",
    description: "Your Amplified Watchlist Companion",
    url: env.NEXT_PUBLIC_BASE_URL,
    type: "website",
    images: [
      {
        url: env.NEXT_PUBLIC_BASE_URL + "/api/og",
        width: 1200,
        height: 630,
        alt: "Hivio",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getUserSession();

  return (
    <ViewTransitions>
      <html
        lang="en"
        className={`${GeistSans.variable} ${GeistMono.variable}`}
        suppressHydrationWarning
      >
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id={env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
        />
        <body className="scrollbar scrollbar-track-muted-foreground scrollbar-thumb-foreground scrollbar-w-3">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Confetti />
            <Toaster richColors />
            <TailwindIndicator />
            <QuickMenu currentUser={currentUser} />
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
