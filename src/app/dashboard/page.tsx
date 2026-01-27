import {
  fetchAuthAction,
  isAuthenticated,
  preloadAuthQuery,
} from "@/lib/auth-server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import View from "./_components/view";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Manage your watch history and track your favorite movies and series",
};

export default async function DashboardIndex() {
  const session = await isAuthenticated();

  if (!session) {
    redirect("/auth/sign-in");
  }

  const [dashboardDataPreloaded, trendingTitles] = await Promise.all([
    preloadAuthQuery(api.history.getDashboardData, {}),
    fetchAuthAction(api.tmdb.getUserTrendingTitles, {
      limit: 5,
    }),
  ]);

  return (
    <View
      dashboardDataPreloaded={dashboardDataPreloaded}
      trendingTitles={trendingTitles}
    />
  );
}
