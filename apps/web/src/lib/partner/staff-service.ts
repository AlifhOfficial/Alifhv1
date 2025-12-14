/**
 * Partner Staff Service
 * 
 * Business logic for staff management
 */

import {
  getStaffById,
  getStaffByPartnerId,
  getStaffByUserId,
  getStaffByPartnerAndUser,
  createStaff as dbCreateStaff,
  updateStaff as dbUpdateStaff,
  deleteStaff as dbDeleteStaff,
  type PartnerStaffRecord,
  type PartnerStaffInsert,
  type PartnerStaffUpdate,
} from '@alifh/database';

import {
  PartnerStaffSchema,
  type PartnerStaff,
  type PartnerStaffUpdate as PartnerStaffUpdateType,
  type CreateStaffInput,
} from '@alifh/shared';

const toStaff = (record: PartnerStaffRecord): PartnerStaff => {
  return PartnerStaffSchema.parse({
    ...record,
    joinedAt: new Date(record.joinedAt),
    invitedAt: record.invitedAt ? new Date(record.invitedAt) : null,
    acceptedAt: record.acceptedAt ? new Date(record.acceptedAt) : null,
    leftAt: record.leftAt ? new Date(record.leftAt) : null,
    lastActiveAt: record.lastActiveAt ? new Date(record.lastActiveAt) : null,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
  });
};

export const getStaff = async (id: string): Promise<PartnerStaff | null> => {
  const record = await getStaffById(id);
  return record ? toStaff(record) : null;
};

export const getPartnerStaff = async (
  partnerId: string,
  filters?: {
    status?: 'active' | 'invited' | 'suspended' | 'left';
    role?: 'owner' | 'admin' | 'sales' | 'viewer';
  }
): Promise<PartnerStaff[]> => {
  const records = await getStaffByPartnerId(partnerId, filters);
  return records.map(toStaff);
};

export const getUserStaff = async (userId: string): Promise<PartnerStaff[]> => {
  const records = await getStaffByUserId(userId);
  return records.map(toStaff);
};

export const createStaff = async (input: CreateStaffInput): Promise<PartnerStaff> => {
  // Check if staff already exists
  const existing = await getStaffByPartnerAndUser(input.partnerId, input.userId);
  if (existing) {
    throw new Error('This user is already a staff member of this partner');
  }
  
  const record = await dbCreateStaff({
    ...input,
    status: input.status ?? 'active',
  } as PartnerStaffInsert);
  
  return toStaff(record);
};

export const updateStaff = async (
  id: string,
  changes: PartnerStaffUpdateType
): Promise<PartnerStaff> => {
  const record = await dbUpdateStaff(id, changes as PartnerStaffUpdate);
  if (!record) {
    throw new Error('Staff not found');
  }
  return toStaff(record);
};

export const deleteStaff = async (id: string): Promise<boolean> => {
  return await dbDeleteStaff(id);
};

export const inviteStaff = async (input: CreateStaffInput, invitedBy: string): Promise<PartnerStaff> => {
  return await createStaff({
    ...input,
    status: 'invited',
    invitedAt: new Date(),
    invitedBy,
  } as CreateStaffInput);
};

export const acceptInvitation = async (id: string): Promise<PartnerStaff> => {
  return await updateStaff(id, {
    status: 'active',
    acceptedAt: new Date(),
  });
};

export const removeStaff = async (id: string, reason?: string): Promise<PartnerStaff> => {
  return await updateStaff(id, {
    status: 'left',
    leftAt: new Date(),
    leftReason: reason,
  });
};
