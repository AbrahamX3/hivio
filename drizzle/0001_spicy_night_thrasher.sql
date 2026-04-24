DROP INDEX "by_status";--> statement-breakpoint
DROP INDEX "by_is_favourite";--> statement-breakpoint
CREATE INDEX "accounts_provider_account_idx" ON "accounts" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "history_user_created_at_idx" ON "history" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "history_user_status_updated_at_idx" ON "history" USING btree ("user_id","status","updated_at");