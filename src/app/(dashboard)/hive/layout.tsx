import DashboardAvatar from "@/components/avatar";
import UsersSearchInput from "@/components/user-search/users-search-input";
import { TitleDetailsProvider } from "@/context/title-details-context";
import { getUser } from "@/lib/auth";
import { auth } from "@/lib/edgedb";

import DashboardBreadcrumb from "../_components/breadcrumb";
import MobileNavbar from "../_components/mobile-navbar";
import { ProfileSetup } from "../_components/profile-setup";
import DashboardSiderbar from "../_components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="fixed left-0 top-0 hidden h-screen border-r md:flex md:w-60">
        <DashboardSiderbar user={user} />
      </aside>
      <div className="flex flex-1 flex-col md:ml-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/40 px-4 backdrop-blur-md">
          <MobileNavbar user={user} />
          <div className="w-full flex-1">
            <UsersSearchInput />
          </div>
          <DashboardAvatar user={user} signOutUrl={auth.getSignoutUrl()} />
        </header>
        <main className="flex-1 overflow-y-auto bg-background p-4">
          {!user.username ? (
            <main className="flex flex-1 flex-col items-center justify-center py-4">
              <ProfileSetup user={user} />
            </main>
          ) : (
            <div className="flex h-full flex-1 flex-col gap-4 overflow-y-auto">
              <DashboardBreadcrumb />
              <TitleDetailsProvider>{children}</TitleDetailsProvider>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
