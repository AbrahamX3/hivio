"use server";

import e, { type $infer } from "@edgedb/edgeql-js";
import { TitleType } from "@edgedb/edgeql-js/modules/default";
import { decode, encode } from "blurhash";
import { createCanvas, loadImage } from "canvas";
import { revalidatePath } from "next/cache";

import { env } from "@/env";
import { auth } from "@/lib/edgedb";
import { actionClient, authAction } from "@/lib/safe-action";
import type { MovieDetails, MultiSearch, SeriesDetails } from "@/types/tmdb";

import {
	AddTitleToHiveSchema,
	DeleteTitleFromHiveSchema,
	FindTitleDetails,
	FindTitleSeasonsSchema,
	ProfileSetupFormSchema,
	RefreshTitleDataSchema,
} from "./validations";

export const profileOnboarding = authAction
	.schema(ProfileSetupFormSchema)
	.action(
		async ({ parsedInput: { username, name, status } }) => {
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

			revalidatePath("/hive");
			return { success: true, data: { username } };
		},
		{
			onSuccess: () => {
				console.log("Successfully updated user profile");
			},
		},
	);

export const refreshTitleData = authAction
	.schema(RefreshTitleDataSchema)
	.action(async ({ parsedInput: { id } }) => {
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
		});

		revalidatePath(`/hive/${id}`);

		return { success: true };
	});

export const deleteTitle = authAction.schema(DeleteTitleFromHiveSchema).action(
	async ({ parsedInput: { id } }) => {
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

		revalidatePath("/hive");
		return { success: true, data: { id: deleteTitle?.id } };
	},
	{
		onSuccess: () => {
			console.log("Successfully updated user profile");
		},
	},
);

export const findTitleSeasons = authAction
	.schema(FindTitleSeasonsSchema)
	.action(async ({ parsedInput: { tmdbId } }) => {
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

		return { success: true, data: seasons };
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

export const findTitleDetails = actionClient
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

async function updateTitle({
	tmdbId,
	type,
}: {
	tmdbId: number;
	type: "MOVIE" | "SERIES";
}) {
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

		const seasons = data.seasons
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

		const seasonsAlreadyAdded = await e
			.select(e.Season, (season) => ({
				season: true,
				filter: e.op(season.title, "=", titleId),
			}))
			.run(client);

		const addedSeasonNumbers = seasonsAlreadyAdded.map(
			(season) => season.season,
		);

		const SeasonsToAdd = seasons.filter(
			(season) => !addedSeasonNumbers.includes(season.season),
		);

		const query = e.params(
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
						season: season,
						episodes: episodes,
						air_date: e.cast(e.cal.local_date, date),
					});
				});
			},
		);

		await query.run(client, {
			seasons: SeasonsToAdd,
		});
	}

	return { success: true, data: updatedTitle?.id };
}

