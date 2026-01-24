import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { UmamiAnalytics } from "@/components/umami-analytics";
import { UmamiScript } from "@/components/umami-script";
import { cn } from "@/lib/utils";
import { getToken } from "@/lib/auth-server";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Hivio",
    template: "%s | Hivio",
  },
  description: "Your personal dashboard for tracking movies and TV shows.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getToken();

  return (
    <html lang="en" suppressHydrationWarning style={{ colorScheme: "dark" }}>
      <body
        className={cn(geistSans.variable, geistMono.variable, "antialiased")}
      >
        <ConvexClientProvider initialToken={token}>
          <NuqsAdapter>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              disableTransitionOnChange
              storageKey="vite-ui-theme"
            >
              <div className="grid h-svh grid-rows-[auto_1fr]">{children}</div>
              <Toaster richColors />
            </ThemeProvider>
          </NuqsAdapter>
          {process.env.NODE_ENV === "production" && <UmamiAnalytics />}
        </ConvexClientProvider>
        <UmamiScript />
      </body>
    </html>
  );
}
