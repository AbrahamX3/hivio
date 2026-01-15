import { isAuthenticated } from "@/lib/auth-server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import View from "./_components/view";

export const metadata: Metadata = {
  title: "Dashboard | Hivio",
  description:
    "Manage your watch history and track your favorite movies and series",
};

export default async function DashboardIndex() {
  const session = await isAuthenticated();

  if (!session) {
    redirect("/auth/sign-in");
  }

  return <View />;
}
