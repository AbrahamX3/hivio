"use server";

import e from "@edgedb/edgeql-js";
import { redirect } from "next/navigation";

import { auth } from "@/lib/edgedb";

export async function isUserSignedIn() {
	const session = auth.getSession();
	const isSignedIn = await session.isSignedIn();

	return isSignedIn;
}

export async function verifyUser() {
	const session = auth.getSession();
	const isSignedIn = await session.isSignedIn();

	if (!isSignedIn) {
		redirect("/auth/signin");
	}

	return isSignedIn;
}

export async function getUser() {
	const session = auth.getSession();

	const user = await e
		.select(e.global.CurrentUser, (user) => ({
			id: true,
			username: true,
			avatar: true,
			email: true,
			status: true,
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
		}))
		.run(session.client);

	if (!user) {
		redirect("/auth/signin");
	}

	return {
		id: user.id,
		username: user.username,
		avatar: user.avatar,
		email: user.email,
		status: user.status,
		name: user.name,
		total_followers: user.total_followers,
		total_following: user.total_following,
		followers: user.followers,
		following: user.following,
	};
}

export async function getUserSession() {
	const session = auth.getSession();

	const user = await e
		.select(e.global.CurrentUser, (user) => ({
			id: true,
			username: true,
			avatar: true,
			email: true,
			status: true,
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
		}))
		.run(session.client);

	if (!user) {
		return null;
	}

	return {
		id: user.id,
		username: user.username,
		avatar: user.avatar,
		email: user.email,
		status: user.status,
		name: user.name,
		total_followers: user.total_followers,
		total_following: user.total_following,
		followers: user.followers,
		following: user.following,
	};
}

export async function signOutUser() {
	const url = auth.getSignoutUrl();
	await fetch(url);
}
