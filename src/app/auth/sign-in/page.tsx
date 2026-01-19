import SignInForm from "@/components/sign-in-form";
import { isAuthenticated } from "@/lib/auth-server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign In | Hivio",
  description: "Sign in to your Hivio account to manage your watch history",
};

export default async function SignIn() {
  const session = await isAuthenticated();

  if (session) {
    redirect("/dashboard");
  }

  return <SignInForm />;
}
