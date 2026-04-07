CREATE TYPE "meeting_request_status" AS ENUM('NEW', 'CONFIRMED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "meeting_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"animal_id" uuid NOT NULL,
	"curator_user_id" text NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"comment" text,
	"meeting_at" timestamp NOT NULL,
	"status" "meeting_request_status" DEFAULT 'NEW'::"meeting_request_status" NOT NULL,
	"confirmed_at" timestamp,
	"rejected_at" timestamp,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "meeting_requests_animal_status_idx" ON "meeting_requests" ("animal_id","status");--> statement-breakpoint
CREATE INDEX "meeting_requests_curator_status_idx" ON "meeting_requests" ("curator_user_id","status");--> statement-breakpoint
CREATE INDEX "meeting_requests_meeting_status_idx" ON "meeting_requests" ("meeting_at","status");--> statement-breakpoint
ALTER TABLE "meeting_requests" ADD CONSTRAINT "meeting_requests_animal_id_animals_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "meeting_requests" ADD CONSTRAINT "meeting_requests_curator_user_id_users_id_fkey" FOREIGN KEY ("curator_user_id") REFERENCES "users"("id") ON DELETE CASCADE;