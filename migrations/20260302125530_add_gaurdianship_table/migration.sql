CREATE TYPE "guardianship_status" AS ENUM('ACTIVE', 'CANCELLED', 'PENDING_PAYMENT');--> statement-breakpoint
CREATE TABLE "guardianships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"animal_id" uuid NOT NULL,
	"guardian_user_id" text NOT NULL,
	"monthly_amount" text NOT NULL,
	"status" "guardianship_status" DEFAULT 'PENDING_PAYMENT'::"guardianship_status" NOT NULL,
	"subscription_id" text NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"cancelled_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "guardianships_animal_id_idx" ON "guardianships" ("animal_id");--> statement-breakpoint
CREATE INDEX "guardianships_guardian_user_id_idx" ON "guardianships" ("guardian_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "guardianships_animal_guardian_unique_idx" ON "guardianships" ("animal_id","guardian_user_id");--> statement-breakpoint
ALTER TABLE "guardianships" ADD CONSTRAINT "guardianships_animal_id_animals_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "guardianships" ADD CONSTRAINT "guardianships_guardian_user_id_users_id_fkey" FOREIGN KEY ("guardian_user_id") REFERENCES "users"("id") ON DELETE CASCADE;