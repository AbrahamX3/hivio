export type UserSession = {
	id: string;
	username: string | null;
	avatar: string | null;
	email: string;
	status: "FINISHED" | "PENDING" | "WATCHING" | "UNFINISHED";
	name: string;
	total_followers: number;
	total_following: number;
	followers: Follower[];
	following: Follow[];
};

export type Follower = {
	follower: {
		username: string | null;
		avatar: string | null;
		name: string;
	};
};

export type Follow = {
	followed: {
		avatar: string | null;
		name: string;
		username: string | null;
	};
};
