CREATE TYPE "public"."department" AS ENUM('CSE', 'EEE', 'BME', 'ME', 'MME', 'IPE', 'WRE', 'NAME', 'CE', 'URP', 'CHE', 'NCE', 'PMRE', 'CHEM', 'MATH', 'PHYS', 'HUM', 'ARCH');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "buet_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "department" SET DATA TYPE "public"."department" USING "department"::"public"."department";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "department" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_buet_id_unique" UNIQUE("buet_id");