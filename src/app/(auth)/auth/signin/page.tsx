import { redirect } from "next/navigation";
import { Link } from "next-view-transitions";

import LogoFull, { GoogleIcon } from "@/components/icons";
import { isUserSignedIn } from "@/lib/auth";
import { auth } from "@/lib/edgedb";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const providerInfo = await auth.getProvidersInfo();
  const isSignedIn = await isUserSignedIn();

  if (isSignedIn) {
    return redirect("/hive");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto max-w-sm space-y-4 rounded-md bg-card p-4 text-card-foreground shadow-sm">
        <div className="flex flex-col items-center justify-center gap-4 rounded-md border-2 border-primary">
          <Link href="/">
            <LogoFull className="size-28 text-primary" />
          </Link>
          <p className="text-balance text-center">
            Start amplyfying your boring watchlist
          </p>
        </div>

        <div className="rounded-md border-2 border-dashed border-primary p-6">
          <div className="space-y-2 pb-6">
            <p className="text-xl font-bold">Sign In</p>
            <p className="text-sm text-foreground">
              Sign in with one of the following providers
            </p>
          </div>
          {searchParams.oauth_error ? (
            <div className="rounded-md bg-rose-100 px-4 py-3 text-rose-950">
              {searchParams.oauth_error}
            </div>
          ) : null}

          {providerInfo.oauth.length ? (
            providerInfo.oauth.map(
              (provider) =>
                provider.name === "builtin::oauth_google" && (
                  <a
                    key={provider.name}
                    href={auth.getOAuthUrl(provider.name)}
                    className="flex shrink-0 items-center justify-between rounded-lg bg-white p-3 font-medium text-black shadow-md
                transition-transform hover:scale-[1.03]"
                  >
                    <span className="font-semibold">
                      {provider.display_name}
                    </span>
                    <GoogleIcon />
                  </a>
                ),
            )
          ) : (
            <div className="w-[14rem] italic text-slate-500">
              No OAuth providers configured
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
