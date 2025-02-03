import UsersSearchInput from "@/components/user-search/users-search-input";
import { TitleDetailsProvider } from "@/context/title-details-context";
import { getUser } from "@/lib/auth";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ProfileSetup } from "../_components/profile-setup";

import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/edgedb";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await getUser();

	if (!user) {
		return null;
	}

	return (
		<SidebarProvider>
			<AppSidebar user={user} signOutUrl={auth.getSignoutUrl()} />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger size="lg" variant="outline" className="h-10 w-10" />
						<Separator orientation="vertical" className="mx-2 h-4" />
						<UsersSearchInput />
					</div>
				</header>

				{!user.username ? (
					<main className="flex flex-1 flex-col">
						<div className="flex-1 overflow-y-auto bg-background p-4">
							<div className="flex flex-1 flex-col items-center justify-center py-4">
								<ProfileSetup user={user} />
							</div>
						</div>
					</main>
				) : (
					<TitleDetailsProvider>{children}</TitleDetailsProvider>
				)}
			</SidebarInset>
		</SidebarProvider>
	);
}
