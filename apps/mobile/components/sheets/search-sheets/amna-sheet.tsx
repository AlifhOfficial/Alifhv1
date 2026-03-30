/**
 * AmnaSheet - "Talk to Amna" AI Conversational Search
 * 
 * Dedicated bottom sheet for Amna, the sassy AI car search assistant.
 * User types natural language → GPT-4o-mini → structured filters → browse results.
 */

import { Text, HapticPressable } from '@/components/ui';
import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Pressable, Platform, ActivityIndicator, Keyboard, TextInput } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { Fonts, Typography, Colors, Spacing, Radius, Sizes, Layout, ZIndex} from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { searchApi } from '@/lib/search-api';

// ============================================================================
// TYPES
// ============================================================================

export interface AmnaSearchParams {
  q?: string;
  make?: string[];
  model?: string[];
  trim?: string[];
  tags?: string[];
  extras?: string[];
  bodyType?: string[];
  fuelType?: string[];
  transmission?: string[];
  specs?: string[];
  exteriorColor?: string[];
  interiorColor?: string[];
  engineSize?: string[];
  emirate?: string[];
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  mileageMax?: number;
  condition?: 'new' | 'used';
  sellerType?: 'dealer' | 'private';
  sortBy?: string;
}

interface AmnaSheetProps {
  visible: boolean;
  onClose: () => void;
  onSearch?: (params: AmnaSearchParams) => void;
  forceDark?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SNAP_POINTS = ['70%', '93%'];

const LOADING_MESSAGES = [
  'Amna is judging your taste...',
  'Consulting the car gods...',
  'Reading between the horsepower lines...',
  'Decoding your vibe...',
  'Scanning the lot with impeccable taste...',
];

function getRandomLoadingMessage(): string {
  return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]!;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AmnaSheet({ visible, onClose, onSearch, forceDark }: AmnaSheetProps) {
  const { colorScheme } = useTheme();
  // Force dark colors when on BLK tab
  const colors = Colors[forceDark ? 'dark' : colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const inputRef = useRef<TextInput>(null);

  // State
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(getRandomLoadingMessage());

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  React.useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
      // Focus input after sheet animates in
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setQuery('');
      setIsLoading(false);
      setMessage(null);
      onClose();
    }
  }, [onClose]);

  // ============================================================================
  // SUBMIT HANDLER
  // ============================================================================

  const handleSubmit = useCallback(async () => {
    const text = query.trim();
    if (!text || isLoading) return;

    setIsLoading(true);
    setMessage(null);
    setLoadingText(getRandomLoadingMessage());
    Keyboard.dismiss();

    try {
      const res = await searchApi.aiSearch(text);

      if (res.intent?.confidence > 0.1) {
        const msg = res.intent.message || res.intent.summary || 'Found something for you!';
        setMessage(msg);
        await new Promise(r => setTimeout(r, 1200));

        // Build search params from parsed intent
        const intent = res.intent;
        const params: AmnaSearchParams = {};
        if (intent.make?.length) params.make = intent.make;
        if (intent.model?.length) params.model = intent.model;
        if (intent.trim?.length) params.trim = intent.trim;
        if (intent.tags?.length) params.tags = intent.tags;
        if (intent.extras?.length) params.extras = intent.extras;
        if (intent.bodyType?.length) params.bodyType = intent.bodyType;
        if (intent.fuelType?.length) params.fuelType = intent.fuelType;
        if (intent.transmission?.length) params.transmission = intent.transmission;
        if (intent.specs?.length) params.specs = intent.specs;
        if (intent.exteriorColor?.length) params.exteriorColor = intent.exteriorColor;
        if (intent.interiorColor?.length) params.interiorColor = intent.interiorColor;
        if (intent.engineSize?.length) params.engineSize = intent.engineSize;
        if (intent.emirate?.length) params.emirate = intent.emirate;
        if (intent.priceMin) params.priceMin = intent.priceMin;
        if (intent.priceMax) params.priceMax = intent.priceMax;
        if (intent.yearMin) params.yearMin = intent.yearMin;
        if (intent.yearMax) params.yearMax = intent.yearMax;
        if (intent.mileageMax) params.mileageMax = intent.mileageMax;
        if (intent.condition) params.condition = intent.condition;
        if (intent.sellerType) params.sellerType = intent.sellerType;
        if (intent.sortBy) params.sortBy = intent.sortBy;

        const hasFilters = Object.keys(params).length > 0;

        if (hasFilters) {
          onSearch?.(params);
          bottomSheetRef.current?.dismiss();
        } else {
          // AI understood but couldn't map to filters — show message then dismiss
          setMessage(msg);
          await new Promise(r => setTimeout(r, 1500));
          onSearch?.({});
          bottomSheetRef.current?.dismiss();
        }
      } else {
        const msg = res.intent?.message || "Habibi I didn't get that, but here's everything we've got 🤷‍♀️";
        setMessage(msg);
        await new Promise(r => setTimeout(r, 2000));
        onSearch?.({});
        bottomSheetRef.current?.dismiss();
      }
    } catch {
      setMessage("Ugh, my brain glitched. Try again? 😅");
      await new Promise(r => setTimeout(r, 1500));
    } finally {
      setIsLoading(false);
    }
  }, [query, isLoading, onSearch]);

  // ============================================================================
  // RENDER
  // ============================================================================

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={SNAP_POINTS}
      enableDynamicSizing={false}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: colors.surface,
        borderTopLeftRadius: Radius.sheet,
        borderTopRightRadius: Radius.sheet,
        borderCurve: 'continuous',
      }}
      handleIndicatorStyle={{ backgroundColor: colors.labelQuaternary, width: Sizes.bubble }}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <View style={styles.container}>
        {/* Loading / Message Overlay */}
        {isLoading && (
          <View style={[styles.overlay, { backgroundColor: colors.surface }]}>
            <View style={styles.overlayContent}>
              <Ionicons name="flash" size={Spacing['4xl']} color={colors.amna} />
              <View style={{ alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.lg, width: '100%', paddingHorizontal: Spacing.md }}>
                {message ? (
                  <Text variant="subheadEmphasized" style={{ textAlign: 'center', flexShrink: 1 }}>
                    {message}
                  </Text>
                ) : (
                  <>
                    <Text variant="subheadEmphasized" style={{ textAlign: 'center', flexShrink: 1 }}>{loadingText}</Text>
                    <Text variant="subhead" tone="muted" style={{ textAlign: 'center' }}>Finding the perfect cars for you ✨</Text>
                  </>
                )}
              </View>
              {!message && <ActivityIndicator size="small" color={colors.amna} style={{ marginTop: Spacing.lg }} />}
            </View>
          </View>
        )}

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerRow}>
            <HapticPressable
              onPress={() => bottomSheetRef.current?.dismiss()}
              hitSlop={Spacing.md}
            >
              <Text variant="subhead" tone="muted">Cancel</Text>
            </HapticPressable>
            <View style={styles.headerTitle}>
              <Ionicons name="flash" size={Spacing.lg} color={colors.amna} />
              <Text variant="subheadEmphasized">Ask Amna</Text>
            </View>
            <View style={{ width: Spacing["5xl"] }} />
          </View>
        </View>

        {/* Content */}
        {!isLoading && (
          <View style={styles.content}>
            {/* Amna intro */}
            <View style={styles.intro}>
              <Text variant="subhead" tone="muted" style={{ textAlign: 'center' }}>
                Describe what you&apos;re looking for
              </Text>
            </View>

            {/* Text input */}
            <View style={[
              styles.inputBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.amnaMuted,
              },
            ]}>
              <TextInput
                ref={inputRef}
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSubmit}
                placeholder="Red SUV under 200K..."
                placeholderTextColor={colors.placeholder}
                style={[styles.textInput, { color: colors.label }]}
                multiline
                numberOfLines={4}
                returnKeyType="send"
                blurOnSubmit
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Submit button */}
            <HapticPressable
              onPress={handleSubmit}
              disabled={!query.trim()}
              style={[
                styles.submitButton,
                {
                  backgroundColor: query.trim() ? colors.amna : colors.fill2,
                },
              ]}
            >
              {({ pressed }) => (
                <View style={[styles.submitContent, { opacity: pressed ? 0.8 : 1 }]}>
                  <Ionicons
                    name="flash"
                    size={Spacing.lg}
                    color={query.trim() ? colors.primaryForeground : colors.labelQuaternary}
                  />
                  <Text
                    variant="subheadEmphasized"
                    style={{ color: query.trim() ? colors.primaryForeground : colors.labelQuaternary }}
                  >
                    Ask Amna
                  </Text>
                </View>
              )}
            </HapticPressable>

            {/* Error message display */}
            {message && !isLoading && (
              <View style={styles.messageBox}>
                <Text variant="subhead" style={{ textAlign: 'center', color: colors.amna }}>
                  {message}
                </Text>
              </View>
            )}

            {/* Quick suggestions */}
            <View style={styles.quickSuggestions}>
              <Text variant="caption1Emphasized" tone="muted" style={{ marginBottom: Spacing.sm }} uppercase>TRY ASKING</Text>
              <View style={styles.suggestionsGrid}>
                {[
                  'Surprise me 🎲',
                  'Best first car?',
                  'SUV under 100K',
                  'Toyota or Nissan?',
                  'Budget friendly',
                  'Something that turns heads',
                ].map((suggestion) => (
                  <HapticPressable
                    key={suggestion}
                    onPress={() => {
                      if (Platform.OS === 'ios') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setQuery(suggestion);
                    }}
                    style={[
                      styles.suggestionChip,
                      {
                        backgroundColor: colors.fill2,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text variant="subhead" style={{ color: colors.label }} tone="secondary">
                      {suggestion}
                    </Text>
                  </HapticPressable>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Bottom padding */}
        <View style={{ height: insets.bottom + Spacing.lg }} />
      </View>
    </BottomSheetModal>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  sheetContainer: {
    marginHorizontal: Spacing.lg,
  },
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: ZIndex.raised,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
    width: '100%',
    maxWidth: '100%',
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  intro: {
    paddingHorizontal: Spacing.md,
  },
  inputBox: {
    borderRadius: Radius.xl,
    borderWidth: 2,
    overflow: 'hidden',
  },
  textInput: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    ...Typography.subhead,
    lineHeight: Typography.subhead.lineHeight,
    minHeight: Spacing["5xl"],
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  messageBox: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  quickSuggestions: {
    marginTop: Spacing.xs,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  suggestionChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
});
