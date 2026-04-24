CREATE TYPE "public"."history_status" AS ENUM('FINISHED', 'WATCHING', 'PLANNED', 'ON_HOLD', 'DROPPED', 'REWATCHING');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('MOVIE', 'SERIES');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title_id" text NOT NULL,
	"status" "history_status" NOT NULL,
	"current_episode" integer,
	"current_season" integer,
	"current_runtime" integer,
	"is_favourite" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "titles" (
	"id" text PRIMARY KEY NOT NULL,
	"tmdb_id" integer NOT NULL,
	"imdb_id" varchar(20) NOT NULL,
	"name" varchar(500) NOT NULL,
	"media_type" "media_type" NOT NULL,
	"poster_url" text,
	"backdrop_url" text,
	"description" text,
	"directors" text[],
	"release_date" varchar(20),
	"genres" integer[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"status" "history_status",
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "history" ADD CONSTRAINT "history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "history" ADD CONSTRAINT "history_title_id_titles_id_fk" FOREIGN KEY ("title_id") REFERENCES "public"."titles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_userId_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "by_user_id" ON "history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "by_title_id" ON "history" USING btree ("title_id");--> statement-breakpoint
CREATE INDEX "by_user_id_title_id" ON "history" USING btree ("user_id","title_id");--> statement-breakpoint
CREATE INDEX "by_user_id_and_status" ON "history" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "by_user_id_and_is_favourite" ON "history" USING btree ("user_id","is_favourite");--> statement-breakpoint
CREATE INDEX "by_user_id_status_is_favourite" ON "history" USING btree ("user_id","status","is_favourite");--> statement-breakpoint
CREATE INDEX "by_status" ON "history" USING btree ("status");--> statement-breakpoint
CREATE INDEX "by_is_favourite" ON "history" USING btree ("is_favourite");--> statement-breakpoint
CREATE INDEX "sessions_userId_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "by_tmdb_id" ON "titles" USING btree ("tmdb_id");--> statement-breakpoint
CREATE INDEX "by_imdb_id" ON "titles" USING btree ("imdb_id");--> statement-breakpoint
CREATE INDEX "by_tmdb_id_media_type" ON "titles" USING btree ("tmdb_id","media_type");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");