CREATE TYPE "monthly_finance_report_status" AS ENUM('PENDING', 'SUCCEEDED', 'FAILED');--> statement-breakpoint
CREATE TYPE "monthly_finance_report_type" AS ENUM('PUBLIC_XLSX');--> statement-breakpoint
CREATE TABLE "monthly_finance_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"report_type" "monthly_finance_report_type" NOT NULL,
	"status" "monthly_finance_report_status" NOT NULL,
	"storage_key" text,
	"checksum_sha256" text,
	"generated_at" timestamp,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "monthly_finance_reports_period_idx" ON "monthly_finance_reports" ("year","month");--> statement-breakpoint
CREATE INDEX "monthly_finance_reports_generated_at_idx" ON "monthly_finance_reports" ("generated_at");--> statement-breakpoint
CREATE INDEX "monthly_finance_reports_status_idx" ON "monthly_finance_reports" ("status");--> statement-breakpoint
CREATE INDEX "monthly_finance_reports_type_idx" ON "monthly_finance_reports" ("report_type");--> statement-breakpoint
CREATE UNIQUE INDEX "monthly_finance_reports_period_type_uk" ON "monthly_finance_reports" ("year","month","report_type");