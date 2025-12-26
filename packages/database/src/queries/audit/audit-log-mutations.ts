/**
 * Audit Log Mutations
 *
 * Centralized helpers for writing to the `audit_log` table.
 */

import { createId } from '@paralleldrive/cuid2';
import { db } from '../../dbclient';
import { auditLog } from '../../schema/partner';

export type AuditSeverity = 'info' | 'warn' | 'error';

export interface CreateAuditLogEntryInput {
  action: string;
  entityType: string;
  entityId: string;
  userId?: string | null;
  severity?: AuditSeverity;
  metadata?: Record<string, any> | null;
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function createAuditLogEntry(input: CreateAuditLogEntryInput): Promise<string> {
  const [row] = await db
    .insert(auditLog)
    .values({
      id: `audit_${createId()}`,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      userId: input.userId ?? null,
      severity: input.severity ?? 'info',
      metadata: input.metadata ?? undefined,
      oldValues: input.oldValues ?? undefined,
      newValues: input.newValues ?? undefined,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    })
    .returning({ id: auditLog.id });

  return row.id;
}

