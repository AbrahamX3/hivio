import e from "@edgedb/edgeql-js";

export const getUserHiveProfileByUsernameQuery = e.params(
	{
		username: e.str,
	},
	({ username }) => {
		return e.select(e.Hive, (hive) => ({
			...e.Hive["*"],
			title: {
				...e.Title["*"],
				seasons: {
					...e.Season["*"],
				},
			},
			order_by: [
				{
					expression: hive.updatedAt,
					direction: e.DESC,
				},
				{
					expression: hive.createdAt,
					direction: e.DESC,
				},
			],
			filter: e.op(hive.addedBy.username, "=", username),
		}));
	},
);

export const getUserProfileQuery = e.params(
	{
		username: e.str,
	},
	({ username }) => {
		return e.select(e.User, (user) => ({
			avatar: true,
			username: true,
			name: true,
			total_followers: e.count(user.followers),
			total_following: e.count(user.following),
			followers: e.select(e.Follow, (follow) => ({
				follower: {
					username: true,
					avatar: true,
					name: true,
				},
				filter: e.op(follow.followed.username, "=", user.username),
			})),
			following: e.select(e.Follow, (follow) => ({
				followed: {
					username: true,
					avatar: true,
					name: true,
				},
				filter: e.op(follow.follower.username, "=", user.username),
			})),
			createdAt: true,
			filter_single: e.op(user.username, "=", username),
		}));
	},
);

export const getUserDetailsQuery = e.params(
	{
		username: e.str,
	},
	({ username }) => {
		return e.select(e.User, (user) => ({
			username: true,
			name: true,
			avatar: true,
			filter_single: e.op(user.username, "=", username),
		}));
	},
);
