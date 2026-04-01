DROP INDEX "campaigns_status_ends_at_idx";--> statement-breakpoint
CREATE INDEX "campaigns_status_ends_at_idx" ON "campaigns" ("status","ends_at") WHERE ("deleted_at" is null);