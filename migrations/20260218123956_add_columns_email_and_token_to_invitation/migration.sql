ALTER TABLE "invitations" ADD COLUMN "token" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
CREATE INDEX "invitations_email_idx" ON "invitations" ("email");