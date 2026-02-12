/**
 * Step 3 — Price, Photos & Publish
 *
 * Price input with negotiable toggle, Emirate picker, City input,
 * image upload grid, description, and special notes.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { HapticPressable } from '@/components/ui';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import {
  Camera,
  X,
  Plus,
  ImagePlus,
  GripVertical,
} from 'lucide-react-native';

import { Spacing, Radius } from '@/constants/theme';
import { Heading, Body, Supporting, ButtonText, Label } from '@/components/ui';
import { UAE_EMIRATES } from '@/lib/filter-constants';
import { pickAndUploadListingImage, deleteListingImageByUrl } from '../utilities/image-upload';
import type { StepProps } from './types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_GAP = Spacing.sm;
const GRID_PADDING = 0;
const IMAGES_PER_ROW = 3;
const IMAGE_SIZE =
  (SCREEN_WIDTH - 2 * 16 - GRID_PADDING * 2 - IMAGE_GAP * (IMAGES_PER_ROW - 1)) /
  IMAGES_PER_ROW;
const MAX_IMAGES = 20;
const MAX_DESCRIPTION = 700;
const MAX_NOTES = 10;

// ─── Emirate Chip Row (reuse pattern) ────────────────────────────────────────

function EmirateChips({
  selected,
  onSelect,
  colors,
}: {
  selected: string;
  onSelect: (v: string) => void;
  colors: Record<string, string>;
}) {
  return (
    <View style={styles.chipWrap}>
      {UAE_EMIRATES.map((e) => {
        const isSelected = selected === e.value;
        return (
          <HapticPressable
            key={e.value}
            onPress={() => {
              onSelect(e.value);
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
            <Body
              size="small"
              numberOfLines={1}
              style={{ color: isSelected ? '#FFF' : colors.text }}
            >
              {e.label}
            </Body>
          </HapticPressable>
        );
      })}
    </View>
  );
}

// ─── Main Step Component ─────────────────────────────────────────────────────

export function StepMedia({ form, updateForm, colors }: StepProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [noteInput, setNoteInput] = useState('');

  // ── Image upload ──
  const handlePickImages = useCallback(async () => {
    if (form.images.length >= MAX_IMAGES) {
      Alert.alert('Limit Reached', `Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }
    if (!form.vinVerified) {
      Alert.alert(
        'VIN Required',
        'Please verify your VIN in Step 1 before uploading images.',
      );
      return;
    }

    setUploading(true);
    try {
      const result = await pickAndUploadListingImage({
        vin: form.vin,
        allowMultiple: true,
        maxImages: MAX_IMAGES - form.images.length,
        onProgress: (done, total) => setUploadProgress({ done, total }),
      });

      if (result.success && result.images.length > 0) {
        const newUrls = result.images.map((img) => img.url);
        updateForm({ images: [...form.images, ...newUrls] });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      if (result.errors.length > 0) {
        Alert.alert('Upload Issues', result.errors.join('\n'));
      }
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message ?? 'Something went wrong.');
    } finally {
      setUploading(false);
      setUploadProgress({ done: 0, total: 0 });
    }
  }, [form.vin, form.images, updateForm]);

  const handleDeleteImage = useCallback(
    async (url: string) => {
      Alert.alert('Remove Image', 'Delete this image?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteListingImageByUrl(url);
            } catch {
              /* best-effort */
            }
            updateForm({ images: form.images.filter((u) => u !== url) });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ]);
    },
    [form.images, updateForm],
  );

  // ── Notes ──
  const addNote = useCallback(() => {
    const note = noteInput.trim();
    if (!note || form.specialNotes.length >= MAX_NOTES) return;
    updateForm({ specialNotes: [...form.specialNotes, note] });
    setNoteInput('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [noteInput, form.specialNotes, updateForm]);

  const removeNote = useCallback(
    (index: number) => {
      updateForm({
        specialNotes: form.specialNotes.filter((_, i) => i !== index),
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [form.specialNotes, updateForm],
  );

  return (
    <View style={styles.container}>
      {/* ══════════ Price ══════════ */}
      <View style={styles.fieldGroup}>
        <Label size="small">Price (AED) *</Label>
        <TextInput
          style={[
            styles.textInput,
            styles.priceInput,
            { backgroundColor: colors.input, color: colors.text, borderColor: colors.border },
          ]}
          placeholder="e.g. 125000"
          placeholderTextColor={colors.textMuted}
          value={form.price}
          onChangeText={(t) => updateForm({ price: t.replace(/[^0-9]/g, '') })}
          keyboardType="number-pad"
        />
        {form.price && (
          <Supporting size="small" tone="secondary">
            AED {parseInt(form.price, 10).toLocaleString()}
          </Supporting>
        )}
      </View>

      {/* ── Negotiable toggle ── */}
      <HapticPressable
        onPress={() => {
          updateForm({ isNegotiable: !form.isNegotiable });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        style={[styles.toggleRow, { borderColor: colors.border }]}
      >
        <Body size="medium" style={{ flex: 1 }}>Price is negotiable</Body>
        <View
          style={[
            styles.toggleTrack,
            {
              backgroundColor: form.isNegotiable ? colors.primary : colors.fillSecondary,
            },
          ]}
        >
          <View
            style={[
              styles.toggleThumb,
              {
                backgroundColor: '#FFF',
                transform: [{ translateX: form.isNegotiable ? 20 : 2 }],
              },
            ]}
          />
        </View>
      </HapticPressable>

      {/* ══════════ Location ══════════ */}
      <View style={styles.fieldGroup}>
        <Heading size="small">Location</Heading>
      </View>

      <View style={styles.fieldGroup}>
        <Label size="small">Emirate *</Label>
        <EmirateChips
          selected={form.emirate}
          onSelect={(v) => updateForm({ emirate: v })}
          colors={colors}
        />
      </View>

      <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
          <Label size="small">City / Area</Label>
          <Supporting size="mini" tone="muted">Optional</Supporting>
        </View>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.input, color: colors.text, borderColor: colors.border }]}
          placeholder="e.g. Marina, Downtown, JBR"
          placeholderTextColor={colors.textMuted}
          value={form.city}
          onChangeText={(t) => updateForm({ city: t })}
        />
      </View>

      {/* ══════════ Photos ══════════ */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
          <Heading size="small">Photos</Heading>
          <Supporting size="mini" tone="muted">
            {form.images.length}/{MAX_IMAGES}
          </Supporting>
        </View>
        <Supporting size="small" tone="secondary">
          First image becomes your listing thumbnail
        </Supporting>
      </View>

      <View style={styles.imageGrid}>
        {/* Existing images */}
        {form.images.map((url, index) => (
          <View key={url} style={styles.imageWrapper}>
            <Image source={{ uri: url }} style={styles.imageThumb} />
            {index === 0 && (
              <View style={[styles.thumbnailBadge, { backgroundColor: colors.primary }]}>
                <Supporting size="mini" style={{ color: '#FFF' }}>Cover</Supporting>
              </View>
            )}
            <HapticPressable
              onPress={() => handleDeleteImage(url)}
              style={[styles.imageDeleteBtn, { backgroundColor: colors.error }]}
              hitSlop={6}
            >
              <X size={12} color="#FFF" strokeWidth={3} />
            </HapticPressable>
          </View>
        ))}

        {/* Add button */}
        {form.images.length < MAX_IMAGES && (
          <HapticPressable
            onPress={handlePickImages}
            disabled={uploading}
            style={[
              styles.addImageBtn,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            ]}
          >
            {uploading ? (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Supporting size="mini" tone="muted">
                  {uploadProgress.done}/{uploadProgress.total}
                </Supporting>
              </View>
            ) : (
              <>
                <ImagePlus size={24} color={colors.textMuted} />
                <Supporting size="mini" tone="muted">Add</Supporting>
              </>
            )}
          </HapticPressable>
        )}
      </View>

      {/* ══════════ Description ══════════ */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
          <Heading size="small">Description</Heading>
          <Supporting size="mini" tone="muted">Optional</Supporting>
        </View>
        <TextInput
          style={[
            styles.textInput,
            styles.textArea,
            { backgroundColor: colors.input, color: colors.text, borderColor: colors.border },
          ]}
          placeholder="Tell buyers about your car — service history, modifications, reasons for selling..."
          placeholderTextColor={colors.textMuted}
          value={form.description}
          onChangeText={(t) => updateForm({ description: t.slice(0, MAX_DESCRIPTION) })}
          multiline
          textAlignVertical="top"
          maxLength={MAX_DESCRIPTION}
        />
        <Supporting size="mini" tone="muted" style={{ alignSelf: 'flex-end' }}>
          {form.description.length}/{MAX_DESCRIPTION}
        </Supporting>
      </View>

      {/* ══════════ Special Notes ══════════ */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
          <Heading size="small">Special Notes</Heading>
          <Supporting size="mini" tone="muted">{form.specialNotes.length}/{MAX_NOTES}</Supporting>
        </View>
        <Supporting size="small" tone="secondary">
          Add specific details buyers should know
        </Supporting>

        {/* Existing notes */}
        {form.specialNotes.map((note, index) => (
          <View
            key={index}
            style={[styles.noteItem, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
          >
            <Body size="small" style={{ flex: 1 }}>{note}</Body>
            <HapticPressable onPress={() => removeNote(index)} hitSlop={8}>
              <X size={16} color={colors.textMuted} />
            </HapticPressable>
          </View>
        ))}

        {/* Add note input */}
        {form.specialNotes.length < MAX_NOTES && (
          <View style={styles.noteInputRow}>
            <TextInput
              style={[
                styles.textInput,
                { flex: 1, backgroundColor: colors.input, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="e.g. Recently replaced all 4 tires"
              placeholderTextColor={colors.textMuted}
              value={noteInput}
              onChangeText={setNoteInput}
              onSubmitEditing={addNote}
              returnKeyType="done"
            />
            <HapticPressable
              onPress={addNote}
              disabled={!noteInput.trim()}
              style={[
                styles.noteAddBtn,
                {
                  backgroundColor: noteInput.trim() ? colors.primary : colors.fillSecondary,
                },
              ]}
            >
              <Plus size={20} color={noteInput.trim() ? '#FFF' : colors.textMuted} />
            </HapticPressable>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: Spacing['2xl'],
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
    height: 48,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  priceInput: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    height: 56,
  },
  textArea: {
    height: 120,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    textAlignVertical: 'top',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  // Image grid
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: IMAGE_GAP,
  },
  imageWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  imageThumb: {
    width: '100%',
    height: '100%',
  },
  thumbnailBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  imageDeleteBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageBtn: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  uploadingContainer: {
    alignItems: 'center',
    gap: 4,
  },
  // Notes
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  noteInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  noteAddBtn: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
