"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { HivioLogo } from "@/components/icons";
import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function SignUpForm() {
	const [isPending, startTransition] = useTransition();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState("");

	const handleSignUp = (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (password.length < 8) {
			setError("Password must be at least 8 characters");
			return;
		}

		startTransition(async () => {
			try {
				const result = await authClient.signUp.email({
					name,
					email,
					password,
					callbackURL: "/dashboard",
				});
				if (result.error) {
					setError(result.error.message ?? "Failed to create account");
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

	return (
		<main className="bg-background text-foreground flex min-h-screen flex-col">
			<div className="pointer-events-none sticky top-4 z-50 w-full px-4">
				<div className="mx-auto flex max-w-6xl">
					<div className="border-border/60 bg-background/80 ring-border/40 pointer-events-auto flex w-full items-center justify-between rounded-full border px-3 py-2 shadow-lg ring-1 shadow-black/5 backdrop-blur">
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

			<section className="flex flex-1 items-center justify-center px-4 py-14 sm:py-16">
				<div className="w-full max-w-sm">
					<Card>
						<CardHeader className="text-center">
							<CardTitle className="text-2xl">Create an account</CardTitle>
							<CardDescription>
								Enter your details below to get started
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSignUp}>
								<div className="flex flex-col gap-6">
									<div className="grid gap-2">
										<Label htmlFor="name">Name</Label>
										<Input
											id="name"
											type="text"
											placeholder="John Doe"
											required
											value={name}
											onChange={(e) => setName(e.target.value)}
											disabled={isPending}
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="email">Email</Label>
										<Input
											id="email"
											type="email"
											placeholder="m@example.com"
											required
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											disabled={isPending}
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="password">Password</Label>
										<div className="relative">
											<Input
												id="password"
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
									<div className="grid gap-2">
										<Label htmlFor="confirm-password">Confirm password</Label>
										<div className="relative">
											<Input
												id="confirm-password"
												type={showConfirmPassword ? "text" : "password"}
												required
												value={confirmPassword}
												onChange={(e) => setConfirmPassword(e.target.value)}
												disabled={isPending}
												className="pr-10"
											/>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="absolute right-0 top-0 h-full px-3"
												onClick={() => setShowConfirmPassword((v) => !v)}
												aria-label={
													showConfirmPassword
														? "Hide confirm password"
														: "Show confirm password"
												}
											>
												{showConfirmPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</Button>
										</div>
									</div>
									{error && <p className="text-destructive text-sm">{error}</p>}
									<Button type="submit" className="w-full" disabled={isPending}>
										{isPending ? "Creating account..." : "Sign up"}
									</Button>
								</div>
							</form>

							<div className="mt-6 text-center text-sm">
								Already have an account?{" "}
								<Link
									href="/auth/sign-in"
									className="underline underline-offset-4"
								>
									Sign in
								</Link>
							</div>

							<p className="text-muted-foreground mt-6 text-center text-xs">
								By signing up, you agree to our{" "}
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
						</CardContent>
					</Card>
				</div>
			</section>
		</main>
	);
}
