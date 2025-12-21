/**
 * Admin Hooks
 * 
 * Exports all admin-related hooks for user and partner management
 */

export {
  useAdminUsers,
  useAdminUserByEmail,
  useAdminUserByPhone,
  useAdminUserSearch,
  useAdminPartners,
  useAdminStats,
  type AdminUserData,
  type AdminPartnerData,
  type AdminStats,
  type ListUsersOptions,
  type ListPartnersOptions,
  type SearchUsersOptions,
} from './use-admin-users';
