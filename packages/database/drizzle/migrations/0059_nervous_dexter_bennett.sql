ALTER TABLE "kyc_record" ADD COLUMN "document_hash" text;--> statement-breakpoint
CREATE INDEX "kyc_record_documentHash_idx" ON "kyc_record" USING btree ("document_hash");