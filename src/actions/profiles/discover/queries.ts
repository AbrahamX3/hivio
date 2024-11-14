import e from "@edgedb/edgeql-js";

export const getUserProfilesQuery = e.params(
	{
		limit: e.int16,
	},
	({ limit }) => {
		return e.select(e.User, (user) => ({
			id: true,
			username: true,
			name: true,
			createdAt: true,
			avatar: true,
			genres: e.select(e.Hive, (hive) => ({
				title: {
					genres: true,
				},
				filter: e.op(hive.addedBy.username, "=", user.username),
			})),
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
			filter: e.op("exists", user.username),
			order_by: [
				{
					expression: user.createdAt,
					direction: e.ASC,
				},
			],
			limit: limit,
		}));
	},
);
