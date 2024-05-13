"use server";

import { redirect } from "next/navigation";
import e from "@edgedb/edgeql-js";

import { auth } from "@/lib/edgedb";

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
      email: true,
      status: true,
      name: true,
    }))
    .run(session.client);

  if (!user) {
    redirect("/auth/signin");
  }

  return {
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    email: user.email,
    status: user.status,
    name: user.name,
  };
}

export async function getUserSession() {
  const session = auth.getSession();

  const user = await e
    .select(e.global.CurrentUser, () => ({
      id: true,
      username: true,
      avatar: true,
      email: true,
      status: true,
      name: true,
    }))
    .run(session.client);

  if (!user) {
    return null;
  }

  return JSON.parse(
    JSON.stringify({
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      email: user.email,
      status: user.status,
      name: user.name,
    }),
  );
}

export async function signOutUser() {
  const url = auth.getSignoutUrl();
  await fetch(url);
}
