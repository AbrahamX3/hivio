import type { AppContext } from "./procedures";
import { historyRouter } from "./routers/history";
import { tmdbRouter } from "./routers/tmdb";
import { userRouter } from "./routers/user";

export const router = {
	history: historyRouter,
	user: userRouter,
	tmdb: tmdbRouter,
};

export type AppRouter = typeof router;
export type { AppContext };
