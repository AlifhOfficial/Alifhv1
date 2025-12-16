CREATE TABLE "user_superlike" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"listing_id" text NOT NULL,
	"added_from" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "user_favorite_type_idx";--> statement-breakpoint
DROP INDEX "user_favorite_userId_type_idx";--> statement-breakpoint
ALTER TABLE "user_superlike_quota" ALTER COLUMN "max_superlikes_per_month" SET DEFAULT 50;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "avatar" text;--> statement-breakpoint
ALTER TABLE "user_superlike" ADD CONSTRAINT "user_superlike_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_superlike_userId_idx" ON "user_superlike" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_superlike_listingId_idx" ON "user_superlike" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "user_superlike_userId_listingId_idx" ON "user_superlike" USING btree ("user_id","listing_id");--> statement-breakpoint
CREATE INDEX "user_superlike_createdAt_idx" ON "user_superlike" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "image";--> statement-breakpoint
ALTER TABLE "user_favorite" DROP COLUMN "type";