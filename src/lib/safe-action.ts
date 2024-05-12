import { createSafeActionClient } from "next-safe-action";

import { auth } from "./edgedb";

export const action = createSafeActionClient();

export const authAction = createSafeActionClient({
  async middleware() {
    const isSignedIn = await auth.getSession().isSignedIn();

    if (!isSignedIn) {
      throw new Error("Session not found!");
    }

    return isSignedIn;
  },
});
