import cache from "@convex-dev/action-cache/convex.config.js";
import betterAuth from "@convex-dev/better-auth/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";

import { defineApp } from "convex/server";

const app = defineApp();
app.use(betterAuth);
app.use(cache);
app.use(rateLimiter);

export default app;
