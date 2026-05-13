import { RPCHandler } from "@orpc/server/fetch";

import { auth } from "@/server/auth";
import type { AppContext } from "@/server/router";
import { router } from "@/server/router";

const handler = new RPCHandler(router);

async function handleRequest(request: Request) {
  // Extract session from auth
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const context: AppContext = session
    ? {
        session: {
          userId: session.user.id,
          sessionId: session.session.id,
          user: {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            image: session.user.image ?? null,
          },
        },
      }
    : { session: null };

  const { response } = await handler.handle(request, {
    prefix: "/rpc",
    context,
  });

  return response ?? new Response("Not found", { status: 404 });
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
