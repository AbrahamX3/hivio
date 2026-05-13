import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const historyStatusEnum = pgEnum("history_status", [
	"FINISHED",
	"WATCHING",
	"PLANNED",
	"ON_HOLD",
	"DROPPED",
	"REWATCHING",
]);

export const mediaTypeEnum = pgEnum("media_type", ["MOVIE", "SERIES"]);

export const users = pgTable("users", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	defaultStatus: historyStatusEnum("status"),
});

export const sessions = pgTable(
	"sessions",
	{
		id: text("id").primaryKey(),
		expiresAt: timestamp("expires_at").notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(table) => [index("sessions_userId_idx").on(table.userId)],
);

export const accounts = pgTable(
	"accounts",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("accounts_userId_idx").on(table.userId),
		index("accounts_provider_account_idx").on(
			table.providerId,
			table.accountId,
		),
	],
);

export const verifications = pgTable(
	"verifications",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("verifications_identifier_idx").on(table.identifier)],
);

export const titles = pgTable(
	"titles",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => uuidv7()),
		tmdbId: integer("tmdb_id").notNull(),
		imdbId: varchar("imdb_id", { length: 20 }).notNull(),
		name: varchar("name", { length: 500 }).notNull(),
		mediaType: mediaTypeEnum("media_type").notNull(),
		posterUrl: text("poster_url"),
		backdropUrl: text("backdrop_url"),
		description: text("description"),
		directors: text("directors").array(),
		releaseDate: varchar("release_date", { length: 20 }),
		genres: integer("genres").array(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at"),
	},
	(table) => [
		index("by_tmdb_id").on(table.tmdbId),
		index("by_imdb_id").on(table.imdbId),
		index("by_tmdb_id_media_type").on(table.tmdbId, table.mediaType),
	],
);

export const history = pgTable(
	"history",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => uuidv7()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		titleId: text("title_id")
			.notNull()
			.references(() => titles.id, { onDelete: "cascade" }),
		status: historyStatusEnum("status").notNull(),
		currentEpisode: integer("current_episode"),
		currentSeason: integer("current_season"),
		currentRuntime: integer("current_runtime"),
		isFavourite: boolean("is_favourite").default(false).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at"),
	},
	(table) => [
		index("by_user_id").on(table.userId),
		index("by_title_id").on(table.titleId),
		index("by_user_id_title_id").on(table.userId, table.titleId),
		index("by_user_id_and_status").on(table.userId, table.status),
		index("by_user_id_and_is_favourite").on(table.userId, table.isFavourite),
		index("by_user_id_status_is_favourite").on(
			table.userId,
			table.status,
			table.isFavourite,
		),
		index("history_user_created_at_idx").on(table.userId, table.createdAt),
		index("history_user_status_updated_at_idx").on(
			table.userId,
			table.status,
			table.updatedAt,
		),
	],
);

export const historyAuditLog = pgTable(
	"history_audit_log",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => uuidv7()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		historyId: text("history_id")
			.notNull()
			.references(() => history.id, { onDelete: "cascade" }),
		titleId: text("title_id")
			.notNull()
			.references(() => titles.id, { onDelete: "cascade" }),
		changedField: text("changed_field").notNull(),
		oldValue: text("old_value"),
		newValue: text("new_value"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("audit_user_id_idx").on(table.userId),
		index("audit_user_created_at_idx").on(table.userId, table.createdAt),
	],
);

export const userRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	accounts: many(accounts),
	history: many(history),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id],
	}),
}));

export const accountRelations = relations(accounts, ({ one }) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id],
	}),
}));

export const titlesRelations = relations(titles, ({ many }) => ({
	history: many(history),
}));

export const historyRelations = relations(history, ({ one, many }) => ({
	user: one(users, {
		fields: [history.userId],
		references: [users.id],
	}),
	title: one(titles, {
		fields: [history.titleId],
		references: [titles.id],
	}),
	auditLogs: many(historyAuditLog),
}));

export const historyAuditLogRelations = relations(
	historyAuditLog,
	({ one }) => ({
		user: one(users, {
			fields: [historyAuditLog.userId],
			references: [users.id],
		}),
		history: one(history, {
			fields: [historyAuditLog.historyId],
			references: [history.id],
		}),
		title: one(titles, {
			fields: [historyAuditLog.titleId],
			references: [titles.id],
		}),
	}),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;

export type Title = typeof titles.$inferSelect;
export type NewTitle = typeof titles.$inferInsert;
export type History = typeof history.$inferSelect;
export type NewHistory = typeof history.$inferInsert;
export type HistoryAuditLog = typeof historyAuditLog.$inferSelect;
export type NewHistoryAuditLog = typeof historyAuditLog.$inferInsert;

export type HistoryStatus =
	| "FINISHED"
	| "WATCHING"
	| "PLANNED"
	| "ON_HOLD"
	| "DROPPED"
	| "REWATCHING";

export type MediaType = "MOVIE" | "SERIES";
