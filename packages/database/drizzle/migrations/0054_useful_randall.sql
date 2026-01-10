ALTER TABLE "kyc_record" ADD COLUMN "didit_session_number" integer;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "document_country_code" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "document_issue_date" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "extracted_full_name" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "extracted_age" integer;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "extracted_gender" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "extracted_nationality" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "extracted_nationality_code" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "face_match_status" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "face_source_image" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "face_target_image" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "liveness_score" double precision;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "liveness_status" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "liveness_method" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "liveness_age_estimation" double precision;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "liveness_reference_image" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "ip_address" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "ip_city" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "ip_country" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "ip_country_code" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "is_vpn_or_tor" boolean;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "is_data_center" boolean;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "device_platform" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "device_brand" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "device_browser" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "warnings" jsonb;--> statement-breakpoint
CREATE INDEX "kyc_record_diditSessionId_idx" ON "kyc_record" USING btree ("didit_session_id");--> statement-breakpoint
ALTER TABLE "kyc_record" DROP COLUMN "face_match_passed";--> statement-breakpoint
ALTER TABLE "kyc_record" DROP COLUMN "liveness_passed";