ALTER TABLE "kyc_record" ADD COLUMN "didit_session_id" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "didit_session_url" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "didit_decision" jsonb;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "document_country" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "document_expiry_date" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "extracted_first_name" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "extracted_last_name" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "extracted_date_of_birth" text;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "face_match_score" double precision;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "face_match_passed" boolean;--> statement-breakpoint
ALTER TABLE "kyc_record" ADD COLUMN "liveness_passed" boolean;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "admin_name" text;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "admin_phone" text;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "admin_phone_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "toll_number" text;