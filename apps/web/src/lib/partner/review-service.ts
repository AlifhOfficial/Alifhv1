/**
 * Partner Review Service
 * 
 * Business logic for review management
 */

import {
  getReviewById,
  getReviewsByPartnerId,
  getReviewsByUserId,
  createReview as dbCreateReview,
  updateReview as dbUpdateReview,
  deleteReview as dbDeleteReview,
  type PartnerReviewRecord,
  type PartnerReviewInsert,
  type PartnerReviewUpdate,
} from '@alifh/database';

import {
  PartnerReviewSchema,
  type PartnerReview,
  type PartnerReviewUpdate as PartnerReviewUpdateType,
  type CreateReviewInput,
} from '@alifh/shared';

const toReview = (record: PartnerReviewRecord): PartnerReview => {
  return PartnerReviewSchema.parse({
    ...record,
    respondedAt: record.respondedAt ? new Date(record.respondedAt) : null,
    moderatedAt: record.moderatedAt ? new Date(record.moderatedAt) : null,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
  });
};

export const getReview = async (id: string): Promise<PartnerReview | null> => {
  const record = await getReviewById(id);
  return record ? toReview(record) : null;
};

export const getPartnerReviews = async (
  partnerId: string,
  filters?: {
    status?: 'pending' | 'published' | 'hidden' | 'flagged';
    minRating?: number;
    limit?: number;
    offset?: number;
  }
): Promise<PartnerReview[]> => {
  const records = await getReviewsByPartnerId(partnerId, filters);
  return records.map(toReview);
};

export const getUserReviews = async (userId: string): Promise<PartnerReview[]> => {
  const records = await getReviewsByUserId(userId);
  return records.map(toReview);
};

export const createReview = async (input: CreateReviewInput): Promise<PartnerReview> => {
  const record = await dbCreateReview({
    ...input,
    status: input.status ?? 'published',
  } as PartnerReviewInsert);
  
  return toReview(record);
};

export const updateReview = async (
  id: string,
  changes: PartnerReviewUpdateType
): Promise<PartnerReview> => {
  const record = await dbUpdateReview(id, changes as PartnerReviewUpdate);
  if (!record) {
    throw new Error('Review not found');
  }
  return toReview(record);
};

export const deleteReview = async (id: string): Promise<boolean> => {
  return await dbDeleteReview(id);
};

export const respondToReview = async (
  id: string,
  response: string
): Promise<PartnerReview> => {
  return await updateReview(id, {
    partnerResponse: response,
    respondedAt: new Date(),
  });
};

export const moderateReview = async (
  id: string,
  status: 'published' | 'hidden' | 'flagged',
  moderatedBy: string
): Promise<PartnerReview> => {
  return await updateReview(id, {
    status,
    moderatedBy,
    moderatedAt: new Date(),
  });
};

export const markHelpful = async (id: string): Promise<PartnerReview> => {
  const review = await getReview(id);
  if (!review) {
    throw new Error('Review not found');
  }
  
  return await updateReview(id, {
    helpfulCount: review.helpfulCount + 1,
  });
};
