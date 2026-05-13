import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next";

import { Providers } from "@/components/providers";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { UmamiAnalytics } from "@/components/umami-analytics";
import { UmamiScript } from "@/components/umami-script";
import { env } from "@/env";
import { cn } from "@/lib/utils";

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
	return (
		<html lang="en" suppressHydrationWarning style={{ colorScheme: "dark" }}>
			<body
				className={cn(geistSans.variable, geistMono.variable, "antialiased")}
			>
				<Providers>
					<NuqsAdapter>
						<ThemeProvider
							attribute="class"
							enableSystem
							disableTransitionOnChange
							storageKey="vite-ui-theme"
						>
							<div className="flex flex-col h-svh">{children}</div>
							<Toaster richColors />
						</ThemeProvider>
					</NuqsAdapter>
					{env.NODE_ENV === "production" && <UmamiAnalytics />}
				</Providers>
				<UmamiScript />
			</body>
		</html>
	);
}
