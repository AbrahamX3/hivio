"use client";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";

import SignIn from "@/app/auth/sign-in/page";
import { Skeleton } from "@/components/ui/skeleton";
import UserMenu from "@/components/user-menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Authenticated>
        <div className="min-h-screen max-w-full overflow-x-hidden">
          <header className="border-b">
            <div className="mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <UserMenu />
              </div>
            </div>
          </header>
          <main className="container mx-auto max-w-full overflow-x-hidden px-4 py-6">
            {children}
          </main>
        </div>
      </Authenticated>
      <Unauthenticated>
        <SignIn />
      </Unauthenticated>
      <AuthLoading>
        <div className="flex min-h-screen items-center justify-center">
          <div className="space-y-4 text-center">
            <Skeleton className="mx-auto h-8 w-32" />
            <Skeleton className="mx-auto h-4 w-48" />
          </div>
        </div>
      </AuthLoading>
    </>
  );
}
