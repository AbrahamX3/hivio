import { auth } from "@/lib/edgedb";
import { redirect } from "next/navigation";
import { Octokit } from "octokit";

const { GET, POST } = auth.createAuthRouteHandlers({
  async onOAuthCallback({ isSignUp, tokenData, provider }) {
    if (isSignUp) {
      if (tokenData.provider_token && provider === "builtin::oauth_github") {
        const client = auth.getSession().client;

        const { data } = await new Octokit({
          auth: tokenData.provider_token,
        }).request("GET /user");

        await client.query(
          `
          insert User {
            username := <str>$username,
            avatar := <optional str>$avatar,
            identity := (global ext::auth::ClientTokenIdentity)
          }`,
          {
            username: data.login,
            avatar: data.avatar_url,
          }
        );
      }
    }
    redirect("/dashboard");
  },
  onSignout() {
    redirect("/");
  },
});

export { GET, POST };
