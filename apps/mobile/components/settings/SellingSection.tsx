/**
 * Selling Section Component
 * Consignment and selling-related settings
 */

import React from 'react';

import { Section } from './Section';
import { SettingRow } from './SettingRow';
import { Toggle } from './Toggle';
import type { ThemeColors } from './types';

interface SellingSectionProps {
  consignmentMode: boolean;
  savingField: string | null;
  colors: ThemeColors;
  onToggleConsignment: () => void;
  delay?: number;
}

export function SellingSection({
  consignmentMode,
  savingField,
  colors,
  onToggleConsignment,
  delay = 150,
}: SellingSectionProps) {
  return (
    <Section colors={colors} delay={delay}>
      <SettingRow
        title="Consignment Mode"
        description="Receive offers from qualified partners"
        colors={colors}
        isLast
      >
        <Toggle
          enabled={consignmentMode}
          onToggle={onToggleConsignment}
          disabled={savingField === 'consignmentMode'}
          colors={colors}
        />
      </SettingRow>
    </Section>
  );
}
