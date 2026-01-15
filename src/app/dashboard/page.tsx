import { isAuthenticated } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import View from "./_components/view";

export default async function DashboardIndex() {
  const session = await isAuthenticated();

  if (!session) {
    redirect("/auth/sign-in");
  }

  return <View />;
}
