import { Link } from "next-view-transitions";

import DashboardAvatar from "@/components/avatar";
import LogoFull from "@/components/icons";
import { Button } from "@/components/ui/button";
import UsersSearchInput from "@/components/user-search/users-search-input";
import { getUserSession } from "@/lib/auth";
import { auth } from "@/lib/edgedb";

import HeaderButton from "./header-button";

export default async function Header() {
	const user = await getUserSession();

	return (
		<header className="w-full bg-primary text-black">
			<nav className="container flex h-14 justify-between gap-4 bg-primary px-5 py-8 align-middle">
				<Link className="flex items-center justify-start" href="/">
					<LogoFull className="h-6 w-auto sm:h-8" />
				</Link>
				<div className="flex items-center gap-2 align-middle sm:gap-4">
					<HeaderButton user={user} />
					<UsersSearchInput />
					<Button variant="secondary" asChild>
						{user === null ? (
							<Link href="/auth/signin">Sign In</Link>
						) : (
							<DashboardAvatar user={user} signOutUrl={auth.getSignoutUrl()} />
						)}
					</Button>
				</div>
			</nav>
		</header>
	);
}
