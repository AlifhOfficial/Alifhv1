/**
 * NotesStepContent — Owner Special Notes
 *
 * Content-only component for the unified flow.
 * Allows owners to add specific details/notes about their vehicle.
 *
 * @module components/sheets/create-listing/steps/notes-step
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { X, Plus } from 'lucide-react-native';

import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Body, Supporting, Label } from '@/components/ui';
import { HapticPressable } from '@/components/ui';
import { MAX_SPECIAL_NOTES, MAX_SPECIAL_NOTE_LENGTH } from '@/lib/listing-constants';

import { StepContainer } from '../step-container';
import type { StepContentProps } from '../create-listing-flow';

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

  const notes = data.specialNotes || [];

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
          <Label size="small">Special Notes</Label>
          <Supporting size="small" tone="muted">
            {notes.length}/{MAX_SPECIAL_NOTES}
          </Supporting>
        </View>
        <Supporting size="small" tone="secondary">
          Add specific details buyers should know about your vehicle
        </Supporting>
      </View>

      {/* Quick Notes */}
      <View style={styles.section}>
        <Supporting size="small" tone="muted">
          Quick add
        </Supporting>
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
                    backgroundColor: isAdded ? colors.text : colors.surface2,
                    borderColor: isAdded ? colors.text : colors.border,
                    opacity: isAdded || notes.length >= MAX_SPECIAL_NOTES ? 0.5 : 1,
                  },
                ]}
              >
                <Body
                  size="small"
                  numberOfLines={1}
                  style={{ color: isAdded ? colors.bg : colors.text }}
                >
                  {note}
                </Body>
              </HapticPressable>
            );
          })}
        </View>
      </View>

      {/* Existing Notes */}
      {notes.length > 0 && (
        <View style={styles.section}>
          <Label size="small">Your Notes</Label>
          <View style={styles.notesList}>
            {notes.map((note, index) => (
              <View
                key={index}
                style={[
                  styles.noteItem,
                  { backgroundColor: colors.surface2, borderColor: colors.border },
                ]}
              >
                <Body size="small" style={{ flex: 1 }}>
                  {note}
                </Body>
                <HapticPressable onPress={() => removeNote(index)} hitSlop={Layout.hitSlopSmall}>
                  <X size={Sizes.iconXs} color={colors.textMuted} strokeWidth={2} />
                </HapticPressable>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Custom Note Input */}
      {notes.length < MAX_SPECIAL_NOTES && (
        <View style={styles.section}>
          <Label size="small">Add Custom Note</Label>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g. New exhaust system installed"
              placeholderTextColor={colors.textMuted}
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
                color={noteInput.trim() ? colors.primaryFg : colors.textMuted}
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
    height: 48,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    fontWeight: '400',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NotesStepContent;
