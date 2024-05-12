import DashboardAvatar from "@/components/avatar";
import { TitleDetailsProvider } from "@/context/title-details-context";
import { getUser } from "@/lib/auth";
import { auth } from "@/lib/edgedb";

import DashboardBreadcrumb from "../_components/breadcrumb";
import MobileNavbar from "../_components/mobile-navbar";
import { ProfileSetup } from "../_components/profile-setup";
import DashboardSiderbar from "../_components/sidebar";
import UsersSearchInput from "../_components/users-search-input";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <DashboardSiderbar username={user.username} />
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        {!user.username ? (
          <main className="flex flex-1 flex-col items-center justify-center">
            <ProfileSetup user={user} />
          </main>
        ) : (
          <>
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background p-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
              <MobileNavbar username={user.username} />
              <DashboardBreadcrumb />
              <UsersSearchInput />
              <DashboardAvatar user={user} signOutUrl={auth.getSignoutUrl()} />
            </header>
            <TitleDetailsProvider>{children}</TitleDetailsProvider>
          </>
        )}
      </div>
    </div>
  );
}
