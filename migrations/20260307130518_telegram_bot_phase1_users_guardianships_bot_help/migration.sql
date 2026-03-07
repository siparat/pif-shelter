CREATE TABLE "bot_help_config" (
	"key" text PRIMARY KEY,
	"value" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "guardianships" ADD COLUMN "telegram_reminder_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "telegram_chat_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "telegram_chat_id_updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "telegram_unreachable" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "telegram_bot_link_token" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_telegram_bot_link_token_key" UNIQUE("telegram_bot_link_token");