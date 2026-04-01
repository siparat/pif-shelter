CREATE TYPE "campaign_status" AS ENUM('DRAFT', 'PUBLISHED', 'CANCELLED', 'SUCCESS', 'FAILED');--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" text NOT NULL,
	"description" text,
	"collected" integer DEFAULT 0 NOT NULL,
	"goal" integer NOT NULL,
	"order" smallint DEFAULT 1 NOT NULL,
	"preview_image" text,
	"status" "campaign_status" DEFAULT 'DRAFT'::"campaign_status" NOT NULL,
	"animal_id" uuid,
	"starts_at" timestamp DEFAULT now() NOT NULL,
	"ends_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "campaigns_positive_collected_check" CHECK ("collected" >= 0 ),
	CONSTRAINT "campaigns_positive_goal_check" CHECK ("goal" >= 0 )
);
--> statement-breakpoint
CREATE INDEX "campaigns_animal_id_idx" ON "campaigns" ("animal_id");--> statement-breakpoint
CREATE INDEX "campaigns_status_ends_at_idx" ON "campaigns" ("status","ends_at");--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_animal_id_animals_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_campaign_id_campaigns_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id");