CREATE TYPE "public"."service_name" AS ENUM('vercel', 'neon', 'websocket', 'api');--> statement-breakpoint
CREATE TYPE "public"."service_status" AS ENUM('healthy', 'degraded', 'unhealthy');--> statement-breakpoint
CREATE TABLE "incident_update" (
	"id" serial PRIMARY KEY NOT NULL,
	"incident_id" integer NOT NULL,
	"status" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_health" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_name" "service_name" NOT NULL,
	"status" "service_status" NOT NULL,
	"latency" integer,
	"message" text,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "status_incident" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'investigating' NOT NULL,
	"severity" text DEFAULT 'minor' NOT NULL,
	"affected_services" text[],
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "incident_update" ADD CONSTRAINT "incident_update_incident_id_status_incident_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."status_incident"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "incident_update_incident_id_idx" ON "incident_update" USING btree ("incident_id");--> statement-breakpoint
CREATE INDEX "service_health_service_checked_idx" ON "service_health" USING btree ("service_name","checked_at");--> statement-breakpoint
CREATE INDEX "service_health_checked_at_idx" ON "service_health" USING btree ("checked_at");--> statement-breakpoint
CREATE INDEX "status_incident_status_idx" ON "status_incident" USING btree ("status");--> statement-breakpoint
CREATE INDEX "status_incident_started_at_idx" ON "status_incident" USING btree ("started_at");