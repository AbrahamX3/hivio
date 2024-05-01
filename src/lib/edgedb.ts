import { env } from "@/env";
import createAuth from "@edgedb/auth-nextjs/app";
import { createClient } from "edgedb";

export const db = createClient({
  // Note: when developing locally you will need to set tls security to
  // insecure, because the development server uses self-signed certificates
  // which will cause api calls with the fetch api to fail.
  tlsSecurity: process.env.NODE_ENV === "development" ? "insecure" : undefined,
});

export const auth = createAuth(db, {
  baseUrl: env.NEXT_PUBLIC_BASE_URL,
  authRoutesPath: "/api/auth",
});
