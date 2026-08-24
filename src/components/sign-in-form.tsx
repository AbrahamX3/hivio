"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore, useTransition } from "react";

import { DoubleBezel } from "@/components/double-bezel";
import { HivioLogo } from "@/components/icons";
import { authClient } from "@/lib/auth-client";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

function GoogleIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			width="20"
			height="20"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
				fill="#4285F4"
			/>
			<path
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
				fill="#34A853"
			/>
			<path
				d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
				fill="#FBBC05"
			/>
			<path
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
				fill="#EA4335"
			/>
		</svg>
	);
}

function DiscordIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 65 48"
		>
			<path
				fill="#5865f2"
				d="M41.235 0a37 37 0 0 0-1.68 3.397 49 49 0 0 0-14.497 0A34 34 0 0 0 23.378 0a52.8 52.8 0 0 0-13.07 4.028C2.05 16.265-.185 28.186.927 39.943a52.5 52.5 0 0 0 16.025 8.044c1.3-1.742 2.45-3.599 3.435-5.53a34.7 34.7 0 0 1-5.405-2.577c.455-.328.897-.67 1.326-.998a37.63 37.63 0 0 0 32.038 0c.43.354.871.695 1.326.998a34.4 34.4 0 0 1-5.418 2.589A38.5 38.5 0 0 0 47.688 48a52.5 52.5 0 0 0 16.025-8.032c1.314-13.638-2.247-25.458-9.408-35.927A52 52 0 0 0 41.248.025zM21.8 32.707c-3.119 0-5.708-2.829-5.708-6.327s2.488-6.339 5.696-6.339 5.758 2.854 5.708 6.34-2.513 6.326-5.696 6.326m21.039 0c-3.132 0-5.695-2.829-5.695-6.327s2.487-6.339 5.695-6.339 5.746 2.854 5.695 6.34c-.05 3.485-2.513 6.326-5.695 6.326"
			/>
		</svg>
	);
}

function subscribeToStorage(onStoreChange: () => void) {
	window.addEventListener("storage", onStoreChange);
	return () => window.removeEventListener("storage", onStoreChange);
}

function getLastUsedLoginMethodSnapshot() {
	return authClient.getLastUsedLoginMethod();
}

export default function SignInForm() {
	const [isPending, startTransition] = useTransition();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");

	const lastMethod = useSyncExternalStore(
		subscribeToStorage,
		getLastUsedLoginMethodSnapshot,
		() => null,
	);

	const handleEmailSignIn = (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		startTransition(async () => {
			try {
				const result = await authClient.signIn.email({
					email,
					password,
					callbackURL: "/dashboard",
				});
				if (result.error) {
					setError(result.error.message ?? "Invalid email or password");
				}
			} catch (err) {
				if (err instanceof Error) {
					setError(err.message);
				} else {
					setError("An unexpected error occurred");
				}
			}
		});
	};

	const handleSocialSignIn = (provider: "google" | "discord") => {
		startTransition(async () => {
			try {
				await authClient.signIn.social({
					provider,
					callbackURL: "/dashboard",
				});
			} catch (err) {
				if (err instanceof Error) {
					console.error("Sign in error:", err.message);
				}
			}
		});
	};

	return (
		<main className="bg-background text-foreground flex min-h-screen flex-col">
			<div className="pointer-events-none sticky top-4 z-50 w-full px-4">
				<div className="mx-auto w-full max-w-6xl">
					<div className="border-border/60 bg-background/80 ring-border/40 ring-primary/5 pointer-events-auto flex w-full items-center justify-between rounded-full border px-3 py-2 shadow-lg ring-1 backdrop-blur-2xl">
						<Link
							href="/"
							className="flex items-center gap-2 font-semibold transition-opacity hover:opacity-90"
						>
							<HivioLogo className="text-primary" />
						</Link>
						<Button
							asChild
							variant="ghost"
							size="sm"
							className="text-muted-foreground hover:text-foreground hidden rounded-full px-3 text-xs sm:inline-flex"
						>
							<Link href="/">← Back to home</Link>
						</Button>
					</div>
				</div>
			</div>

			<section className="flex flex-1 items-center justify-center px-4 py-20 sm:py-24">
				<div className="w-full max-w-sm">
					<DoubleBezel outerClassName="rounded-[1.5rem]">
						<div className="px-2 py-4">
							<div className="mb-6 text-center">
								<h2 className="text-2xl font-semibold">Welcome back</h2>
								<p className="text-muted-foreground mt-1.5 text-sm">
									Sign in to your account to continue
								</p>
							</div>
							<form onSubmit={handleEmailSignIn}>
								<div className="flex flex-col gap-6">
									<div className="grid gap-2">
										<Label htmlFor="email">Email</Label>
										<Input
											id="email"
											autoComplete="email"
											type="email"
											placeholder="m@example.com"
											required
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											disabled={isPending}
										/>
									</div>
									<div className="grid gap-2">
										<div className="flex items-center">
											<Label htmlFor="password">Password</Label>
											<Link
												href="#"
												className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
											>
												Forgot your password?
											</Link>
										</div>
										<div className="relative">
											<Input
												id="password"
												autoComplete="current-password"
												type={showPassword ? "text" : "password"}
												required
												value={password}
												onChange={(e) => setPassword(e.target.value)}
												disabled={isPending}
												className="pr-10"
											/>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="absolute right-0 top-0 h-full px-3"
												onClick={() => setShowPassword((v) => !v)}
												aria-label={
													showPassword ? "Hide password" : "Show password"
												}
											>
												{showPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</Button>
										</div>
									</div>
									{error && <p className="text-destructive text-sm">{error}</p>}
									<Button
										type="submit"
										className="w-full transition-spring"
										disabled={isPending}
									>
										{isPending ? "Signing in..." : "Sign in"}
									</Button>
								</div>
							</form>

							<div className="relative my-6">
								<div className="absolute inset-0 flex items-center">
									<span className="w-full border-t" />
								</div>
								<div className="relative flex justify-center text-xs uppercase">
									<span className="bg-card text-muted-foreground px-2">
										Or continue with
									</span>
								</div>
							</div>

							<div className="flex flex-col gap-3">
								<div className="relative">
									<Button
										onClick={() => handleSocialSignIn("google")}
										variant="outline"
										className="w-full"
										disabled={isPending}
									>
										<GoogleIcon />
										<span>Continue with Google</span>
									</Button>
									{lastMethod === "google" && (
										<Badge className="absolute -top-2 -right-2 text-[10px]">
											Last used
										</Badge>
									)}
								</div>
								<div className="relative">
									<Button
										onClick={() => handleSocialSignIn("discord")}
										variant="outline"
										className="w-full"
										disabled={isPending}
									>
										<DiscordIcon />
										<span>Continue with Discord</span>
									</Button>
									{lastMethod === "discord" && (
										<Badge className="absolute -top-2 -right-2 text-[10px]">
											Last used
										</Badge>
									)}
								</div>
							</div>

							<div className="mt-6 text-center text-sm">
								Don&apos;t have an account?{" "}
								<Link
									href="/auth/sign-up"
									className="underline underline-offset-4"
								>
									Sign up
								</Link>
							</div>

							<p className="text-muted-foreground mt-6 text-center text-xs">
								By signing in, you agree to our{" "}
								<Link
									href="/terms-of-service"
									className="underline hover:no-underline"
								>
									Terms of Service
								</Link>{" "}
								and{" "}
								<Link
									href="/privacy-policy"
									className="underline hover:no-underline"
								>
									Privacy Policy
								</Link>
							</p>
						</div>
					</DoubleBezel>
				</div>
			</section>
		</main>
	);
}
