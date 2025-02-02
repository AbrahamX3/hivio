import e from "@edgedb/edgeql-js";

export const selectHiveQuery = e.select(e.Hive, (hive) => ({
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

export const selectTitleMetadataByIdQuery = e.params(
	{
		titleId: e.uuid,
	},
	({ titleId }) => {
		return e.select(e.Hive, (hive) => ({
			title: {
				name: true,
			},
			status: true,
			filter_single: e.op(
				e.op(hive.id, "=", titleId),
				"and",
				e.op(hive.addedBy.id, "=", e.global.CurrentUser.id),
			),
		}));
	},
);

export const selectTitleByIdQuery = e.params(
	{
		titleId: e.uuid,
	},
	({ titleId }) => {
		return e.select(e.Hive, (hive) => ({
			...e.Hive["*"],
			title: {
				...e.Title["*"],
				seasons: {
					...e.Season["*"],
					episodes: {
						...e.Episode["*"],
					},
				},
			},
			filter_single: e.op(
				e.op(hive.id, "=", titleId),
				"and",
				e.op(hive.addedBy.id, "=", e.global.CurrentUser.id),
			),
		}));
	},
);
