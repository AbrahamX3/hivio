"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { DoubleBezel } from "@/components/double-bezel";
import { HivioLogo } from "@/components/icons";
import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function ResetPasswordForm({ token }: { token: string | null }) {
	const router = useRouter();
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [done, setDone] = useState(false);
	const [isPending, startTransition] = useTransition();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		if (!token) {
			setError("This reset link is invalid or has expired.");
			return;
		}
		if (newPassword !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}
		if (newPassword.length < 8) {
			setError("Password must be at least 8 characters");
			return;
		}

		startTransition(async () => {
			try {
				const result = await authClient.resetPassword({ newPassword, token });
				if (result.error) {
					setError(result.error.message ?? "Could not reset your password");
					return;
				}
				setDone(true);
				router.push("/auth/sign-in");
			} catch {
				setError("Could not reset your password");
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
							<div className="mb-6 text-center">
								<h2 className="text-2xl font-semibold">
									Choose a new password
								</h2>
								<p className="text-muted-foreground mt-1.5 text-sm">
									Your new password must be at least 8 characters
								</p>
							</div>

							{done ? (
								<p className="text-center text-sm">
									Password updated. Redirecting to sign in…
								</p>
							) : (
								<form onSubmit={handleSubmit}>
									<div className="flex flex-col gap-6">
										<div className="grid gap-2">
											<Label htmlFor="new-password">New password</Label>
											<Input
												id="new-password"
												type="password"
												autoComplete="new-password"
												required
												value={newPassword}
												onChange={(e) => setNewPassword(e.target.value)}
												disabled={isPending}
											/>
										</div>
										<div className="grid gap-2">
											<Label htmlFor="confirm-password">Confirm password</Label>
											<Input
												id="confirm-password"
												type="password"
												autoComplete="new-password"
												required
												value={confirmPassword}
												onChange={(e) => setConfirmPassword(e.target.value)}
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
											{isPending ? "Updating..." : "Reset password"}
										</Button>
									</div>
								</form>
							)}
						</div>
					</DoubleBezel>
				</div>
			</section>
		</main>
	);
}