export const addTitleHive = authAction
	.schema(AddTitleToHiveSchema)
	.action(async ({ parsedInput: { hiveFormValues, titleFormValues } }) => {
		const client = auth.getSession().client;
		const tmdbId = titleFormValues.tmdbId;
		const TypeEnum =
			titleFormValues.type === "movie" ? TitleType.MOVIE : TitleType.SERIES;
		const isTitleAdded = await e
			.select(e.Title, (title) => ({
				tmdbId: true,
				type: true,
				updatedAt: true,
				filter_single: e.op(
					e.op(title.tmdbId, "=", e.int32(tmdbId)),
					"and",
					e.op(title.type, "=", TypeEnum),
				),
			}))
			.run(client);

		if (!isTitleAdded?.tmdbId) {
			const titleDetails = await findTitleDetails({
				tmdbId: titleFormValues.tmdbId,
				type: titleFormValues.type,
			});

			const data = titleDetails?.data;

			if (!data) {
				throw new Error("Failed to fetch title details");
			}

			const name = data?.mediaType === "movie" ? data.title : data.name;
			const date =
				data.mediaType === "movie" ? data.release_date : data.first_air_date;
			const type = data.mediaType === "movie" ? "MOVIE" : "SERIES";
			const { overview, id, poster_path } = data;
			const genre_ids = data.genres.map((genre) => genre.id);
			const imdbId = await getIMDBId(id, type);
			const posterBlurhash = await fetchPosterBlur(
				`https://image.tmdb.org/t/p/original${poster_path}`,
			);

			const insertTitle = await e
				.insert(e.Title, {
					tmdbId: e.int32(id),
					name: e.str(name),
					description: e.str(overview),
					release_date: e.cal.local_date(date),
					poster: e.str(poster_path),
					posterBlur: posterBlurhash,
					type: TypeEnum,
					runtime:
						data.mediaType === "movie" ? e.int32(data.runtime) : undefined,
					rating: data.vote_average ? e.float32(data.vote_average) : undefined,
					genres: genre_ids,
					imdbId: imdbId ?? undefined,
				})
				.run(client);

			if (data.mediaType === "series") {
				const titleId = e.select(e.Title, (title) => ({
					filter_single: e.op(title.id, "=", e.uuid(insertTitle.id)),
				}));

				const query = e.params(
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
						return e.for(
							e.array_unpack(seasons),
							({ date, season, episodes }) => {
								return e.insert(e.Season, {
									title: e.set(titleId),
									season: season,
									episodes: episodes,
									air_date: e.cast(e.cal.local_date, date),
								});
							},
						);
					},
				);

				const seasons = data.seasons
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

				await query.run(client, {
					seasons,
				});
			}
		} else {
			await updateTitle({
				tmdbId: isTitleAdded.tmdbId,
				type: isTitleAdded.type,
			});
		}

		const isTitleInHive = await e
			.select(e.Hive, (hive) => ({
				filter_single: e.op(
					e.op(
						e.op(hive.title.tmdbId, "=", tmdbId),
						"and",
						e.op(hive.title.type, "=", TypeEnum),
					),
					"and",
					e.op(hive.addedBy.id, "=", e.global.CurrentUser.id),
				),
			}))
			.run(client);

		if (isTitleInHive) {
			return {
				success: false,
				error: {
					reason: "Title is already added to your hive!",
				},
			};
		}
		const titleToAdd = e.select(e.Title, (title) => ({
			filter_single: e.op(
				e.op(title.tmdbId, "=", tmdbId),
				"and",
				e.op(title.type, "=", TypeEnum),
			),
		}));

		const status = hiveFormValues.status;

		if (status === "FINISHED") {
			const insert = await e
				.insert(e.Hive, {
					addedBy: e.global.CurrentUser,
					title: titleToAdd,
					status: hiveFormValues.status,
					finishedAt: hiveFormValues.finishedAt
						? hiveFormValues.finishedAt
						: undefined,
					startedAt: hiveFormValues.startedAt
						? hiveFormValues.startedAt
						: undefined,
					currentEpisode: hiveFormValues.currentEpisode,
					currentSeason: hiveFormValues.currentSeason,
					rating: hiveFormValues.rating
						? e.float32(hiveFormValues.rating)
						: undefined,
					isFavorite: e.bool(hiveFormValues.isFavorite ?? false),
				})
				.run(client);

			revalidatePath("/hive");
			return {
				success: true,
				status: hiveFormValues.status,
				data: insert.id,
			};
		}
		if (status === "PENDING") {
			const insert = await e
				.insert(e.Hive, {
					addedBy: e.global.CurrentUser,
					title: titleToAdd,
					currentEpisode: hiveFormValues.currentEpisode,
					startedAt: hiveFormValues.startedAt ? hiveFormValues.startedAt : null,
					currentSeason: hiveFormValues.currentSeason,
					status: hiveFormValues.status,
				})
				.run(client);

			revalidatePath("/hive");
			return {
				success: true,
				status: hiveFormValues.status,
				data: insert.id,
			};
		}
		const insert = await e
			.insert(e.Hive, {
				addedBy: e.global.CurrentUser,
				title: titleToAdd,
				currentEpisode: hiveFormValues.currentEpisode,
				startedAt: hiveFormValues.startedAt ? hiveFormValues.startedAt : null,
				currentSeason: hiveFormValues.currentSeason,
				status: hiveFormValues.status,
				isFavorite: e.bool(hiveFormValues.isFavorite ?? false),
			})
			.run(client);

		revalidatePath("/hive");
		return {
			success: true,
			status: hiveFormValues.status,
			data: insert.id,
		};
	});

async function getIMDBId(tmdbId: number, type: "MOVIE" | "SERIES") {
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
