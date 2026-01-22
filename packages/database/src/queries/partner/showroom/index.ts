/**
 * Partner Showroom Queries (Black Tier Exclusive)
 * 
 * Ultra-optimized queries for the premium brand showroom experience.
 * All queries designed for minimal latency with aggressive caching.
 * 
 * @module queries/partner/showroom
 */

export {
  // Core CRUD
  getShowroomByPartnerId,
  getShowroomBySlug,
  getPublishedShowroomBySlug,
  getPublishedShowroomByPartnerId,
  hasPublishedShowroom,
  createShowroom,
  updateShowroom,
  publishShowroom,
  unpublishShowroom,
  
  // Batch & List
  getPublishedShowrooms,
  
  // Analytics
  incrementShowroomViews,
  
  // Types
  type PartnerShowroomFull,
  type PartnerShowroomPublic,
  type ShowroomCreateInput,
  type ShowroomUpdateInput,
} from './showroom-queries';
