import { redirect } from "next/navigation";
import { auth } from "@/lib/edgedb";

export interface GoogleResponse {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}

const { GET, POST } = auth.createAuthRouteHandlers({
  async onOAuthCallback({ isSignUp, tokenData, provider }) {
    if (isSignUp) {
      if (tokenData.provider_token && provider === "builtin::oauth_google") {
        const client = auth.getSession().client;

        const oauthURL = new URL(
          "https://www.googleapis.com/oauth2/v3/userinfo",
        );
        oauthURL.searchParams.set("access_token", tokenData.provider_token);

        const result = await fetch(oauthURL);

        if (!result.ok) {
          throw new Error("Failed to fetch user info");
        }

        const userInfo = (await result.json()) as GoogleResponse;

        await client.query(
          `
          insert User {
            email := <str>$email,
            name := <str>$name,
            avatar := <optional str>$avatar,
            identity := (global ext::auth::ClientTokenIdentity)
          }`,
          {
            email: userInfo.email,
            name: userInfo.name,
            avatar: userInfo.picture,
          },
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
