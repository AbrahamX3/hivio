import { auth } from "@/lib/edgedb";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const providerInfo = await auth.getProvidersInfo();

  return (
    <main className="my-auto p-8 min-w-[32rem]">
      <h1 className="text-3xl font-semibold mb-6">Sign in</h1>

      <div className="flex gap-[5rem] w-max">
        <div className="flex flex-col gap-4 w-[18rem]">
          <h2 className="text-xl font-semibold">OAuth</h2>

          {searchParams.oauth_error ? (
            <div className="bg-rose-100 text-rose-950 px-4 py-3 rounded-md">
              {searchParams.oauth_error}
            </div>
          ) : null}

          {providerInfo.oauth.length ? (
            providerInfo.oauth.map((provider) => (
              <a
                key={provider.name}
                href={auth.getOAuthUrl(provider.name)}
                className="rounded-lg bg-primary text-black p-3 font-medium shadow-md shrink-0 hover:bg-white hover:scale-[1.03] transition-transform
                flex items-center"
              >
                <span className="ml-3">{provider.display_name}</span>
              </a>
            ))
          ) : (
            <div className="text-slate-500 italic w-[14rem]">
              No OAuth providers configured
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
