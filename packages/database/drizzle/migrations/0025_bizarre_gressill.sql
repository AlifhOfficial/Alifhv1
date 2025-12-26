ALTER TABLE "user_profile" ADD COLUMN "platform_rating" double precision;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "platform_review_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "showroom_video_url" text;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "showroom_video_thumbnail" text;