import { isAuthenticated, preloadAuthQuery } from "@/lib/auth-server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { api } from "../../../convex/_generated/api";
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

  const [allItemsPreloaded, watchingItemsPreloaded] = await Promise.all([
    preloadAuthQuery(api.history.getAllItems, {}),
    preloadAuthQuery(api.history.getWatchingItems, {}),
  ]);

  return (
    <View
      allItemsPreloaded={allItemsPreloaded}
      watchingItemsPreloaded={watchingItemsPreloaded}
    />
  );
}
