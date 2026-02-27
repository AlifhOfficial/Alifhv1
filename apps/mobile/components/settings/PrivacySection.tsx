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
  savingField: string | null;
  colors: ThemeColors;
  onToggleShowPhone: () => void;
  delay?: number;
}

export function PrivacySection({
  showPhone,
  savingField,
  colors,
  onToggleShowPhone,
  delay = 50,
}: PrivacySectionProps) {
  return (
    <Section title="Privacy" colors={colors} delay={delay} isFirst>
      <SettingRow
        title="Show Phone Number"
        description="Display on public profile"
        colors={colors}
        isLast
      >
        <Toggle
          enabled={showPhone}
          onToggle={onToggleShowPhone}
          disabled={savingField === 'showPhone'}
          colors={colors}
        />
      </SettingRow>
    </Section>
  );
}
