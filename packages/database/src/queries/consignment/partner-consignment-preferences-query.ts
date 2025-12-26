/**
 * Partner Consignment Preferences Queries
 *
 * @module queries/consignment/partner-consignment-preferences-query
 */

import { eq } from 'drizzle-orm';
import { db } from '../../dbclient';
import { partnerConsignmentPreference } from '../../schema/consignment';

export type PartnerConsignmentPreferenceRecord = typeof partnerConsignmentPreference.$inferSelect;

export async function getPartnerConsignmentPreference(
  partnerId: string
): Promise<PartnerConsignmentPreferenceRecord | null> {
  const record = await db.query.partnerConsignmentPreference.findFirst({
    where: eq(partnerConsignmentPreference.partnerId, partnerId),
  });

  return record ?? null;
}

export async function getOrCreatePartnerConsignmentPreference(
  partnerId: string
): Promise<PartnerConsignmentPreferenceRecord> {
  const existing = await getPartnerConsignmentPreference(partnerId);
  if (existing) return existing;

  const now = new Date();
  const [created] = await db
    .insert(partnerConsignmentPreference)
    .values({
      id: crypto.randomUUID(),
      partnerId,
      isEnabled: false,
      makes: [],
      models: [],
      bodyTypes: [],
      fuelTypes: [],
      emirates: [],
      preferredSpecs: [],
      mustHaveFeatures: [],
      priorityScore: 50,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return created;
}

export async function updatePartnerConsignmentPreference(
  partnerId: string,
  input: Partial<PartnerConsignmentPreferenceRecord>
): Promise<PartnerConsignmentPreferenceRecord | null> {
  const [updated] = await db
    .update(partnerConsignmentPreference)
    .set({
      isEnabled: input.isEnabled,
      makes: input.makes ?? [],
      models: input.models ?? [],
      bodyTypes: input.bodyTypes ?? [],
      fuelTypes: input.fuelTypes ?? [],
      minYear: input.minYear ?? null,
      maxYear: input.maxYear ?? null,
      minPrice: input.minPrice ?? null,
      maxPrice: input.maxPrice ?? null,
      maxMileage: input.maxMileage ?? null,
      emirates: input.emirates ?? [],
      preferredSpecs: input.preferredSpecs ?? [],
      mustHaveFeatures: input.mustHaveFeatures ?? [],
      onlyVerifiedSellers: input.onlyVerifiedSellers ?? false,
      excludeAccidents: input.excludeAccidents ?? true,
      priorityScore: input.priorityScore ?? 50,
      notifyOnNewLead: input.notifyOnNewLead ?? true,
      maxLeadsPerDay: input.maxLeadsPerDay ?? null,
      updatedAt: new Date(),
    })
    .where(eq(partnerConsignmentPreference.partnerId, partnerId))
    .returning();

  return updated ?? null;
}

