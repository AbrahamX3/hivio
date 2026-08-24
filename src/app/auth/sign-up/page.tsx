import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import SignUpForm from "@/components/sign-up-form";
import { auth } from "@/server/auth";

export const metadata: Metadata = {
	title: "Sign Up",
	description: "Create a Hivio account to start tracking your watch history",
};

export const instant = false;

export default async function SignUp() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (session) {
		redirect("/dashboard");
	}

	return <SignUpForm />;
}
