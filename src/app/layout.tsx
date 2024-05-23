import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { ViewTransitions } from "next-view-transitions";

import { TailwindIndicator } from "@/components/providers/tailwind-indicator";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Confetti } from "@/context/confetti";
import { env } from "@/env";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Hivio",
    template: "Hivio - %s",
  },
  description: "Your Amplified Watchlist Companion",
  icons: [{ rel: "icon", url: "/icon.svg" }],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html
        lang="en"
        className={`${GeistSans.variable} ${GeistMono.variable}`}
        suppressHydrationWarning
      >
        <head>
          <link
            rel="canonical"
            href={env.NEXT_PUBLIC_BASE_URL}
            key="canonical"
          />
        </head>
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
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
