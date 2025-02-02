"use server";

import e, { type $infer } from "@edgedb/edgeql-js";
import { TitleType } from "@edgedb/edgeql-js/modules/default";
import { decode, encode } from "blurhash";
import { createCanvas, loadImage } from "canvas";
import { revalidatePath } from "next/cache";

import { env } from "@/env";
import { auth } from "@/lib/edgedb";
import {
	withAuthActionClient,
	withoutAuthActionClient,
} from "@/lib/safe-action";
import type { MovieDetails, MultiSearch, SeriesDetails } from "@/types/tmdb";

import { redis } from "@/lib/redis";
import { Ratelimit } from "@upstash/ratelimit";
import {
	DeleteTitleFromHiveSchema,
	FindTitleDetails,
	ProfileSetupFormSchema,
	RefreshTitleDataSchema,
} from "./validations";

const ratelimit = new Ratelimit({
	redis: redis,
	limiter: Ratelimit.slidingWindow(2, "60 s"),
	prefix: "hivio",
});

export const profileOnboarding = withAuthActionClient
	.schema(ProfileSetupFormSchema)
	.action(async ({ parsedInput: { username, name, status } }) => {
		const client = auth.getSession().client;

		const user = await e
			.select(e.User, (user) => ({
				username: true,
				filter: e.op(user.username, "=", username),
			}))
			.run(client);

		if (user.length > 0) {
			return {
				success: false,
				error: {
					reason: "Username already taken, please try another one!",
				},
			};
		}

		await e
			.update(e.User, (user) => ({
				filter: e.op(user.email, "=", e.global.CurrentUser.email),
				set: {
					username: e.str_trim(username.toLocaleLowerCase()),
					name: e.str_trim(name),
					status: status,
				},
			}))
			.run(client);

		revalidatePath("/app");
		return { success: true, data: { username } };
	});

export const refreshTitleData = withAuthActionClient
	.schema(RefreshTitleDataSchema)
	.action(async ({ parsedInput: { id }, ctx: { session } }) => {
		const client = auth.getSession().client;

		const titleData = await e
			.select(e.Hive, (hive) => ({
				title: {
					tmdbId: true,
					type: true,
				},
				filter_single: e.op(
					e.op(hive.id, "=", e.uuid(id)),
					"and",
					e.op(hive.addedBy.id, "=", e.global.CurrentUser.id),
				),
			}))
			.run(client);

		if (!titleData) return { success: false };

		await updateTitle({
			tmdbId: titleData?.title.tmdbId,
			type: titleData?.title.type,
			userId: session?.id,
		});

		revalidatePath(`/app/${id}`);

		return { success: true };
	});

export const deleteTitle = withAuthActionClient
	.schema(DeleteTitleFromHiveSchema)
	.action(async ({ parsedInput: { id } }) => {
		const client = auth.getSession().client;

		const deleteTitle = await e
			.delete(e.Hive, (hive) => ({
				filter_single: e.op(
					e.op(hive.id, "=", e.uuid(id)),
					"and",
					e.op(hive.addedBy.id, "=", e.global.CurrentUser.id),
				),
			}))
			.run(client);

		revalidatePath("/app");
		return { success: true, data: { id: deleteTitle?.id } };
	});

export async function searchTitle({ query }: { query: string }) {
	try {
		const url = new URL("https://api.themoviedb.org/3/search/multi");
		url.searchParams.append("query", query);
		url.searchParams.append("include_adult", "false");

		const response = await fetch(url, {
			method: "GET",
			headers: {
				Accept: "application/json",
				Authorization: `Bearer ${env.TMDB_API_KEY}`,
			},
		});

		const data = (await response.json()) as MultiSearch;

		if (!response.ok) {
			throw new Error("Failed to search title");
		}

		return data;
	} catch (error) {
		console.error(error);
	}
}

async function generateBlurHashBase64(
	blurhash: string,
	width = 32,
	height = 32,
): Promise<string> {
	const pixels = decode(blurhash, width, height);

	const canvas = createCanvas(width, height);
	const context = canvas.getContext("2d");

	const imageData = context.createImageData(width, height);
	imageData.data.set(pixels);
	context.putImageData(imageData, 0, 0);

	const base64DataUrl = canvas.toDataURL();
	return base64DataUrl;
}

