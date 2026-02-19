ALTER TABLE "users" ADD COLUMN "telegram" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_telegram_key" UNIQUE("telegram");