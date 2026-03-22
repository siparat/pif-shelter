CREATE TYPE "donation_one_time_intent_status" AS ENUM('PENDING', 'SUCCEEDED', 'FAILED');--> statement-breakpoint
CREATE TYPE "donation_subscription_status" AS ENUM('PENDING_FIRST_PAYMENT', 'ACTIVE', 'CANCELLED', 'FAILED');--> statement-breakpoint
CREATE TYPE "ledger_entry_direction" AS ENUM('INCOME', 'EXPENSE');--> statement-breakpoint
CREATE TYPE "ledger_entry_source" AS ENUM('DONATION_ONE_OFF', 'DONATION_SUBSCRIPTION', 'GUARDIANSHIP', 'MANUAL_EXPENSE');--> statement-breakpoint
CREATE TABLE "donation_one_time_intents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"transaction_id" text NOT NULL UNIQUE,
	"display_name" text NOT NULL,
	"hide_public_name" boolean DEFAULT false NOT NULL,
	"expected_amount" integer NOT NULL,
	"status" "donation_one_time_intent_status" NOT NULL,
	"provider_payment_id" text UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "donation_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"subscription_id" text NOT NULL UNIQUE,
	"display_name" text NOT NULL,
	"hide_public_name" boolean DEFAULT false NOT NULL,
	"amount_per_period" integer NOT NULL,
	"status" "donation_subscription_status" NOT NULL,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"direction" "ledger_entry_direction" NOT NULL,
	"source" "ledger_entry_source" NOT NULL,
	"gross_amount" integer NOT NULL,
	"fee_amount" integer NOT NULL,
	"net_amount" integer NOT NULL,
	"currency" text DEFAULT 'RUB' NOT NULL,
	"occurred_at" timestamp NOT NULL,
	"title" text NOT NULL,
	"note" text,
	"donor_display_name" text,
	"provider_payment_id" text UNIQUE,
	"donation_one_time_intent_id" uuid,
	"donation_subscription_id" uuid,
	"guardianship_id" uuid,
	"receipt_storage_key" text,
	"created_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "donation_one_time_intents_status_idx" ON "donation_one_time_intents" ("status");--> statement-breakpoint
CREATE INDEX "ledger_entries_occurred_at_idx" ON "ledger_entries" ("occurred_at");--> statement-breakpoint
CREATE INDEX "ledger_entries_source_idx" ON "ledger_entries" ("source");--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_7atz9oSAqsLl_fkey" FOREIGN KEY ("donation_one_time_intent_id") REFERENCES "donation_one_time_intents"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_OUDWYX9RkHjR_fkey" FOREIGN KEY ("donation_subscription_id") REFERENCES "donation_subscriptions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_guardianship_id_guardianships_id_fkey" FOREIGN KEY ("guardianship_id") REFERENCES "guardianships"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_created_by_user_id_users_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL;