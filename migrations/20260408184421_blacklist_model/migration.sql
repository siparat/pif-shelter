CREATE TYPE "blacklist_context" AS ENUM('MEETING_FORM', 'MANUAL');--> statement-breakpoint
CREATE TYPE "blacklist_source" AS ENUM('PHONE', 'EMAIL', 'TELEGRAM');--> statement-breakpoint
CREATE TYPE "blacklist_status" AS ENUM('BLOCKED', 'APPEALED', 'SUSPICION', 'SUSPICION_EXPIRED');--> statement-breakpoint
CREATE TABLE "blacklist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"context" "blacklist_context" NOT NULL,
	"source" "blacklist_source" NOT NULL,
	"value" text NOT NULL,
	"reason" text,
	"status" "blacklist_status" DEFAULT 'SUSPICION'::"blacklist_status" NOT NULL,
	"moderator_id" text,
	"expired_at" timestamp,
	"blocked_at" timestamp,
	"appeealed_at" timestamp,
	"added_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "blacklist_status_idx" ON "blacklist" ("status");--> statement-breakpoint
CREATE INDEX "blacklist_expired_idx" ON "blacklist" ("expired_at");--> statement-breakpoint
CREATE UNIQUE INDEX "blacklist_source_value_uk" ON "blacklist" ("source","value");--> statement-breakpoint
ALTER TABLE "blacklist" ADD CONSTRAINT "blacklist_moderator_id_users_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "users"("id");