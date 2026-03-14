CREATE TYPE "post_media_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "post_visibility" AS ENUM('PUBLIC', 'PRIVATE');--> statement-breakpoint
CREATE TABLE "post_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"post_id" uuid NOT NULL,
	"storage_key" text NOT NULL,
	"type" "post_media_type" NOT NULL,
	"order" smallint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"animal_id" uuid NOT NULL,
	"author_id" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"visibility" "post_visibility" NOT NULL,
	"campaign_id" uuid,
	"animal_age_years" integer NOT NULL,
	"animal_age_months" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "animals_сurator_idx" ON "animals" ("curator_id");--> statement-breakpoint
CREATE INDEX "post_media_post_id_idx" ON "post_media" ("post_id");--> statement-breakpoint
CREATE INDEX "posts_animal_id_idx" ON "posts" ("animal_id");--> statement-breakpoint
CREATE INDEX "posts_author_id_idx" ON "posts" ("author_id");--> statement-breakpoint
CREATE INDEX "posts_created_at_idx" ON "posts" ("created_at");--> statement-breakpoint
ALTER TABLE "post_media" ADD CONSTRAINT "post_media_post_id_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_animal_id_animals_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id");