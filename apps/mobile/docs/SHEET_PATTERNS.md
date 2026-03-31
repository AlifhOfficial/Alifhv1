# Bottom Sheet UI/UX Patterns Guide

> Comprehensive reference for building bottom sheets in the Alifh mobile app.
> Based on: `SearchSheet`, `MakeFilterSheet`, `ModelFilterSheet`

---

## Table of Contents

1. [File Structure](#1-file-structure)
2. [Imports Pattern](#2-imports-pattern)
3. [Component Architecture](#3-component-architecture)
4. [Sheet Configuration](#4-sheet-configuration)
5. [Header Pattern](#5-header-pattern)
6. [Typography Usage](#6-typography-usage)
7. [Color & Theme System](#7-color--theme-system)
8. [Scrollable Content](#8-scrollable-content)
9. [FlatList Usage](#9-flatlist-usage)
10. [State Management](#10-state-management)
11. [Handler Patterns](#11-handler-patterns)
12. [Haptic Feedback](#12-haptic-feedback)
13. [StyleSheet Organization](#13-stylesheet-organization)
14. [Common UI Components](#14-common-ui-components)
15. [Quick Reference](#15-quick-reference)

---

## 1. File Structure

```
/**
 * SheetName - Brief description
 * 
 * Features:
 * - Feature 1
 * - Feature 2
 */

// Imports

// ============================================================================
// TYPES
// ============================================================================

// ============================================================================
// CONSTANTS
// ============================================================================

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SheetName() {
  // ============================================================================
  // HOOKS & REFS
  // ============================================================================

  // ============================================================================
  // STATE
  // ============================================================================

  // ============================================================================
  // SHEET LIFECYCLE
  // ============================================================================

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // ============================================================================
  // HANDLERS
  // ============================================================================

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  // ============================================================================
  // RENDER
  // ============================================================================
}

// ============================================================================
// STYLES
// ============================================================================
```

---

## 2. Imports Pattern

### Standard Import Order

```tsx
// 1. React
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// 2. React Native core
import { 
  View, 
  StyleSheet, 
  Platform, 
  ActivityIndicator,
  Keyboard,
  TextInput,
} from 'react-native';

// 3. Custom UI components
import { HapticPressable } from '@/components/ui';

// 4. Bottom sheet
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetTextInput,      // For SearchSheet
  BottomSheetScrollView,     // For scrollable content
  BottomSheetFlatList,       // For list-based sheets
} from '@gorhom/bottom-sheet';

// 5. Safe area
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 6. Haptics
import * as Haptics from 'expo-haptics';

// 7. Icons
import { Search, X } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';

// 8. Theme & constants
import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

// 9. Typography components
import { Heading, Body, Label, ButtonText, Supporting } from '@/components/ui';

// 10. API/Data
import { searchApi, type FacetBucket } from '@/lib/search-api';
```

---

## 3. Component Architecture

### Props Interface Pattern

```tsx
interface SheetNameProps {
  visible: boolean;           // Controls sheet visibility
  onClose: () => void;        // Called when sheet dismisses
  onApply?: (data: T) => void; // Optional callback with result
  // Additional props...
}
```

### Standard Hook Setup

```tsx
export function SheetName({ visible, onClose, onApply }: SheetNameProps) {
  // Theme
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  
  // Safe area insets (for bottom padding)
  const insets = useSafeAreaInsets();
  
  // Sheet ref
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  
  // Other refs
  const inputRef = useRef<TextInput>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // ...
}
```

---

## 4. Sheet Configuration

### Snap Points

```tsx
// Common patterns:
const SNAP_POINTS = ['60%', '94%'];  // Filter sheets
const SNAP_POINTS = ['70%', '93%'];  // AI/Chat sheets

// Outside component (memoization)
const snapPoints = useMemo(() => SNAP_POINTS, []);
```

### Backdrop Component

```tsx
const renderBackdrop = useCallback(
  (props: any) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}   // Disappear when closed
      appearsOnIndex={0}       // Appear on first snap point
      opacity={0.5}            // 50% dark overlay
      pressBehavior="close"    // Close on backdrop press
    />
  ),
  []  // No dependencies - stable reference
);
```

### BottomSheetModal Props

```tsx
<BottomSheetModal
  ref={bottomSheetRef}
  snapPoints={snapPoints}
  enableDynamicSizing={false}
  enablePanDownToClose
  onChange={handleSheetChanges}
  backdropComponent={renderBackdrop}
  
  // Styling
  backgroundStyle={{ 
    backgroundColor: colors.surface, 
    borderRadius: Radius['3xl']  // 24px rounded corners
  }}
  handleIndicatorStyle={{ 
    backgroundColor: colors.textMuted, 
    width: Sizes.bubble  // 36px
  }}
  
  // Keyboard handling
  keyboardBehavior="extend"
  keyboardBlurBehavior="restore"
  android_keyboardInputMode="adjustResize"
  
  // Detached mode (floats above bottom)
  detached
  bottomInset={insets.bottom + Spacing.xl}  // 20px above safe area
  
  // Container margins
  style={styles.sheetContainer}
>
```

### Sheet Lifecycle

```tsx
// Present/dismiss based on visibility prop
useEffect(() => {
  if (visible) {
    bottomSheetRef.current?.present();
    // Optional: Focus input after animation
    setTimeout(() => inputRef.current?.focus(), 300);
  } else {
    bottomSheetRef.current?.dismiss();
  }
}, [visible]);

// Handle sheet changes (index === -1 means closed)
const handleSheetChanges = useCallback((index: number) => {
  if (index === -1) {
    // Reset state on close
    setQuery('');
    setLocalSelected([]);
    // etc.
    onClose();
  }
}, [onClose]);
```

---

## 5. Header Pattern

### Standard Three-Column Header

```tsx
{/* Header */}
<View style={[styles.header, { borderBottomColor: colors.border }]}>
  <View style={styles.headerTopRow}>
    {/* LEFT: Cancel button */}
    <HapticPressable
      onPress={onClose}          // Or: () => bottomSheetRef.current?.dismiss()
      hitSlop={Spacing.md}       // 12px touch expansion
      style={styles.cancelButton}
    >
      <Body size="medium" tone="secondary">Cancel</Body>
    </HapticPressable>
    
    {/* CENTER: Title (naturally centered via space-between) */}
    <Heading size="small">Sheet Title</Heading>
    
    {/* RIGHT: Apply/Action button */}
    <HapticPressable
      style={[
        styles.applyButton,
        { backgroundColor: canApply ? colors.primary : colors.fillSecondary },
      ]}
      onPress={handleApply}
      disabled={!canApply}
    >
      <ButtonText
        size="small"
        style={{ color: canApply ? colors.primaryForeground : colors.textMuted }}
      >
        Apply
      </ButtonText>
    </HapticPressable>
  </View>
</View>
```

### Header with Icon + Title

```tsx
<View style={styles.headerRow}>
  <HapticPressable onPress={() => bottomSheetRef.current?.dismiss()} hitSlop={Spacing.md}>
    <Body size="medium" tone="secondary">Cancel</Body>
  </HapticPressable>
  
  {/* Center with icon */}
  <View style={styles.headerTitle}>
    <Ionicons name="flash" size={Spacing.lg} color="#8B5CF6" />
    <Heading size="small">Ask Amna</Heading>
  </View>
  
  {/* Empty spacer for centering */}
  <View style={{ width: 50 }} />
</View>
```

### Header Styles

```tsx
header: {
  flexShrink: 0,                           // Don't shrink
  paddingHorizontal: Spacing.lg,           // 16px
  paddingTop: Spacing.xs,                  // 4px
  paddingBottom: Spacing.md,               // 12px
  borderBottomWidth: StyleSheet.hairlineWidth,
},
headerTopRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',         // KEY: Creates 3-column layout
  marginBottom: Spacing.md,                // 12px before content
},
cancelButton: {
  paddingVertical: Spacing.xs,             // 4px
  paddingHorizontal: Spacing.xs,           // 4px
},
applyButton: {
  paddingVertical: Spacing.sm,             // 8px
  paddingHorizontal: Spacing.lg,           // 16px
  borderRadius: Radius.full,               // Pill shape
},
```

---

## 6. Typography Usage

### Import

```tsx
import { Heading, Body, Label, ButtonText, Supporting } from '@/components/ui';
```

### Text Hierarchy

| Component | Use Case | Font |
|-----------|----------|------|
| `<Heading size="small">` | Sheet title, section titles | Inter_600SemiBold, 17px |
| `<Body size="medium">` | Standard text, Cancel button | Inter_500Medium, 15px |
| `<Body size="small">` | Secondary text, summaries | Inter_500Medium, 14px |
| `<Label size="small">` | Section headers (MAKE, MODEL) | Inter_700Bold, 11px, uppercase |
| `<ButtonText size="small">` | Apply button text | Inter_600SemiBold, 13px |
| `<Supporting size="small">` | Helper text, counts | Inter_500Medium (secondary tone), 13px |

### Tone Property

```tsx
<Body size="medium" tone="default">   {/* colors.text */}
<Body size="medium" tone="secondary"> {/* colors.textSecondary */}
<Body size="medium" tone="muted">     {/* colors.textMuted */}
<Body size="medium" tone="primary">   {/* colors.primary */}
<Body size="medium" tone="error">     {/* colors.error */}
<Body size="medium" tone="success">   {/* colors.success */}
```

### Common Patterns

```tsx
{/* Cancel button */}
<Body size="medium" tone="secondary">Cancel</Body>

{/* Section label */}
<Label size="small" tone="muted" style={styles.sectionLabel}>
  MAKE
</Label>

{/* Selection summary */}
<Body size="small" numberOfLines={1} style={{ flex: 1 }}>
  {selectionSummary}
</Body>

{/* Clear button */}
<Supporting size="small" style={{ color: colors.error }}>
  Clear
</Supporting>

{/* Empty state */}
<Body size="small" tone="muted" style={styles.emptyText}>
  No models found
</Body>
```

---

## 7. Color & Theme System

### Getting Theme Colors

```tsx
const { colorScheme } = useTheme();
const colors = Colors[colorScheme];
```

### Common Color Uses

```tsx
// Backgrounds
backgroundColor: colors.surface           // Sheet background (slightly elevated)
backgroundColor: colors.background        // Pure background
backgroundColor: colors.fillSecondary     // Disabled button, inputs
backgroundColor: colors.input             // Text input background

// Borders
borderColor: colors.border                // Standard borders
borderBottomColor: colors.border          // Header separator

// Text (via tone prop or direct)
color: colors.text                        // Primary text
color: colors.textSecondary               // Secondary text
color: colors.textMuted                   // Muted/placeholder text
color: colors.error                       // Clear/error actions
color: colors.primary                     // Brand/links

// Buttons
backgroundColor: colors.primary           // Primary action
color: colors.primaryForeground           // Primary button text
```

### Dynamic Color Application

```tsx
// Selected vs unselected state
<View style={[
  styles.chip,
  {
    backgroundColor: isSelected ? colors.text : colors.fillSecondary,
    borderColor: isSelected ? colors.text : colors.border,
  },
]}>
  <Supporting style={{ color: isSelected ? colors.background : colors.text }}>
    {label}
  </Supporting>
</View>

// Disabled state
<HapticPressable
  style={[
    styles.applyButton,
    { backgroundColor: hasValue ? colors.primary : colors.fillSecondary },
  ]}
  disabled={!hasValue}
>
  <ButtonText style={{ color: hasValue ? colors.primaryForeground : colors.textMuted }}>
    Apply
  </ButtonText>
</HapticPressable>
```

---

## 8. Scrollable Content

### Using BottomSheetScrollView

```tsx
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

<BottomSheetScrollView
  style={styles.scrollView}
  contentContainerStyle={styles.scrollContent}
  keyboardShouldPersistTaps="handled"     // KEY: Allow taps while keyboard is open
  showsVerticalScrollIndicator={false}
>
  {/* Sections */}
  <View style={styles.section}>
    <Label size="small" tone="muted" style={styles.sectionLabel}>
      SECTION TITLE
    </Label>
    {/* Content */}
  </View>
  
  {/* Bottom padding for safe area */}
  <View style={{ height: insets.bottom + Spacing['3xl'] }} />
</BottomSheetScrollView>
```

### Scroll Styles

```tsx
scrollView: {
  flex: 1,
},
scrollContent: {
  paddingHorizontal: Spacing.lg,  // 16px
  paddingTop: Spacing.lg,         // 16px
},
section: {
  marginBottom: Spacing.xl,       // 20px
},
sectionLabel: {
  marginBottom: Spacing.sm,       // 8px
  marginLeft: Spacing.xs,         // 4px
},
```

---

## 9. FlatList Usage

### Using BottomSheetFlatList

```tsx
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';

<BottomSheetFlatList
  data={filteredModels}
  keyExtractor={keyExtractor}
  renderItem={renderItem}
  style={styles.listContainer}
  keyboardShouldPersistTaps="handled"
  showsVerticalScrollIndicator={false}
  ListEmptyComponent={
    <View style={styles.emptyState}>
      <Body size="large" tone="secondary">No models found</Body>
    </View>
  }
/>
```

### keyExtractor Pattern

```tsx
// Simple string key
const keyExtractor = (item: string) => item;

// Compound key for objects
const keyExtractor = useCallback(
  (item: ModelOption) => `${item.make}-${item.model}`, 
  []
);
```

### renderItem Pattern

```tsx
const renderItem = useCallback(({ item }: { item: string }) => {
  const isSelected = localSelected.includes(item);
  const facet = facets.find(f => f.value === item);
  const count = facet?.count ?? 0;

  return (
    <HapticPressable
      onPress={() => handleToggle(item)}
      style={styles.listItem}
    >
      <View style={styles.labelRow}>
        <Body
          size="medium"
          style={{ 
            color: isSelected ? colors.text : colors.textSecondary,
            fontFamily: isSelected ? 'Inter_600SemiBold' : 'Inter_400Regular',
          }}
        >
          {item}
        </Body>
        {count > 0 && (
          <Supporting size="small" tone="muted">
            {count.toLocaleString()}
          </Supporting>
        )}
      </View>
      
      {/* Radio indicator */}
      <View style={[
        styles.radio,
        { borderColor: isSelected ? colors.textMuted : colors.border },
      ]}>
        {isSelected && (
          <View style={[styles.radioInner, { backgroundColor: colors.textMuted }]} />
        )}
      </View>
    </HapticPressable>
  );
}, [localSelected, colors, handleToggle, facets]);
```

### List Item Styles

```tsx
listContainer: {
  flex: 1,
},
listItem: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: Spacing.md,     // 12px
  paddingHorizontal: Spacing.sm,   // 8px
},
labelRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: Spacing.sm,                 // 8px
  flex: 1,
},
radio: {
  width: Sizes.iconMd,             // 22px
  height: Sizes.iconMd,
  borderRadius: Radius.full,
  borderWidth: 1.5,
  alignItems: 'center',
  justifyContent: 'center',
},
radioInner: {
  width: Spacing.sm + 2,           // 10px
  height: Spacing.sm + 2,
  borderRadius: Radius.full,
},
emptyState: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: Spacing['3xl'], // 32px
},
```

---

## 10. State Management

### Standard State Setup

```tsx
// Local selections (sync with props on open)
const [localSelected, setLocalSelected] = useState<string[]>(selected);
const [searchQuery, setSearchQuery] = useState('');

// Sync with props when sheet opens
useEffect(() => {
  if (visible) {
    setLocalSelected(selected);
    setSearchQuery('');
  }
}, [visible, selected]);
```

### Toggle Array Helper

```tsx
function toggleArrayValue<T>(arr: T[], value: T): T[] {
  if (arr.includes(value)) {
    return arr.filter((v) => v !== value);
  }
  return [...arr, value];
}

// Usage
const handleToggle = useCallback((make: string) => {
  triggerHaptic();
  setLocalSelected(prev => toggleArrayValue(prev, make));
}, []);
```

### Debounced Search

```tsx
const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

useEffect(() => {
  // Clear previous timeout
  if (searchTimeoutRef.current) {
    clearTimeout(searchTimeoutRef.current);
  }

  if (!query.trim()) {
    setSuggestions([]);
    return;
  }

  setIsLoading(true);
  searchTimeoutRef.current = setTimeout(async () => {
    try {
      const res = await searchApi.suggest(query.trim());
      setSuggestions(res.suggestions);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, 300); // 300ms debounce

  return () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
  };
}, [query]);
```

---

## 11. Handler Patterns

### Apply Handler

```tsx
const handleApply = useCallback(() => {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
  onApply(localSelected);
  bottomSheetRef.current?.dismiss();
}, [localSelected, onApply]);
```

### Clear Handler

```tsx
const handleClear = useCallback(() => {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
  setLocalSelected([]);
  onApply([]);
  bottomSheetRef.current?.dismiss();
}, [onApply]);
```

### Submit Handler (with async)

```tsx
const handleSubmit = useCallback(async () => {
  const text = query.trim();
  if (!text || isLoading) return;

  setIsLoading(true);
  Keyboard.dismiss();

  try {
    const res = await searchApi.search(text);
    // Process result...
    onSearch?.(params);
    bottomSheetRef.current?.dismiss();
  } catch (error) {
    setMessage("Something went wrong");
  } finally {
    setIsLoading(false);
  }
}, [query, isLoading, onSearch]);
```

---

## 12. Haptic Feedback

### Import & Helper

```tsx
import * as Haptics from 'expo-haptics';

function triggerHaptic() {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}
```

### Haptic Types

```tsx
// Light tap - selections, toggles
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Medium - apply, submit actions
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Heavy - destructive actions
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
```

### Using HapticPressable

```tsx
import { HapticPressable } from '@/components/ui';

// Default light haptic
<HapticPressable onPress={handleTap}>
  <Body>Tap me</Body>
</HapticPressable>

// Custom haptic level
<HapticPressable haptic="medium" onPress={handleApply}>
  <ButtonText>Apply</ButtonText>
</HapticPressable>

// No haptic
<HapticPressable haptic="none" onPress={handleScroll}>
  <Body>Silent action</Body>
</HapticPressable>
```

---

## 13. StyleSheet Organization

### Complete Style Template

```tsx
const styles = StyleSheet.create({
  // CONTAINER
  sheetContainer: {
    marginHorizontal: Spacing.lg,          // 16px (detached mode margins)
  },
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  
  // HEADER
  header: {
    flexShrink: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  cancelButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  applyButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
  },
  
  // SEARCH
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    height: Layout.hitTarget,              // 44px
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 0,
  },
  
  // CONTENT
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  
  // SECTIONS
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  
  // LIST
  listContainer: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  
  // SELECTION CONTROLS
  radio: {
    width: Sizes.iconMd,
    height: Sizes.iconMd,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: Spacing.sm + 2,
    height: Spacing.sm + 2,
    borderRadius: Radius.full,
  },
  
  // CHIPS
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  
  // STATES
  loadingRow: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
  },
  
  // SELECTION SUMMARY
  selectionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
});
```

---

## 14. Common UI Components

### Search Input Box

```tsx
<View style={[
  styles.searchContainer, 
  { backgroundColor: colors.fillSecondary, borderColor: colors.border }
]}>
  <Search size={Sizes.iconSm} color={colors.textMuted} strokeWidth={2} />
  <TextInput
    style={[styles.searchInput, { color: colors.text }]}
    placeholder="Search..."
    placeholderTextColor={colors.textMuted}
    value={searchQuery}
    onChangeText={setSearchQuery}
    autoCorrect={false}
    autoCapitalize="none"
  />
  {searchQuery.length > 0 && (
    <HapticPressable onPress={() => setSearchQuery('')} hitSlop={Layout.hitSlopSmall}>
      <X size={Spacing.lg} color={colors.textMuted} strokeWidth={2} />
    </HapticPressable>
  )}
</View>
```

### Selection Summary Strip

```tsx
{hasValue && (
  <View style={styles.selectionSummary}>
    <Body size="small" numberOfLines={1} style={{ flex: 1 }}>
      {localSelected.join(', ')}
    </Body>
    <HapticPressable onPress={handleClear} hitSlop={Layout.hitSlopSmall}>
      <Supporting size="small" style={{ color: colors.error }}>
        Clear
      </Supporting>
    </HapticPressable>
  </View>
)}
```

### Loading State

```tsx
{isLoading ? (
  <View style={styles.loadingRow}>
    <ActivityIndicator size="small" color={colors.textMuted} />
  </View>
) : (
  // Content
)}
```

### Chip Component

```tsx
const renderChip = (
  label: string,
  count: number | undefined,
  isSelected: boolean,
  onPress: () => void,
  key: string,
) => (
  <HapticPressable
    key={key}
    style={[
      styles.chip,
      {
        backgroundColor: isSelected ? colors.text : colors.fillSecondary,
        borderColor: isSelected ? colors.text : colors.border,
      },
    ]}
    onPress={onPress}
  >
    <Supporting
      size="small"
      style={{ color: isSelected ? colors.background : colors.text }}
    >
      {label}
    </Supporting>
    {!isSelected && count !== undefined && (
      <Supporting size="mini" tone="muted">
        {count}
      </Supporting>
    )}
    {isSelected && (
      <Ionicons name="close" size={Spacing.md} color={colors.background} />
    )}
  </HapticPressable>
);
```

---

## 15. Quick Reference

### Design Tokens

| Token | Value | Use |
|-------|-------|-----|
| `Spacing.xs` | 4px | Tiny gaps |
| `Spacing.sm` | 8px | Chip padding, small gaps |
| `Spacing.md` | 12px | Item padding |
| `Spacing.lg` | 16px | Container padding |
| `Spacing.xl` | 20px | Section margins |
| `Spacing['2xl']` | 24px | Large spacing |
| `Spacing['3xl']` | 32px | Bottom safe area |
| `Radius.full` | 9999 | Pill shape |
| `Radius['3xl']` | 24px | Sheet corners |
| `Radius.lg` | 12px | Input containers |
| `Layout.hitTarget` | 44px | Touch target size |
| `Sizes.iconSm` | 18px | Small icons |
| `Sizes.iconMd` | 22px | Radio buttons |
| `Sizes.bubble` | 36px | Handle width |

### Key Patterns Summary

1. **Three-column header**: `justifyContent: 'space-between'` with Cancel | Title | Apply
2. **Bottom padding**: Always `insets.bottom + Spacing.xl` or `['3xl']`
3. **Detached mode**: `detached` + `bottomInset` for floating sheet
4. **Keyboard handling**: `keyboardShouldPersistTaps="handled"` on all scrollables
5. **State sync**: Reset local state when `visible` changes to `true`
6. **Haptics**: Light for selections, Medium for actions
7. **Typography**: Use semantic components (`Body`, `Heading`) not raw `Text`
8. **Colors**: Always access via `colors[colorScheme]`, never hardcode

---

## File Template

Copy this as a starting point for new sheets:

```tsx
/**
 * NewSheet - Description
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, Sizes, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';
import { Heading, Body, Label, ButtonText, Supporting } from '@/components/ui';

interface NewSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply?: (data: any) => void;
}

const SNAP_POINTS = ['60%', '94%'];

export function NewSheet({ visible, onClose, onApply }: NewSheetProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => SNAP_POINTS, []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  const handleApply = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onApply?.({});
    bottomSheetRef.current?.dismiss();
  }, [onApply]);

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
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: Radius['3xl'] }}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted, width: Sizes.bubble }}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      detached
      bottomInset={insets.bottom + Spacing.xl}
      style={styles.sheetContainer}
    >
      <View style={styles.container}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerTopRow}>
            <HapticPressable onPress={onClose} hitSlop={Spacing.md} style={styles.cancelButton}>
              <Body size="medium" tone="secondary">Cancel</Body>
            </HapticPressable>
            <Heading size="small">Title</Heading>
            <HapticPressable
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={handleApply}
            >
              <ButtonText size="small" style={{ color: colors.primaryForeground }}>
                Apply
              </ButtonText>
            </HapticPressable>
          </View>
        </View>

        <BottomSheetScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Content */}
          <View style={{ height: insets.bottom + Spacing['3xl'] }} />
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: { marginHorizontal: Spacing.lg },
  container: { flex: 1, overflow: 'hidden' },
  header: {
    flexShrink: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  cancelButton: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.xs },
  applyButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
});
```
