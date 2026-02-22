/**
 * Status/Health Schema
 * 
 * Tracks service health over time for the status page
 */

import { pgTable, text, timestamp, pgEnum, index, integer, serial } from 'drizzle-orm/pg-core';

// Service status enum
export const serviceStatusEnum = pgEnum('service_status', ['healthy', 'degraded', 'unhealthy']);

// Service name enum  
export const serviceNameEnum = pgEnum('service_name', ['vercel', 'neon', 'websocket', 'api']);

/**
 * Service health checks - stores each health check result
 */
export const serviceHealth = pgTable('service_health', {
  id: serial('id').primaryKey(),
  serviceName: serviceNameEnum('service_name').notNull(),
  status: serviceStatusEnum('status').notNull(),
  latency: integer('latency'), // in milliseconds
  message: text('message'),
  checkedAt: timestamp('checked_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('service_health_service_checked_idx').on(table.serviceName, table.checkedAt),
  index('service_health_checked_at_idx').on(table.checkedAt),
]);

/**
 * Status incidents - for manual incident reports
 */
export const statusIncident = pgTable('status_incident', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('investigating'), // investigating, identified, monitoring, resolved
  severity: text('severity').notNull().default('minor'), // minor, major, critical
  affectedServices: text('affected_services').array(), // ['vercel', 'neon', 'websocket', 'api']
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index('status_incident_status_idx').on(table.status),
  index('status_incident_started_at_idx').on(table.startedAt),
]);

/**
 * Incident updates - timeline of updates for an incident
 */
export const incidentUpdate = pgTable('incident_update', {
  id: serial('id').primaryKey(),
  incidentId: integer('incident_id').notNull().references(() => statusIncident.id, { onDelete: 'cascade' }),
  status: text('status').notNull(), // investigating, identified, monitoring, resolved
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('incident_update_incident_id_idx').on(table.incidentId),
]);

// Types
export type ServiceHealth = typeof serviceHealth.$inferSelect;
export type NewServiceHealth = typeof serviceHealth.$inferInsert;
export type StatusIncident = typeof statusIncident.$inferSelect;
export type NewStatusIncident = typeof statusIncident.$inferInsert;
export type IncidentUpdate = typeof incidentUpdate.$inferSelect;
export type NewIncidentUpdate = typeof incidentUpdate.$inferInsert;
