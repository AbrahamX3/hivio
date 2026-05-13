CREATE TABLE "history_audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"history_id" text NOT NULL,
	"title_id" text NOT NULL,
	"changed_field" text NOT NULL,
	"old_value" text,
	"new_value" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "history_audit_log" ADD CONSTRAINT "history_audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "history_audit_log" ADD CONSTRAINT "history_audit_log_history_id_history_id_fk" FOREIGN KEY ("history_id") REFERENCES "public"."history"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "history_audit_log" ADD CONSTRAINT "history_audit_log_title_id_titles_id_fk" FOREIGN KEY ("title_id") REFERENCES "public"."titles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_user_id_idx" ON "history_audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_user_created_at_idx" ON "history_audit_log" USING btree ("user_id","created_at");