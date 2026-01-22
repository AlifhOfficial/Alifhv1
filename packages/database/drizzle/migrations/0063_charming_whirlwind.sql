CREATE TYPE "public"."showroom_ambient_style" AS ENUM('modern', 'classic', 'industrial', 'luxury', 'minimal');--> statement-breakpoint
CREATE TYPE "public"."showroom_hero_type" AS ENUM('video', 'image', 'gradient');--> statement-breakpoint
CREATE TABLE "partner_showroom" (
	"id" text PRIMARY KEY NOT NULL,
	"partner_id" text NOT NULL,
	"hero_video_url" text,
	"hero_video_thumbnail" text,
	"hero_image" text,
	"hero_tagline" text,
	"hero_background_type" "showroom_hero_type" DEFAULT 'image',
	"hero_cta_text" text DEFAULT 'Book Private Viewing',
	"hero_cta_secondary_text" text DEFAULT 'Watch Our Story',
	"brand_story_title" text DEFAULT 'Our Story',
	"brand_story_content" text,
	"brand_story_video_url" text,
	"brand_philosophy" text,
	"founder_name" text,
	"founder_title" text,
	"founder_image" text,
	"founder_quote" text,
	"showroom_images" jsonb DEFAULT '[]'::jsonb,
	"showroom_video_tour_url" text,
	"ambient_style" "showroom_ambient_style" DEFAULT 'luxury',
	"signature_vehicle_ids" jsonb DEFAULT '[]'::jsonb,
	"collection_title" text DEFAULT 'The Collection',
	"collection_description" text,
	"team_members" jsonb DEFAULT '[]'::jsonb,
	"team_section_title" text DEFAULT 'Meet the Team',
	"achievements" jsonb DEFAULT '[]'::jsonb,
	"total_cars_sold" integer,
	"years_in_business" integer,
	"client_logos" jsonb DEFAULT '[]'::jsonb,
	"achievements_section_title" text DEFAULT 'Our Achievements',
	"featured_testimonials" jsonb DEFAULT '[]'::jsonb,
	"testimonials_section_title" text DEFAULT 'What Our Clients Say',
	"signature_services" jsonb DEFAULT '[]'::jsonb,
	"vip_perks" jsonb DEFAULT '[]'::jsonb,
	"services_section_title" text DEFAULT 'Our Services',
	"showroom_address" text,
	"showroom_map_embed_url" text,
	"showroom_exterior_images" jsonb DEFAULT '[]'::jsonb,
	"parking_info" text,
	"appointment_cta_text" text DEFAULT 'Book Your Private Viewing',
	"instagram_handle" text,
	"instagram_feed_enabled" boolean DEFAULT false,
	"youtube_channel_url" text,
	"tiktok_handle" text,
	"linkedin_url" text,
	"press_features" jsonb DEFAULT '[]'::jsonb,
	"primary_color" text,
	"accent_color" text,
	"font_family" text,
	"custom_css" text,
	"seo_title" text,
	"seo_description" text,
	"seo_image" text,
	"slug" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"last_edited_at" timestamp,
	"last_edited_by" text,
	"view_count" integer DEFAULT 0 NOT NULL,
	"unique_visitors" integer DEFAULT 0 NOT NULL,
	"avg_time_on_page" integer DEFAULT 0,
	"last_viewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partner_showroom_partner_id_unique" UNIQUE("partner_id"),
	CONSTRAINT "partner_showroom_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DROP INDEX "vin_publication_history_vin_userId_idx";--> statement-breakpoint
ALTER TABLE "partner_showroom" ADD CONSTRAINT "partner_showroom_partner_id_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_showroom" ADD CONSTRAINT "partner_showroom_last_edited_by_user_id_fk" FOREIGN KEY ("last_edited_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "partner_showroom_partnerId_idx" ON "partner_showroom" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "partner_showroom_slug_idx" ON "partner_showroom" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "partner_showroom_isPublished_idx" ON "partner_showroom" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "partner_showroom_published_date_idx" ON "partner_showroom" USING btree ("is_published","published_at");--> statement-breakpoint
CREATE INDEX "partner_showroom_viewCount_idx" ON "partner_showroom" USING btree ("view_count");--> statement-breakpoint
CREATE INDEX "partner_showroom_lastEditedBy_idx" ON "partner_showroom" USING btree ("last_edited_by");--> statement-breakpoint
CREATE UNIQUE INDEX "vin_publication_history_vin_userId_unique" ON "vin_publication_history" USING btree ("vin","user_id");