async function generateBlurHash(imagePath: Buffer): Promise<string> {
	const image = await loadImage(imagePath);

	const width = 32; // Width to resize for encoding, for a reasonable balance of quality and performance
	const height = Math.floor((image.height / image.width) * width);

	// Create a canvas and draw the resized image
	const canvas = createCanvas(width, height);
	const context = canvas.getContext("2d");
	context.drawImage(image, 0, 0, width, height);

	// Get pixel data from the canvas
	const imageData = context.getImageData(0, 0, width, height);
	const pixels = imageData.data;

	// Encode the BlurHash with desired components for horizontal and vertical
	const blurHash = encode(new Uint8ClampedArray(pixels), width, height, 4, 3);

	return blurHash;
}

export async function fetchPosterBlur(path: string) {
	const buffer = await fetch(path).then(async (res) =>
		Buffer.from(await res.arrayBuffer()),
	);

	const blurhash = await generateBlurHash(buffer);
	const base64 = await generateBlurHashBase64(blurhash);

	return base64;
}

export interface SeasonData {
	season: number;
	episodes: number;
	date: string;
}

export async function fetchSeriesData(tmdbId: number): Promise<SeasonData[]> {
	const response = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}`, {
		method: "GET",
		headers: {
			Accept: "application/json",
			Authorization: `Bearer ${env.TMDB_API_KEY}`,
		},
	});

	const data = (await response.json()) as SeriesDetails;

	if (!response.ok) {
		throw new Error("Failed to fetch series data");
	}

	const seasons = data.seasons
		.map((details) => ({
			season: details.season_number,
			episodes: details.episode_count,
			date: details.air_date,
		}))
		.filter((season) => season.season !== 0);

	return seasons;
}

export async function fetchMovieDetails(tmdbId: number): Promise<MovieDetails> {
	const response = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}`, {
		method: "GET",
		headers: {
			Accept: "application/json",
			Authorization: `Bearer ${env.TMDB_API_KEY}`,
		},
	});

	const data = (await response.json()) as MovieDetails;

	if (!response.ok) {
		throw new Error("Failed to fetch movie details");
	}

	return data;
}

