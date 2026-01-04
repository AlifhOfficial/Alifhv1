CREATE TABLE "consignment_funnel" (
	"id" text PRIMARY KEY NOT NULL,
	"partner_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"filters" jsonb NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "consignment_lead" CASCADE;--> statement-breakpoint
DROP TABLE "partner_consignment_preference" CASCADE;--> statement-breakpoint
ALTER TABLE "consignment_funnel" ADD CONSTRAINT "consignment_funnel_partner_id_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "consignment_funnel_partnerId_idx" ON "consignment_funnel" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "consignment_funnel_partnerId_position_idx" ON "consignment_funnel" USING btree ("partner_id","position");--> statement-breakpoint
CREATE INDEX "consignment_funnel_isActive_idx" ON "consignment_funnel" USING btree ("is_active");--> statement-breakpoint
DROP TYPE "public"."consignment_lead_status";