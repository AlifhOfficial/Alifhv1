/**
 * Privacy Section Component
 * Privacy-related settings
 */

import React from 'react';

import { Section } from './Section';
import { SettingRow } from './SettingRow';
import { Toggle } from './Toggle';
import type { ThemeColors } from './types';

interface PrivacySectionProps {
  showPhone: boolean;
  useGeneratedAvatar: boolean;
  savingField: string | null;
  colors: ThemeColors;
  onToggleShowPhone: () => void;
  onToggleGeneratedAvatar: () => void;
  delay?: number;
}

export function PrivacySection({
  showPhone,
  useGeneratedAvatar,
  savingField,
  colors,
  onToggleShowPhone,
  onToggleGeneratedAvatar,
  delay = 50,
}: PrivacySectionProps) {
  return (
    <Section title="Privacy" colors={colors} delay={delay} isFirst>
      <SettingRow
        title="Show Phone Number"
        description="Display on public profile"
        colors={colors}
      >
        <Toggle
          enabled={showPhone}
          onToggle={onToggleShowPhone}
          disabled={savingField === 'showPhone'}
          colors={colors}
        />
      </SettingRow>
      <SettingRow
        title="Generated Avatar"
        description="Use robot avatar when no photo"
        colors={colors}
        isLast
      >
        <Toggle
          enabled={useGeneratedAvatar}
          onToggle={onToggleGeneratedAvatar}
          disabled={savingField === 'useGeneratedAvatar'}
          colors={colors}
        />
      </SettingRow>
    </Section>
  );
}
