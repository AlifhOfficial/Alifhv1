/**
 * NotesStepContent — Owner Special Notes
 *
 * Content-only component for the unified flow.
 * Allows owners to add specific details/notes about their vehicle.
 *
 * @module components/sheets/create-listing/steps/notes-step
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { X, Plus } from 'lucide-react-native';

import { Typography, Colors, Spacing, Radius, Sizes, Layout, SheetTypography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { MAX_SPECIAL_NOTES, MAX_SPECIAL_NOTE_LENGTH } from '@/lib/listing-constants';

import { StepContainer } from '../step-container';
import type { StepContentProps } from '../types';

// ─────────────────────────────────────────────────────────────────────────────

const QUICK_NOTES = [
  'Recently replaced all 4 tires',
  'Full service completed at authorized dealer',
  'New battery installed',
  'No mechanical issues',
  'All maintenance up to date',
];

// ─────────────────────────────────────────────────────────────────────────────

export function NotesStepContent({ data, onUpdate }: StepContentProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [noteInput, setNoteInput] = useState('');

  const notes = useMemo(() => data.specialNotes || [], [data.specialNotes]);

  const addNote = useCallback(() => {
    const trimmed = noteInput.trim();
    if (!trimmed || notes.length >= MAX_SPECIAL_NOTES) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUpdate({ specialNotes: [...notes, trimmed.slice(0, MAX_SPECIAL_NOTE_LENGTH)] });
    setNoteInput('');
  }, [noteInput, notes, onUpdate]);

  const addQuickNote = useCallback(
    (note: string) => {
      if (notes.length >= MAX_SPECIAL_NOTES || notes.includes(note)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUpdate({ specialNotes: [...notes, note] });
    },
    [notes, onUpdate]
  );

  const removeNote = useCallback(
    (index: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onUpdate({ specialNotes: notes.filter((_, i) => i !== index) });
    },
    [notes, onUpdate]
  );

  return (
    <StepContainer>
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Text variant={SheetTypography.rowLabel} tone="secondary">Special Notes</Text>
          <Text variant={SheetTypography.supporting} tone="muted">
            {notes.length}/{MAX_SPECIAL_NOTES}
          </Text>
        </View>
        <Text variant={SheetTypography.supporting} tone="secondary">
          Add specific details buyers should know about your vehicle
        </Text>
      </View>

      {/* Quick Notes */}
      <View style={styles.section}>
        <Text variant={SheetTypography.rowLabel} tone="secondary">
          Quick add
        </Text>
        <View style={styles.chipsWrap}>
          {QUICK_NOTES.map((note, idx) => {
            const isAdded = notes.includes(note);
            return (
              <HapticPressable
                key={idx}
                onPress={() => addQuickNote(note)}
                disabled={isAdded || notes.length >= MAX_SPECIAL_NOTES}
                style={[
                  styles.quickChip,
                  {
                    backgroundColor: isAdded ? colors.label : colors.surfaceSecondary,
                    borderColor: isAdded ? colors.label : colors.border,
                    opacity: isAdded || notes.length >= MAX_SPECIAL_NOTES ? 0.5 : 1,
                  },
                ]}
              >
                <Text
                  variant={isAdded ? SheetTypography.rowLabelSelected : SheetTypography.rowLabel}
                  numberOfLines={1}
                  style={{ color: isAdded ? colors.background : colors.label }}
                >
                  {note}
                </Text>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {/* Existing Notes */}
      {notes.length > 0 && (
        <View style={styles.section}>
          <Text variant={SheetTypography.rowLabel} tone="secondary">Your Notes</Text>
          <View style={styles.notesList}>
            {notes.map((note, index) => (
              <View
                key={index}
                style={[
                  styles.noteItem,
                  { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                ]}
              >
                <Text variant={SheetTypography.rowLabel} style={{ flex: 1 }}>
                  {note}
                </Text>
                <HapticPressable onPress={() => removeNote(index)} hitSlop={Layout.hitSlopSmall}>
                  <X size={Sizes.iconXs} color={colors.labelQuaternary} strokeWidth={2} />
                </HapticPressable>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Custom Note Input */}
      {notes.length < MAX_SPECIAL_NOTES && (
        <View style={styles.section}>
          <Text variant={SheetTypography.rowLabel} tone="secondary">Add Custom Note</Text>
          <Text variant={SheetTypography.supporting} tone="muted">
            Keep each note concise and specific
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceSecondary,
                  color: colors.label,
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g. New exhaust system installed"
              placeholderTextColor={colors.labelQuaternary}
              value={noteInput}
              onChangeText={setNoteInput}
              onSubmitEditing={addNote}
              returnKeyType="done"
              maxLength={MAX_SPECIAL_NOTE_LENGTH}
            />
            <HapticPressable
              onPress={addNote}
              disabled={!noteInput.trim()}
              style={[
                styles.addButton,
                {
                  backgroundColor: noteInput.trim() ? colors.primary : colors.fill2,
                },
              ]}
            >
              <Plus
                size={Sizes.iconSm}
                color={noteInput.trim() ? colors.primaryForeground : colors.labelQuaternary}
                strokeWidth={2}
              />
            </HapticPressable>
          </View>
        </View>
      )}
    </StepContainer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  quickChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    maxWidth: '100%',
  },
  notesList: {
    gap: Spacing.sm,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    height: Sizes.actionButtonLg,
    borderWidth: 1,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    ...Typography.subhead,
  },
  addButton: {
    width: Sizes.actionButtonLg,
    height: Sizes.actionButtonLg,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NotesStepContent;
