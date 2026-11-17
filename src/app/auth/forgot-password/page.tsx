import type { Metadata } from "next";

import ForgotPasswordForm from "@/components/forgot-password-form";

export const metadata: Metadata = {
	title: "Forgot Password",
	description: "Request a password reset link for your Hivio account",
};

export const instant = false;

export default function ForgotPasswordPage() {
	return <ForgotPasswordForm />;
}
