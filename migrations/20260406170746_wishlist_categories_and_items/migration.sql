CREATE TYPE "wishlist_item_status" AS ENUM('ALWAYS_NEEDED', 'SOS', 'NOT_NEEDED');--> statement-breakpoint
CREATE TABLE "wishlist_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "wishlist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"category_id" uuid NOT NULL,
	"name" text NOT NULL,
	"status" "wishlist_item_status" DEFAULT 'ALWAYS_NEEDED'::"wishlist_item_status" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "wishlist_categories_sort_order_idx" ON "wishlist_categories" ("sort_order");--> statement-breakpoint
CREATE INDEX "wishlist_items_category_id_idx" ON "wishlist_items" ("category_id");--> statement-breakpoint
CREATE INDEX "wishlist_items_category_sort_idx" ON "wishlist_items" ("category_id","sort_order");--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_category_id_wishlist_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "wishlist_categories"("id") ON DELETE CASCADE;