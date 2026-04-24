import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";

import type { router } from "@/server/router";

const link = new RPCLink({
	url: `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/rpc`,
	headers: async () => {
		if (typeof window !== "undefined") {
			return {};
		}

		// Server-side: forward cookies for auth
		const { cookies } = await import("next/headers");
		const cookieStore = await cookies();
		return {
			cookie: cookieStore.toString(),
		};
	},
});

// Create properly typed client
export const client: RouterClient<typeof router> = createORPCClient(link);
