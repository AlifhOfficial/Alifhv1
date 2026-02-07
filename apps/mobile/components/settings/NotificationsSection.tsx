/**
 * Notifications Section Component
 * Push and email notification settings
 */

import React from 'react';

import { Section } from './Section';
import { SettingRow } from './SettingRow';
import { Toggle } from './Toggle';
import type { ThemeColors } from './types';

interface NotificationsSectionProps {
  pushEnabled: boolean;
  emailEnabled: boolean;
  colors: ThemeColors;
  onTogglePush: () => void;
  onToggleEmail: () => void;
  delay?: number;
}

export function NotificationsSection({
  pushEnabled,
  emailEnabled,
  colors,
  onTogglePush,
  onToggleEmail,
  delay = 100,
}: NotificationsSectionProps) {
  return (
    <Section title="Notifications" colors={colors} delay={delay}>
      <SettingRow
        title="Push Notifications"
        description="Get notified on your device"
        colors={colors}
      >
        <Toggle enabled={pushEnabled} onToggle={onTogglePush} colors={colors} />
      </SettingRow>
      <SettingRow
        title="Email Notifications"
        description="Receive updates via email"
        colors={colors}
        isLast
      >
        <Toggle enabled={emailEnabled} onToggle={onToggleEmail} colors={colors} />
      </SettingRow>
    </Section>
  );
}
