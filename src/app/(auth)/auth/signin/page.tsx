import { Link } from "next-view-transitions";
import { redirect } from "next/navigation";

import LogoFull, { GoogleIcon } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { isUserSignedIn } from "@/lib/auth";
import { auth } from "@/lib/edgedb";
import { cn } from "@/lib/utils";

export const metadata = {
	title: "Sign In",
	description: "Sign in to your hivio account",
};

export default async function SignInPage({
	searchParams,
}: {
	searchParams: Record<string, string | string[] | undefined>;
}) {
	const providerInfo = await auth.getProvidersInfo();
	const isSignedIn = await isUserSignedIn();

	if (isSignedIn) {
		return redirect("/hive");
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-center">
			<Card className="mx-auto max-w-sm">
				<CardHeader className="gap-4">
					<CardTitle className="flex items-center gap-2 align-middle text-2xl">
						Sign In to{" "}
						<Link href="/">
							<LogoFull className="h-6 w-auto text-primary" />
						</Link>
					</CardTitle>
					<CardDescription>
						Sign In to your account with one of the following providers to get
						started
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4">
						{providerInfo.oauth.length ? (
							providerInfo.oauth.map(
								(provider) =>
									provider.name === "builtin::oauth_google" && (
										<a
											key={provider.name}
											href={auth.getOAuthUrl(provider.name)}
											className={cn(
												buttonVariants({ variant: "outline" }),
												"flex w-full items-center justify-between align-middle",
											)}
										>
											<span className="font-semibold">
												Login with {provider.display_name}
											</span>
											<GoogleIcon className="size-5" />
										</a>
									),
							)
						) : (
							<div className="w-[14rem] italic text-slate-500">
								No OAuth providers configured
							</div>
						)}

						{searchParams.oauth_error ? (
							<div className="rounded-md bg-rose-100 px-4 py-3 text-rose-950">
								{searchParams.oauth_error}
							</div>
						) : null}
					</div>
				</CardContent>
			</Card>
		</main>
	);
}
