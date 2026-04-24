import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import SignInForm from "@/components/sign-in-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
	title: "Sign In",
	description: "Sign in to your Hivio account to manage your watch history",
};

export default async function SignIn() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session) {
		redirect("/dashboard");
	}

	return <SignInForm />;
}
