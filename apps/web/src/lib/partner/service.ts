/**
 * Partner Service
 * 
 * Business logic layer for Partner operations
 * Handles validation, transformations, and orchestrates database queries
 */

import {
  getPartnerById,
  getPartnerByEmail,
  getPartnerByTradeLicense,
  getAllPartners,
  createPartner as dbCreatePartner,
  updatePartner as dbUpdatePartner,
  deletePartner as dbDeletePartner,
  type PartnerRecord,
  type PartnerInsert,
  type PartnerUpdate,
} from '@alifh/database';

import {
  PartnerSchema,
  PartnerUpdateSchema,
  CreatePartnerInputSchema,
  type Partner,
  type PartnerUpdate as PartnerUpdateType,
  type CreatePartnerInput,
} from '@alifh/shared';

// ==================== HELPERS ====================

/**
 * Convert database record to typed Partner object
 */
const toPartner = (record: PartnerRecord): Partner => {
  return PartnerSchema.parse({
    ...record,
    tradeLicenseExpiry: record.tradeLicenseExpiry ? new Date(record.tradeLicenseExpiry) : null,
    verifiedAt: record.verifiedAt ? new Date(record.verifiedAt) : null,
    subscriptionExpiresAt: record.subscriptionExpiresAt ? new Date(record.subscriptionExpiresAt) : null,
    submittedAt: record.submittedAt ? new Date(record.submittedAt) : null,
    approvedAt: record.approvedAt ? new Date(record.approvedAt) : null,
    rejectedAt: record.rejectedAt ? new Date(record.rejectedAt) : null,
    lastAuditAt: record.lastAuditAt ? new Date(record.lastAuditAt) : null,
    nextAuditAt: record.nextAuditAt ? new Date(record.nextAuditAt) : null,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
    activatedAt: record.activatedAt ? new Date(record.activatedAt) : null,
    suspendedAt: record.suspendedAt ? new Date(record.suspendedAt) : null,
    cancelledAt: record.cancelledAt ? new Date(record.cancelledAt) : null,
  });
};

// ==================== SERVICE FUNCTIONS ====================

/**
 * Get partner by ID
 */
export const getPartner = async (id: string): Promise<Partner | null> => {
  const record = await getPartnerById(id);
  return record ? toPartner(record) : null;
};

/**
 * Get partner by email
 */
export const getPartnerByEmailAddress = async (email: string): Promise<Partner | null> => {
  const record = await getPartnerByEmail(email);
  return record ? toPartner(record) : null;
};

/**
 * Get partner by trade license
 */
export const getPartnerByLicense = async (tradeLicense: string): Promise<Partner | null> => {
  const record = await getPartnerByTradeLicense(tradeLicense);
  return record ? toPartner(record) : null;
};

/**
 * List all partners with optional filters
 */
export const listPartners = async (filters?: {
  status?: 'pending' | 'active' | 'suspended' | 'cancelled';
  tier?: 'standard' | 'gold' | 'platinum' | 'black';
  emirate?: string;
  isVerified?: boolean;
  limit?: number;
  offset?: number;
}): Promise<Partner[]> => {
  const records = await getAllPartners(filters);
  return records.map(toPartner);
};

/**
 * Create a new partner
 */
export const createPartner = async (input: CreatePartnerInput): Promise<Partner> => {
  // Validate input
  const validated = CreatePartnerInputSchema.parse(input);
  
  // Check for duplicate email
  const existingEmail = await getPartnerByEmail(validated.email);
  if (existingEmail) {
    throw new Error('A partner with this email already exists');
  }
  
  // Check for duplicate trade license
  const existingLicense = await getPartnerByTradeLicense(validated.tradeLicense);
  if (existingLicense) {
    throw new Error('A partner with this trade license already exists');
  }
  
  // Create partner with defaults
  const record = await dbCreatePartner({
    ...validated,
    status: validated.status ?? 'pending',
    tier: validated.tier ?? 'standard',
  } as PartnerInsert);
  
  return toPartner(record);
};

/**
 * Update an existing partner
 */
export const updatePartner = async (
  id: string,
  changes: PartnerUpdateType
): Promise<Partner> => {
  // Validate changes
  const validated = PartnerUpdateSchema.parse(changes);
  
  // If email is being changed, check for duplicates
  if (validated.email) {
    const existing = await getPartnerByEmail(validated.email);
    if (existing && existing.id !== id) {
      throw new Error('A partner with this email already exists');
    }
  }
  
  // If trade license is being changed, check for duplicates
  if (validated.tradeLicense) {
    const existing = await getPartnerByTradeLicense(validated.tradeLicense);
    if (existing && existing.id !== id) {
      throw new Error('A partner with this trade license already exists');
    }
  }
  
  const record = await dbUpdatePartner(id, validated as PartnerUpdate);
  if (!record) {
    throw new Error('Partner not found');
  }
  
  return toPartner(record);
};

/**
 * Delete a partner
 */
export const deletePartner = async (id: string): Promise<boolean> => {
  return await dbDeletePartner(id);
};

/**
 * Verify a partner (admin action)
 */
export const verifyPartner = async (
  id: string,
  verifiedBy: string
): Promise<Partner> => {
  return await updatePartner(id, {
    isVerified: true,
    verifiedAt: new Date(),
    verifiedBy,
  });
};

/**
 * Activate a partner (change status to active)
 */
export const activatePartner = async (id: string): Promise<Partner> => {
  return await updatePartner(id, {
    status: 'active',
    activatedAt: new Date(),
  });
};

/**
 * Suspend a partner
 */
export const suspendPartner = async (id: string): Promise<Partner> => {
  return await updatePartner(id, {
    status: 'suspended',
    suspendedAt: new Date(),
  });
};

/**
 * Cancel a partner
 */
export const cancelPartner = async (id: string): Promise<Partner> => {
  return await updatePartner(id, {
    status: 'cancelled',
    cancelledAt: new Date(),
  });
};

/**
 * Update partner tier
 */
export const updatePartnerTier = async (
  id: string,
  tier: 'standard' | 'gold' | 'platinum' | 'black'
): Promise<Partner> => {
  return await updatePartner(id, { tier });
};

/**
 * Update partner features
 */
export const updatePartnerFeatures = async (
  id: string,
  features: Partial<{
    homeDelivery: boolean;
    testDriveAvailable: boolean;
    financing: boolean;
    tradeIn: boolean;
    warranty: boolean;
    insurance: boolean;
    registration: boolean;
    exportAssistance: boolean;
  }>
): Promise<Partner> => {
  const current = await getPartner(id);
  if (!current) {
    throw new Error('Partner not found');
  }
  
  return await updatePartner(id, {
    features: {
      ...current.features,
      ...features,
    },
  });
};

/**
 * Update partner notification preferences
 */
export const updatePartnerNotifications = async (
  id: string,
  preferences: Partial<{
    emailNewLead: boolean;
    emailBooking: boolean;
    emailMessage: boolean;
    emailSale: boolean;
    emailReview: boolean;
    emailMarketing: boolean;
    smsNewLead: boolean;
    smsBooking: boolean;
  }>
): Promise<Partner> => {
  const current = await getPartner(id);
  if (!current) {
    throw new Error('Partner not found');
  }
  
  return await updatePartner(id, {
    notificationPreferences: {
      ...current.notificationPreferences,
      ...preferences,
    },
  });
};
