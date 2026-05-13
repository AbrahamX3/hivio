import type { AppContext } from "./procedures";
import { analyticsRouter } from "./routers/analytics";
import { historyRouter } from "./routers/history";
import { tmdbRouter } from "./routers/tmdb";
import { userRouter } from "./routers/user";

export const router = {
	analytics: analyticsRouter,
	history: historyRouter,
	user: userRouter,
	tmdb: tmdbRouter,
};

export type AppRouter = typeof router;
export type { AppContext };
