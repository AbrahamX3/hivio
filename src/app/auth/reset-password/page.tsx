import type { Metadata } from "next";

import { ResetPasswordForm } from "@/components/reset-password-form";

export const metadata: Metadata = {
	title: "Reset Password",
	description: "Choose a new password for your Hivio account",
};

export const instant = false;

export default async function ResetPasswordPage({
	searchParams,
}: {
	searchParams: Promise<{ token?: string; error?: string }>;
}) {
	const { token, error } = await searchParams;
	return <ResetPasswordForm token={error ? null : (token ?? null)} />;
}
