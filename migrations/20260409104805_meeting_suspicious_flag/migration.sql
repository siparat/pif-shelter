ALTER TABLE "meeting_requests" ADD COLUMN "is_suspicious" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "meeting_requests_phone_idx" ON "meeting_requests" ("phone") WHERE "status" = 'NEW';--> statement-breakpoint
CREATE INDEX "meeting_requests_email_idx" ON "meeting_requests" ("email") WHERE "status" = 'NEW';