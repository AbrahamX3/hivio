import type { AppContext } from "./procedures";
import { historyRouter } from "./routers/history";
import { titleRouter } from "./routers/title";
import { tmdbRouter } from "./routers/tmdb";
import { userRouter } from "./routers/user";

export const router = {
	history: historyRouter,
	user: userRouter,
	title: titleRouter,
	tmdb: tmdbRouter,
};

export type AppRouter = typeof router;
export type { AppContext };
