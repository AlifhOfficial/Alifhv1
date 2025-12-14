/**
 * Partner Request Service
 * 
 * Business logic for partner application management
 */

import {
  getRequestById,
  getRequestsByUserId,
  getAllRequests,
  createRequest as dbCreateRequest,
  updateRequest as dbUpdateRequest,
  deleteRequest as dbDeleteRequest,
  type PartnerRequestRecord,
  type PartnerRequestInsert,
  type PartnerRequestUpdate,
} from '@alifh/database';

import {
  PartnerRequestSchema,
  type PartnerRequest,
  type PartnerRequestUpdate as PartnerRequestUpdateType,
  type CreateRequestInput,
} from '@alifh/shared';

const toRequest = (record: PartnerRequestRecord): PartnerRequest => {
  return PartnerRequestSchema.parse({
    ...record,
    tradeLicenseExpiry: record.tradeLicenseExpiry ? new Date(record.tradeLicenseExpiry) : null,
    reviewedAt: record.reviewedAt ? new Date(record.reviewedAt) : null,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
  });
};

export const getRequest = async (id: string): Promise<PartnerRequest | null> => {
  const record = await getRequestById(id);
  return record ? toRequest(record) : null;
};

export const getUserRequests = async (userId: string): Promise<PartnerRequest[]> => {
  const records = await getRequestsByUserId(userId);
  return records.map(toRequest);
};

export const listRequests = async (filters?: {
  status?: 'pending' | 'approved' | 'rejected';
  limit?: number;
  offset?: number;
}): Promise<PartnerRequest[]> => {
  const records = await getAllRequests(filters);
  return records.map(toRequest);
};

export const createRequest = async (input: CreateRequestInput): Promise<PartnerRequest> => {
  const record = await dbCreateRequest({
    ...input,
    status: 'pending',
  } as PartnerRequestInsert);
  
  return toRequest(record);
};

export const updateRequest = async (
  id: string,
  changes: PartnerRequestUpdateType
): Promise<PartnerRequest> => {
  const record = await dbUpdateRequest(id, changes as PartnerRequestUpdate);
  if (!record) {
    throw new Error('Request not found');
  }
  return toRequest(record);
};

export const deleteRequest = async (id: string): Promise<boolean> => {
  return await dbDeleteRequest(id);
};

export const approveRequest = async (
  id: string,
  reviewedBy: string,
  partnerId: string
): Promise<PartnerRequest> => {
  return await updateRequest(id, {
    status: 'approved',
    reviewedBy,
    reviewedAt: new Date(),
    partnerId,
  });
};

export const rejectRequest = async (
  id: string,
  reviewedBy: string,
  reason: string
): Promise<PartnerRequest> => {
  return await updateRequest(id, {
    status: 'rejected',
    reviewedBy,
    reviewedAt: new Date(),
    rejectionReason: reason,
  });
};

export const addInternalNotes = async (
  id: string,
  notes: string
): Promise<PartnerRequest> => {
  return await updateRequest(id, {
    internalNotes: notes,
  });
};
