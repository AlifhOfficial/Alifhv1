CREATE TYPE "public"."communication_status" AS ENUM('new', 'in_progress', 'resolved', 'archived');--> statement-breakpoint
CREATE TYPE "public"."communication_type" AS ENUM('inquiry', 'support', 'partnership', 'feedback', 'other');--> statement-breakpoint
CREATE TABLE "communications" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"type" "communication_type" DEFAULT 'inquiry' NOT NULL,
	"status" "communication_status" DEFAULT 'new' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"admin_note" text,
	"assigned_to" text,
	"resolved_at" timestamp,
	"resolved_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "communications" ADD CONSTRAINT "communications_assigned_to_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communications" ADD CONSTRAINT "communications_resolved_by_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "communications_status_idx" ON "communications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "communications_type_idx" ON "communications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "communications_email_idx" ON "communications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "communications_createdAt_idx" ON "communications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "communications_isRead_idx" ON "communications" USING btree ("is_read");