import { auth } from "@/lib/edgedb";
import e from "@edgedb/edgeql-js";
import { redirect } from "next/navigation";

export async function isUserSignedIn() {
  const session = auth.getSession();
  const isSignedIn = await session.isSignedIn();

  return isSignedIn;
}

export async function verifyUser() {
  const session = auth.getSession();
  const isSignedIn = await session.isSignedIn();

  if (!isSignedIn) {
    redirect("/auth/signin");
  }

  return isSignedIn;
}

export async function getUser() {
  const session = auth.getSession();

  const user = await e
    .select(e.global.CurrentUser, () => ({
      id: true,
      username: true,
      avatar: true,
    }))
    .run(session.client);

  return {
    id: user?.id,
    username: user?.username,
    avatar: user?.avatar,
  };
}
