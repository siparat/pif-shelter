CREATE TABLE "post_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"post_id" uuid NOT NULL,
	"emoji" text NOT NULL,
	"anonymous_visitor_id" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "post_reactions_post_id_anonymous_visitor_id_unique" ON "post_reactions" ("post_id","anonymous_visitor_id");--> statement-breakpoint
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_post_id_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE;