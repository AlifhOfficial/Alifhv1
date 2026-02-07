/**
 * Saved Component Types
 */

import { Colors } from '@/constants/theme';

export type ThemeColors = typeof Colors.light;

export type SavedTab = 'favorites' | 'superlikes';

export interface SavedQuota {
  currentMonthSuperlikesUsed: number;
  maxSuperlikesPerMonth: number;
  premiumSuperlikesBonus: number;
  remaining: number;
  periodEndDate?: string | Date | null;
  periodStartDate?: string | Date | null;
}
