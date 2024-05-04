import { auth } from "@/lib/edgedb";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const providerInfo = await auth.getProvidersInfo();

  return (
    <main className="my-auto min-w-[32rem] p-8">
      <h1 className="mb-6 text-3xl font-semibold">Sign in</h1>

      <div className="flex w-max gap-[5rem]">
        <div className="flex w-[18rem] flex-col gap-4">
          <h2 className="text-xl font-semibold">OAuth</h2>

          {searchParams.oauth_error ? (
            <div className="rounded-md bg-rose-100 px-4 py-3 text-rose-950">
              {searchParams.oauth_error}
            </div>
          ) : null}

          {providerInfo.oauth.length ? (
            providerInfo.oauth.map((provider) => (
              <a
                key={provider.name}
                href={auth.getOAuthUrl(provider.name)}
                className="flex shrink-0 items-center rounded-lg bg-primary p-3 font-medium text-black shadow-md transition-transform
                hover:scale-[1.03] hover:bg-white"
              >
                <span className="ml-3">{provider.display_name}</span>
              </a>
            ))
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
