CREATE TYPE "animal_coat" AS ENUM('SHORT', 'MEDIUM', 'LONG', 'WIRE', 'CURLY', 'HAIRLESS');--> statement-breakpoint
CREATE TYPE "animal_gender" AS ENUM('MALE', 'FEMALE');--> statement-breakpoint
CREATE TYPE "animal_size" AS ENUM('SMALL', 'MEDIUM', 'LARGE');--> statement-breakpoint
CREATE TYPE "animal_species" AS ENUM('DOG', 'CAT');--> statement-breakpoint
CREATE TYPE "animal_status" AS ENUM('DRAFT', 'PUBLISHED', 'ON_TREATMENT', 'ON_PROBATION', 'ADOPTED', 'RAINBOW');--> statement-breakpoint
CREATE TABLE "animals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"species" "animal_species" NOT NULL,
	"gender" "animal_gender" NOT NULL,
	"birth_date" date NOT NULL,
	"size" "animal_size" NOT NULL,
	"coat" "animal_coat" NOT NULL,
	"color" text NOT NULL,
	"tags" jsonb DEFAULT '[]',
	"description" text,
	"is_sterilized" boolean DEFAULT false NOT NULL,
	"is_vaccinated" boolean DEFAULT false NOT NULL,
	"is_parasite_treated" boolean DEFAULT false NOT NULL,
	"avatar_url" text,
	"gallery_urls" jsonb DEFAULT '[]',
	"status" "animal_status" DEFAULT 'DRAFT'::"animal_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "animals_to_labels" (
	"animal_id" uuid,
	"label_id" uuid,
	CONSTRAINT "animals_to_labels_pkey" PRIMARY KEY("animal_id","label_id")
);
--> statement-breakpoint
CREATE TABLE "labels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL UNIQUE,
	"color" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "animals_to_labels" ADD CONSTRAINT "animals_to_labels_animal_id_animals_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "animals_to_labels" ADD CONSTRAINT "animals_to_labels_label_id_labels_id_fkey" FOREIGN KEY ("label_id") REFERENCES "labels"("id") ON DELETE CASCADE;