ALTER TABLE "guardianships" ADD COLUMN "cancellation_token" uuid DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "guardianships" DROP COLUMN "monthly_amount";--> statement-breakpoint
ALTER TABLE "guardianships" ADD CONSTRAINT "guardianships_cancellation_token_key" UNIQUE("cancellation_token");--> statement-breakpoint
CREATE INDEX "guardianships_cancellation_token_idx" ON "guardianships" ("cancellation_token");