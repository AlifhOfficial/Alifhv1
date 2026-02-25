/**
 * Step 1 — Identify Your Vehicle
 *
 * VIN is required (exactly 17 chars). Auto-decodes at 17 characters
 * and verifies uniqueness before allowing progression.
 * Make / Model / Year / Trim can be auto-filled from VIN decode.
 */

import React, { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Switch,
} from 'react-native';
import { HapticPressable } from '@/components/ui';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Search, X, ChevronDown, Info } from 'lucide-react-native';

import { Spacing, Radius, Colors, Sizes, Layout, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, Supporting, ButtonText, Label } from '@/components/ui';
import { CAR_MAKES, getModelsForMake } from '@/lib/filter-constants';
import { checkVin } from '@/lib/sell-car-user-api';
import type { StepProps } from './types';

// ─── Sub-component: Picker Sheet (inline) ────────────────────────────────────

interface InlinePickerProps {
  title: string;
  options: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  colors: Record<string, string>;
}

function InlinePicker({
  title,
  options,
  selected,
  onSelect,
  placeholder = 'Select',
  searchable = false,
  colors,
}: InlinePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query, searchable]);

  if (!open) {
    return (
      <HapticPressable
        onPress={() => {
          setOpen(true);
          setQuery('');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        style={[styles.selectButton, { backgroundColor: colors.input, borderColor: colors.border }]}
      >
        <Body
          size="medium"
          style={{ color: selected ? colors.text : colors.textMuted, flex: 1 }}
          numberOfLines={1}
        >
          {selected || placeholder}
        </Body>
        <ChevronDown size={Sizes.iconSm} color={colors.textMuted} />
      </HapticPressable>
    );
  }

  return (
    <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Search */}
      {searchable && (
        <View style={[styles.pickerSearch, { backgroundColor: colors.fillSecondary }]}>
          <Search size={Sizes.iconXs} color={colors.textMuted} />
          <TextInput
            style={[styles.pickerSearchInput, { color: colors.text }]}
            placeholder={`Search ${title.toLowerCase()}...`}
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            autoCorrect={false}
          />
          {query.length > 0 && (
            <HapticPressable onPress={() => setQuery('')} hitSlop={Layout.hitSlopSmall}>
              <X size={Sizes.iconXs} color={colors.textMuted} />
            </HapticPressable>
          )}
        </View>
      )}
      {/* Options */}
      <ScrollView
        style={{ maxHeight: 220 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {filtered.map((item) => {
          const isSelected = item === selected;
          return (
            <HapticPressable
              key={item}
              onPress={() => {
                onSelect(item);
                setOpen(false);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.pickerOption,
                { backgroundColor: isSelected ? colors.surfaceSecondary : 'transparent' },
              ]}
            >
              <Body
                size="medium"
                style={{ color: isSelected ? colors.text : colors.textSecondary }}
              >
                {item}
              </Body>
            </HapticPressable>
          );
        })}
      </ScrollView>
      {/* Close */}
      <HapticPressable
        onPress={() => setOpen(false)}
        style={[styles.pickerDone, { backgroundColor: colors.primary }]}
      >
        <ButtonText size="small" style={{ color: '#FFF' }}>Done</ButtonText>
      </HapticPressable>
    </View>
  );
}

// ─── Main Step Component ─────────────────────────────────────────────────────

export function StepVehicleId({ form, updateForm, colors }: StepProps) {
  const [vinLoading, setVinLoading] = useState(false);
  const [vinError, setVinError] = useState<string | null>(null);
  const [vinDecodedFields, setVinDecodedFields] = useState<string[]>([]);
  const lastCheckedVin = useRef<string>('');

  const models = useMemo(() => {
    if (!form.make) return [];
    return [...getModelsForMake(form.make)];
  }, [form.make]);

  // Generate year options (current+1 down to 1970)
  const years = useMemo(() => {
    const max = new Date().getFullYear() + 1;
    return Array.from({ length: max - 1969 }, (_, i) => String(max - i));
  }, []);

  // VIN status for visual feedback
  const vinStatus: 'idle' | 'checking' | 'verified' | 'taken' | 'error' = vinLoading
    ? 'checking'
    : vinError
      ? (vinError.includes('already') ? 'taken' : 'error')
      : form.vinVerified
        ? 'verified'
        : 'idle';

  // ── Core decode function ──
  const decodeVin = useCallback(async (vin: string) => {
    if (vin.length !== 17 || vin === lastCheckedVin.current) return;
    lastCheckedVin.current = vin;

    setVinLoading(true);
    setVinError(null);
    setVinDecodedFields([]);
    updateForm({ vinVerified: false });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await checkVin(vin);

      if (!result.isUnique) {
        setVinError('A listing with this VIN already exists');
        updateForm({ vinVerified: false });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      // VIN is unique — mark verified
      updateForm({ vinVerified: true });

      // Auto-fill decoded fields
      const filled: string[] = [];
      if (result.nhtsa) {
        const n = result.nhtsa;
        const updates: Partial<typeof form> = {};
        if (n.make && CAR_MAKES.includes(n.make as any)) {
          updates.make = n.make;
          filled.push('Make');
          // Only set model if it’s valid for this make
          if (n.model) {
            const validModels = getModelsForMake(n.make);
            if (validModels.includes(n.model)) {
              updates.model = n.model;
              filled.push('Model');
            }
          }
        }
        if (n.year) { updates.year = n.year; filled.push('Year'); }
        if (n.trim) { updates.trim = n.trim; filled.push('Trim'); }
        if (n.bodyType) { updates.bodyType = n.bodyType; filled.push('Body'); }
        if (n.fuelType) { updates.fuelType = n.fuelType; filled.push('Fuel'); }
        if (n.engineSize) { updates.engineSize = n.engineSize; filled.push('Engine'); }
        if (n.cylinders) { updates.cylinders = n.cylinders; filled.push('Cylinders'); }
        if (n.transmission) { updates.transmission = n.transmission; filled.push('Transmission'); }
        if (n.doors) { updates.doors = n.doors; filled.push('Doors'); }

        if (Object.keys(updates).length > 0) {
          updateForm(updates);
          setVinDecodedFields(filled);
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      setVinError(err.message ?? 'VIN check failed');
      updateForm({ vinVerified: false });
    } finally {
      setVinLoading(false);
    }
  }, [updateForm]);

  // ── Auto-trigger decode when VIN reaches 17 chars (like web) ──
  useEffect(() => {
    if (form.vin.length === 17 && !form.vinVerified && !vinLoading) {
      decodeVin(form.vin);
    }
  }, [form.vin]);

  return (
      <View style={styles.container}>
        {/* Section: VIN */}
        <View style={styles.section}>
          <Heading size="small">Vehicle Identification</Heading>
          <Supporting size="small" tone="secondary" style={styles.sectionHint}>
            Enter your 17-character VIN to verify ownership & auto-fill specs
          </Supporting>

          <View style={styles.vinRow}>
            <View style={{ flex: 1 }}>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.input,
                    color: colors.text,
                    borderColor:
                      vinStatus === 'taken' || vinStatus === 'error'
                        ? colors.error
                        : vinStatus === 'verified'
                          ? colors.primary
                          : colors.border,
                  },
                ]}
                placeholder="Enter 17-character VIN"
                placeholderTextColor={colors.textMuted}
                value={form.vin}
                onChangeText={(text) => {
                  const cleaned = text.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
                  updateForm({ vin: cleaned, vinVerified: false });
                  setVinError(null);
                  setVinDecodedFields([]);
                  lastCheckedVin.current = '';
                }}
                maxLength={17}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              {/* Status icon inside input */}
              <View style={styles.vinStatusIcon}>
                {vinStatus === 'checking' && (
                  <ActivityIndicator size="small" color={colors.primary} />
                )}
                {vinStatus === 'verified' && (
                  <Ionicons name="checkmark-circle" size={Sizes.iconMd} color={colors.primary} />
                )}
                {(vinStatus === 'taken' || vinStatus === 'error') && (
                  <Ionicons name="alert-circle" size={Sizes.iconMd} color={colors.error} />
                )}
              </View>
            </View>
          </View>

          {/* Character count */}
          <Supporting size="mini" tone="muted">
            {form.vin.length}/17 characters
          </Supporting>

          {/* Error message */}
          {vinError && (
            <View style={[styles.vinMessage, { backgroundColor: colors.errorMuted }]}>
              <Ionicons name="alert-circle" size={Sizes.iconXs} color={colors.error} />
              <Supporting size="small" tone="error" style={{ flex: 1 }}>{vinError}</Supporting>
            </View>
          )}

          {/* Success message */}
          {form.vinVerified && !vinError && (
            <View style={[styles.vinMessage, { backgroundColor: colors.primaryMuted }]}>
              <Ionicons name="checkmark-circle" size={Sizes.iconXs} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Supporting size="small" style={{ color: colors.primary }}>
                  VIN verified{vinDecodedFields.length > 0 ? ' — auto-filled:' : ''}
                </Supporting>
                {vinDecodedFields.length > 0 && (
                  <Supporting size="mini" style={{ color: colors.primary }}>
                    {vinDecodedFields.join(', ')}
                  </Supporting>
                )}
              </View>
            </View>
          )}

          {/* Retry button if failed */}
          {vinStatus === 'error' && form.vin.length === 17 && (
            <HapticPressable
              onPress={() => decodeVin(form.vin)}
              style={[styles.retryBtn, { backgroundColor: colors.fillSecondary }]}
            >
              <ButtonText size="small" style={{ color: colors.primary }}>Retry Verification</ButtonText>
            </HapticPressable>
          )}

          {/* VIN Visibility Toggle - Only show when VIN is verified */}
          {form.vinVerified && (
            <View style={[styles.vinVisibilityRow, { backgroundColor: colors.fillSecondary }]}>
              <View style={{ flex: 1 }}>
                <Body size="small" style={{ color: colors.text }}>Show VIN on listing</Body>
                <Supporting size="mini" tone="muted">
                  {form.showVin 
                    ? '✓ 15% ranking boost • Buyers trust visible VINs' 
                    : '"VIN Verified" badge shown — no ranking boost'
                  }
                </Supporting>
              </View>
              <Switch
                value={form.showVin}
                onValueChange={(value) => {
                  updateForm({ showVin: value });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                trackColor={{ false: colors.border, true: colors.primaryMuted }}
                thumbColor={form.showVin ? colors.primary : colors.textMuted}
              />
            </View>
          )}

          <View style={[styles.vinNote, { backgroundColor: colors.fillSecondary }]}>
            <Info size={Sizes.iconXs} color={colors.textMuted} />
            <Supporting size="mini" tone="muted" style={{ flex: 1 }}>
              VIN is verified for uniqueness. If decode fails, you can still fill in details manually below.
            </Supporting>
          </View>
        </View>

        {/* Section: Make / Model / Year / Trim */}
        <View style={styles.section}>
          <Heading size="small">Vehicle Details</Heading>

          {/* Make */}
          <View style={styles.fieldGroup}>
            <Label size="small">Make *</Label>
            <InlinePicker
              title="Make"
              options={[...CAR_MAKES]}
              selected={form.make}
              onSelect={(value) => updateForm({ make: value, model: '' })}
              placeholder="Select make"
              searchable
              colors={colors}
            />
          </View>

          {/* Model */}
          <View style={styles.fieldGroup}>
            <Label size="small">Model *</Label>
            <InlinePicker
              title="Model"
              options={models}
              selected={form.model}
              onSelect={(value) => updateForm({ model: value })}
              placeholder={form.make ? 'Select model' : 'Select make first'}
              searchable={models.length > 10}
              colors={colors}
            />
          </View>

          {/* Year */}
          <View style={styles.fieldGroup}>
            <Label size="small">Year *</Label>
            <InlinePicker
              title="Year"
              options={years}
              selected={form.year}
              onSelect={(value) => updateForm({ year: value })}
              placeholder="Select year"
              searchable
              colors={colors}
            />
          </View>

          {/* Trim */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Label size="small">Trim</Label>
              <Supporting size="mini" tone="muted">Optional</Supporting>
            </View>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.input, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. SE, Limited, Sport"
              placeholderTextColor={colors.textMuted}
              value={form.trim}
              onChangeText={(text) => updateForm({ trim: text })}
              autoCorrect={false}
            />
          </View>
        </View>
      </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: Spacing['2xl'],
  },
  section: {
    gap: Spacing.md,
  },
  sectionHint: {
    marginTop: -Spacing.sm,
  },
  vinStatusIcon: {
    position: 'absolute',
    right: Spacing.md,
    top: Spacing.md + 2, // vertically center in 48px input
  },
  retryBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  fieldGroup: {
    gap: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textInput: {
    height: Sizes.actionButtonLg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    ...Typography.bodyMedium,
  },
  vinRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  vinMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  vinNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  vinVisibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  // Inline picker
  selectButton: {
    height: Sizes.actionButtonLg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  pickerContainer: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pickerSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: Sizes.actionButtonMd + Spacing.xs, // 44px
  },
  pickerSearchInput: {
    flex: 1,
    ...Typography.bodyMedium,
    height: Sizes.actionButtonMd + Spacing.xs, // 44px
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  pickerDone: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    margin: Spacing.sm,
    borderRadius: Radius.md,
  },
});
