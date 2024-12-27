import Link from "next/link";

import HiveAvatar from "@/components/avatar";
import LogoFull from "@/components/icons";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { auth } from "@/lib/edgedb";

export default async function Header() {
	const user = await getSession();

	return (
		<header className="w-full bg-primary text-black">
			<nav className="container flex h-14 justify-between gap-4 bg-primary px-5 py-8 align-middle">
				<Link className="flex items-center justify-start" href="/">
					<LogoFull className="h-6 w-auto sm:h-8" />
				</Link>
				<div className="flex items-center gap-4 align-middle">
					<Link
						className="font-semibold text-lg underline-offset-4 hover:underline"
						href="/#features"
					>
						Features
					</Link>
					<Link
						className="font-semibold text-lg underline-offset-4 hover:underline"
						href="/about"
					>
						About
					</Link>
					<Button variant="secondary" asChild>
						{user === null ? (
							<Link href="/auth/signin">Sign In</Link>
						) : (
							<HiveAvatar user={user} signOutUrl={auth.getSignoutUrl()} />
						)}
					</Button>
				</div>
			</nav>
		</header>
	);
}
