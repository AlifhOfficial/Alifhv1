/**
 * Step 2 — Vehicle Specifications
 *
 * Mileage, Regional Specs, Steering, Appearance, Powertrain, Status,
 * Extras multi-select, and Tags (max 3).
 *
 * Uses collapsible sections with chip selectors — matching the
 * existing more-filters-sheet patterns.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { HapticPressable } from '@/components/ui';
import * as Haptics from 'expo-haptics';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

import { Spacing, Radius, Sizes, Layout, Typography } from '@/constants/theme';
import { Heading, Body, Supporting, ButtonText, Label } from '@/components/ui';
import {
  SPECS_TYPES,
  STEERING_SIDES,
  BODY_TYPES,
  EXTERIOR_COLORS,
  INTERIOR_COLORS,
  DOORS_OPTIONS,
  SEATING_OPTIONS,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  ENGINE_SIZES,
  ENGINE_TYPES,
  POWER_RANGES,
  EXPORT_STATUSES,
  WARRANTY_TYPES,
  VEHICLE_EXTRAS,
  LISTING_TAGS,
} from '@/lib/filter-constants';
import type { StepProps } from './types';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Collapsible Section ─────────────────────────────────────────────────────

function Section({
  title,
  colors,
  children,
  defaultOpen = false,
}: {
  title: string;
  colors: Record<string, string>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.section, { borderColor: colors.border }]}>
      <HapticPressable onPress={toggle} style={styles.sectionHeader}>
        <Label size="small" style={{ flex: 1 }}>{title}</Label>
        {open ? (
          <ChevronUp size={Sizes.iconSm} color={colors.textMuted} />
        ) : (
          <ChevronDown size={Sizes.iconSm} color={colors.textMuted} />
        )}
      </HapticPressable>
      {open && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
}

// ─── Chip Row Helper ─────────────────────────────────────────────────────────

interface ChipOption {
  value: string;
  label: string;
  hex?: string;
  icon?: string;
}

function ChipRow({
  options,
  selected,
  onSelect,
  colors,
  multi = false,
}: {
  options: readonly ChipOption[];
  selected: string | string[];
  onSelect: (value: string) => void;
  colors: Record<string, string>;
  multi?: boolean;
}) {
  return (
    <View style={styles.chipWrap}>
      {options.map((opt) => {
        const isSelected = multi
          ? (selected as string[]).includes(opt.value)
          : selected === opt.value;

        return (
          <HapticPressable
            key={opt.value}
            onPress={() => {
              onSelect(opt.value);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary,
                borderColor: isSelected ? colors.primary : colors.border,
              },
            ]}
          >
            {/* Color swatch */}
            {opt.hex && (
              <View
                style={[
                  styles.colorSwatch,
                  {
                    backgroundColor: opt.hex,
                    borderColor:
                      opt.hex === '#FFFFFF' || opt.hex === '#F5F5DC'
                        ? colors.border
                        : 'transparent',
                  },
                ]}
              />
            )}
            <Body
              size="small"
              numberOfLines={1}
              style={{ color: isSelected ? '#FFF' : colors.text }}
            >
              {opt.label}
            </Body>
          </HapticPressable>
        );
      })}
    </View>
  );
}

// ─── Main Step Component ─────────────────────────────────────────────────────

