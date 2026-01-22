/**
 * Car Dealer Queries
 * Query functions for car dealer (partner) profiles
 * 
 * @module queries/partner/car-dealer
 */

export { getDealerBaseProfile } from './get-dealer-base-profile';
export { updateDealerBaseProfile, type UpdateDealerBaseProfileData } from './update-dealer-base-profile';

// Partner Profile (for dashboard & showroom page)
export {
  getPartnerProfileComprehensive,
  updatePartnerProfile,
  getPartnerProfileByUserId,
  getShowroomPageData,
  type PartnerProfileComprehensive,
  type PartnerProfileUpdate,
  // Types kept for schema reference but not used in forms:
  type PartnerFeatures,
  type BusinessHours,
  type NotificationPreferences,
} from './partner-profile-comprehensive';
// Partner Stats - NOT exported here to avoid Edge Runtime issues in middleware
// Import directly: import { calculatePartnerStats } from '@alifh/database/queries/partner/car-dealer/partner-stats';
