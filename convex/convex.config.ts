import { defineApp } from "convex/server";

import cache from "@convex-dev/action-cache/convex.config.js";
import aggregate from "@convex-dev/aggregate/convex.config.js";
import betterAuth from "@convex-dev/better-auth/convex.config";
import crons from "@convex-dev/crons/convex.config.js";
import migrations from "@convex-dev/migrations/convex.config.js";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";

const app = defineApp();

app.use(betterAuth);
app.use(cache);
app.use(rateLimiter);
app.use(crons);
app.use(migrations);
app.use(aggregate);

export default app;