export function StepDetails({ form, updateForm, colors }: StepProps) {
  // ── Multi-select helpers ──
  const toggleExtra = useCallback(
    (value: string) => {
      const cur = form.extras;
      updateForm({
        extras: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value],
      });
    },
    [form.extras, updateForm],
  );

  const toggleTag = useCallback(
    (value: string) => {
      const cur = form.tags;
      if (cur.includes(value)) {
        updateForm({ tags: cur.filter((v) => v !== value) });
      } else if (cur.length < 3) {
        updateForm({ tags: [...cur, value] });
      }
    },
    [form.tags, updateForm],
  );

  return (
    <View style={styles.container}>
      {/* ── Required: Mileage ── */}
      <View style={styles.fieldGroup}>
        <Label size="small">Mileage (km) *</Label>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.input, color: colors.text, borderColor: colors.border }]}
          placeholder="e.g. 45000"
          placeholderTextColor={colors.textMuted}
          value={form.mileage}
          onChangeText={(t) => updateForm({ mileage: t.replace(/[^0-9]/g, '') })}
          keyboardType="number-pad"
        />
      </View>

      {/* ── Required: Regional Specs ── */}
      <View style={styles.fieldGroup}>
        <Label size="small">Regional Specs *</Label>
        <ChipRow
          options={SPECS_TYPES}
          selected={form.specs}
          onSelect={(v) => updateForm({ specs: v })}
          colors={colors}
        />
      </View>

      {/* ── Steering Side ── */}
      <View style={styles.fieldGroup}>
        <Label size="small">Steering Side</Label>
        <ChipRow
          options={STEERING_SIDES}
          selected={form.steeringSide}
          onSelect={(v) => updateForm({ steeringSide: v })}
          colors={colors}
        />
      </View>

      {/* ══════════════ Collapsible Sections ══════════════ */}

      {/* ── Appearance ── */}
      <Section title="Appearance" colors={colors}>
        <View style={styles.fieldGroup}>
          <Label size="small">Body Type</Label>
          <ChipRow
            options={BODY_TYPES}
            selected={form.bodyType}
            onSelect={(v) => updateForm({ bodyType: v })}
            colors={colors}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Label size="small">Exterior Color</Label>
          <ChipRow
            options={EXTERIOR_COLORS as unknown as ChipOption[]}
            selected={form.exteriorColor}
            onSelect={(v) => updateForm({ exteriorColor: v })}
            colors={colors}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Label size="small">Interior Color</Label>
          <ChipRow
            options={INTERIOR_COLORS as unknown as ChipOption[]}
            selected={form.interiorColor}
            onSelect={(v) => updateForm({ interiorColor: v })}
            colors={colors}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Label size="small">Doors</Label>
          <ChipRow
            options={DOORS_OPTIONS}
            selected={form.doors}
            onSelect={(v) => updateForm({ doors: v })}
            colors={colors}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Label size="small">Seating Capacity</Label>
          <ChipRow
            options={SEATING_OPTIONS}
            selected={form.seatingCapacity}
            onSelect={(v) => updateForm({ seatingCapacity: v })}
            colors={colors}
          />
        </View>
      </Section>

      {/* ── Powertrain ── */}
      <Section title="Powertrain" colors={colors}>
        <View style={styles.fieldGroup}>
          <Label size="small">Fuel Type</Label>
          <ChipRow
            options={FUEL_TYPES}
            selected={form.fuelType}
            onSelect={(v) => updateForm({ fuelType: v })}
            colors={colors}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Label size="small">Transmission</Label>
          <ChipRow
            options={TRANSMISSION_TYPES}
            selected={form.transmission}
            onSelect={(v) => updateForm({ transmission: v })}
            colors={colors}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Label size="small">Engine Size</Label>
          <ChipRow
            options={ENGINE_SIZES}
            selected={form.engineSize}
            onSelect={(v) => updateForm({ engineSize: v })}
            colors={colors}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Label size="small">Engine Type</Label>
          <ChipRow
            options={ENGINE_TYPES}
            selected={form.engineType}
            onSelect={(v) => updateForm({ engineType: v })}
            colors={colors}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Label size="small">Cylinders</Label>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.input, color: colors.text, borderColor: colors.border }]}
            placeholder="e.g. 4, 6, 8"
            placeholderTextColor={colors.textMuted}
            value={form.cylinders}
            onChangeText={(t) => updateForm({ cylinders: t.replace(/[^0-9]/g, '') })}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Label size="small">Power Range</Label>
          <ChipRow
            options={POWER_RANGES}
            selected={form.powerRange}
            onSelect={(v) => updateForm({ powerRange: v })}
            colors={colors}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Label size="small">Fuel Economy</Label>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.input, color: colors.text, borderColor: colors.border }]}
            placeholder="e.g. 8.5 L/100km"
            placeholderTextColor={colors.textMuted}
            value={form.fuelEconomy}
            onChangeText={(t) => updateForm({ fuelEconomy: t })}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Label size="small">Torque</Label>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.input, color: colors.text, borderColor: colors.border }]}
            placeholder="e.g. 350 Nm"
            placeholderTextColor={colors.textMuted}
            value={form.torque}
            onChangeText={(t) => updateForm({ torque: t })}
          />
        </View>
      </Section>

      {/* ── Status & Warranty ── */}
      <Section title="Status & Warranty" colors={colors}>
        <View style={styles.fieldGroup}>
          <Label size="small">Warranty</Label>
          <ChipRow
            options={WARRANTY_TYPES}
            selected={form.warrantyType}
            onSelect={(v) => updateForm({ warrantyType: v })}
            colors={colors}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Label size="small">Export Status</Label>
          <ChipRow
            options={EXPORT_STATUSES}
            selected={form.exportStatus}
            onSelect={(v) => updateForm({ exportStatus: v })}
            colors={colors}
          />
        </View>
      </Section>

      {/* ── Extras (multi-select) ── */}
      <Section title="Features & Extras" colors={colors}>
        <ChipRow
          options={VEHICLE_EXTRAS}
          selected={form.extras}
          onSelect={toggleExtra}
          colors={colors}
          multi
        />
      </Section>

      {/* ── Tags (multi-select, max 3) ── */}
      <Section title="Listing Tags" colors={colors}>
        <Supporting size="small" tone="secondary" style={{ marginBottom: Spacing.sm }}>
          Choose up to 3 tags that highlight your car
        </Supporting>
        <ChipRow
          options={LISTING_TAGS as unknown as ChipOption[]}
          selected={form.tags}
          onSelect={toggleTag}
          colors={colors}
          multi
        />
        <Supporting size="mini" tone="muted" style={{ marginTop: Spacing.sm }}>
          {form.tags.length}/3 selected
        </Supporting>
      </Section>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: Spacing['2xl'],
  },
  section: {
    borderWidth: 1,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  sectionBody: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.xl,
  },
  fieldGroup: {
    gap: Spacing.sm,
  },
  textInput: {
    height: Sizes.actionButtonLg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    ...Typography.bodyMedium,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs, // was 6
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  colorSwatch: {
    width: Sizes.iconXs,
    height: Sizes.iconXs,
    borderRadius: Sizes.iconXs / 2,
    borderWidth: 1,
  },
});
