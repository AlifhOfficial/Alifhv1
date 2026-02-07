/**
 * Profile Component Types
 */

import { Colors } from '@/constants/theme';

export type ThemeColors = typeof Colors.light;

export type EditingField = null | 'firstName' | 'lastName' | 'phone' | 'bio';

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
  tags: string[];
}

export interface ProfileStats {
  listings: number | null;
  sold: number | null;
  responseRate: number | null;
  rating: number | null;
}

export interface ProfileStatus {
  kycVerified: boolean;
  kycStatus: 'none' | 'pending' | 'rejected' | 'verified';
  kycExpiryDate: Date | null;
  emailVerified: boolean;
  phoneNumberVerified: boolean;
  badges: string[];
  platformRating: number | null;
}

export const PROFILE_TAGS = [
  'Easy to Deal With',
  'Open to Inspection',
  'Clear Communicator',
  'Fair Pricing Expectations',
  'Serious Seller',
  'Maintenance-Focused',
  'Service-Conscious',
  'Preventive Maintenance Mindset',
  'Record-Keeping Owner',
  'Timely Servicing',
] as const;
