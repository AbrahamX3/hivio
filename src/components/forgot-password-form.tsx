"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { DoubleBezel } from "@/components/double-bezel";
import { HivioLogo } from "@/components/icons";
import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function ForgotPasswordForm() {
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [sent, setSent] = useState(false);
	const [isPending, startTransition] = useTransition();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		startTransition(async () => {
			try {
				const result = await authClient.requestPasswordReset({ email });
				if (result.error) {
					setError(result.error.message ?? "Could not send the reset email");
					return;
				}
				setSent(true);
			} catch {
				setError("Could not send the reset email");
			}
		});
	};

	return (
		<main className="bg-background text-foreground flex min-h-screen flex-col">
			<div className="pointer-events-none sticky top-4 z-50 w-full px-4">
				<div className="mx-auto w-full max-w-6xl">
					<div className="border-border/60 bg-background/80 ring-border/40 ring-primary/5 pointer-events-auto flex w-full items-center justify-between rounded-full border px-3 py-2 shadow-lg ring-1 backdrop-blur-2xl">
						<Link href="/" className="flex items-center gap-2 font-semibold">
							<HivioLogo className="text-primary" />
						</Link>
						<Button
							asChild
							variant="ghost"
							size="sm"
							className="text-muted-foreground rounded-full px-3 text-xs"
						>
							<Link href="/auth/sign-in">← Back to sign in</Link>
						</Button>
					</div>
				</div>
			</div>

			<section className="flex flex-1 items-center justify-center px-4 py-20">
				<div className="w-full max-w-sm">
					<DoubleBezel outerClassName="rounded-[1.5rem]">
						<div className="px-2 py-4">
							{sent ? (
								<div className="flex flex-col items-center gap-4 py-4 text-center">
									<div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
										<Mail />
									</div>
									<h3 className="text-lg font-semibold">Check your email</h3>
									<p className="text-muted-foreground text-sm">
										If an account exists for {email}, we sent a password reset
										link.
									</p>
								</div>
							) : (
								<>
									<div className="mb-6 text-center">
										<h2 className="text-2xl font-semibold">Reset password</h2>
										<p className="text-muted-foreground mt-1.5 text-sm">
											Enter your email and we&apos;ll send you a reset link
										</p>
									</div>
									<form onSubmit={handleSubmit}>
										<div className="flex flex-col gap-6">
											<div className="grid gap-2">
												<Label htmlFor="email">Email</Label>
												<Input
													id="email"
													type="email"
													autoComplete="email"
													placeholder="m@example.com"
													required
													value={email}
													onChange={(e) => setEmail(e.target.value)}
													disabled={isPending}
												/>
											</div>
											{error && (
												<p className="text-destructive text-sm">{error}</p>
											)}
											<Button
												type="submit"
												className="w-full"
												disabled={isPending}
											>
												{isPending ? "Sending..." : "Send reset link"}
											</Button>
										</div>
									</form>
								</>
							)}
						</div>
					</DoubleBezel>
				</div>
			</section>
		</main>
	);
}