export const findTitleDetails = withoutAuthActionClient
	.schema(FindTitleDetails)
	.action(async ({ parsedInput: { tmdbId, type } }) => {
		const result = await fetch(
			`https://api.themoviedb.org/3/${type}/${tmdbId}`,
			{
				method: "GET",
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${env.TMDB_API_KEY}`,
				},
			},
		);

		if (!result.ok) {
			throw new Error("Failed to fetch title details");
		}

		if (type === "tv") {
			const data = (await result.json()) as SeriesDetails;

			const newData = { ...data, mediaType: "series" } as SeriesDetails & {
				mediaType: "series";
			};
			return newData;
		}

		const data = (await result.json()) as MovieDetails;

		return { ...data, mediaType: "movie" } as MovieDetails & {
			mediaType: "movie";
		};
	});

export async function updateTitle({
	tmdbId,
	type,
	userId,
}: {
	tmdbId: number;
	type: "MOVIE" | "SERIES";
	userId: string;
}) {
	const { success, remaining } = await ratelimit.limit(userId);

	if (!success) {
		throw new Error(
			`You have reached your rate limit. Please try again in ${remaining} seconds.`,
		);
	}

	const titleDetails = await findTitleDetails({
		tmdbId,
		type: type === "MOVIE" ? "movie" : "tv",
	});

	const data = titleDetails?.data;

	if (!data) {
		throw new Error("Failed to fetch title details");
	}

	const TypeEnum = type === "MOVIE" ? TitleType.MOVIE : TitleType.SERIES;
	const name = data.mediaType === "movie" ? data.title : data.name;
	const release_date =
		data.mediaType === "movie" ? data.release_date : data.first_air_date;
	const { overview, poster_path } = data;
	const genre_ids = data.genres.map((genre) => genre.id);
	const posterBlurhash = await fetchPosterBlur(
		`https://image.tmdb.org/t/p/original${poster_path}`,
	);

	const client = auth.getSession().client;

	const updatedTitle = await e
		.update(e.Title, (title) => ({
			filter_single: e.op(
				e.op(title.tmdbId, "=", e.int32(tmdbId)),
				"and",
				e.op(title.type, "=", TypeEnum),
			),
			set: {
				name: e.str(name),
				description: e.str(overview),
				release_date: e.cal.local_date(release_date),
				poster: e.str(poster_path),
				posterBlur: posterBlurhash,
				runtime: data.mediaType === "movie" ? e.int32(data.runtime) : undefined,
				rating: data.vote_average ? e.float32(data.vote_average) : undefined,
				genres: genre_ids,
			},
		}))
		.run(client);

	if (data.mediaType === "series" && updatedTitle?.id) {
		const titleId = e.select(e.Title, (title) => ({
			filter_single: e.op(title.id, "=", e.uuid(updatedTitle.id)),
		}));

		const validSeasons = data.seasons
			.filter(
				(season) =>
					season.season_number !== 0 &&
					season.episode_count !== 0 &&
					season.air_date !== null,
			)
			.map((details) => ({
				season: details.season_number,
				episodes: details.episode_count,
				date: details.air_date,
			}));

		const currentSeasons = await e
			.select(e.Season, (season) => ({
				season_number: true,
				total_episodes: true,
				filter: e.op(season.title.id, "=", e.uuid(updatedTitle.id)),
			}))
			.run(client);

		const episodeCountToUpdate: {
			season: number;
			episodes: number;
			date: string;
		}[] = [];

		const seasonsToAdd: { season: number; episodes: number; date: string }[] =
			[];

		if (!currentSeasons) return;

		for (const validSeason of validSeasons) {
			const isSeasonAdded = currentSeasons.some(
				(s) => s.season_number === validSeason.season,
			);

			const isEpisodeCorrect = currentSeasons.some(
				(s) =>
					s.season_number === validSeason.season &&
					s.total_episodes === validSeason.episodes,
			);

			if (!isSeasonAdded) {
				seasonsToAdd.push({
					season: validSeason?.season,
					episodes: validSeason?.episodes,
					date: validSeason?.date,
				});

				continue;
			}

			if (!isEpisodeCorrect) {
				episodeCountToUpdate.push({
					season: validSeason?.season,
					episodes: validSeason?.episodes,
					date: validSeason?.date,
				});
			}
		}

		const insertQuery = e.params(
			{
				seasons: e.array(
					e.tuple({
						season: e.int32,
						episodes: e.int32,
						date: e.str,
					}),
				),
			},
			({ seasons }) => {
				return e.for(e.array_unpack(seasons), ({ date, season, episodes }) => {
					return e.insert(e.Season, {
						title: e.set(titleId),
						season_number: season,
						total_episodes: episodes,
						air_date: e.cast(e.cal.local_date, date),
					});
				});
			},
		);

		const updateQuery = e.params(
			{
				seasons: e.array(
					e.tuple({
						season: e.int32,
						episodes: e.int32,
						date: e.str,
					}),
				),
			},
			({ seasons }) => {
				return e.for(e.array_unpack(seasons), ({ date, season, episodes }) => {
					return e.update(e.Season, (s) => ({
						filter_single: e.op(
							e.op(s.season_number, "=", season),
							"and",
							e.op(s.title.id, "=", e.uuid(updatedTitle.id)),
						),
						set: {
							air_date: e.cast(e.cal.local_date, date),
							total_episodes: episodes,
						},
					}));
				});
			},
		);

		await insertQuery.run(client, {
			seasons: seasonsToAdd,
		});

		await updateQuery.run(client, {
			seasons: episodeCountToUpdate,
		});
	}

	return { success: true, data: updatedTitle?.id };
}

export async function getIMDBId(tmdbId: number, type: "MOVIE" | "SERIES") {
	const media_type = type === "MOVIE" ? "movie" : "tv";
	const url = `https://api.themoviedb.org/3/${media_type}/${tmdbId}/external_ids`;

	const resposne = await fetch(url, {
		method: "GET",
		headers: {
			Accept: "application/json",
			Authorization: `Bearer ${env.TMDB_API_KEY}`,
		},
	});

	if (!resposne.ok) {
		return null;
	}

	const data = (await resposne.json()) as {
		id: string;
		imdb_id: string;
	};

	return data.imdb_id;
}

export type HiveData = $infer<typeof getHiveDataQuery>;

const getHiveDataQuery = e.select(e.Hive, (hive) => ({
	...e.Hive["*"],
	title: {
		...e.Title["*"],
		seasons: {
			...e.Season["*"],
		},
	},
	order_by: [
		{
			expression: hive.createdAt,
			direction: e.DESC,
		},
	],
	filter: e.op(hive.addedBy.id, "=", e.global.CurrentUser.id),
}));

export async function getHiveData() {
	const client = auth.getSession().client;

	return await getHiveDataQuery.run(client);
}
