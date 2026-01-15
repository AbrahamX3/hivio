import SignInForm from "@/components/sign-in-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Hivio",
  description: "Sign in to your Hivio account to manage your watch history",
};

export default function SignIn() {
  return <SignInForm />;
}
