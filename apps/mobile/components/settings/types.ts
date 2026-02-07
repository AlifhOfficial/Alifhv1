/**
 * Settings Component Types
 */

import { Colors } from '@/constants/theme';

export type ThemeColors = typeof Colors.light & {
  isDark: boolean;
};

export interface SettingsProfile {
  privacySettings?: {
    showPhone?: boolean;
  };
  preferences?: {
    useGeneratedAvatar?: boolean;
  };
  consignmentMode?: boolean;
}

export interface Passkey {
  id: string;
  name: string;
  createdAt: string;
}

export interface NotificationSettings {
  push: boolean;
  email: boolean;
}
