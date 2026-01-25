/**
 * QuickFilters Component - Mobile
 * 
 * Horizontal scrollable quick-select chips
 * Revolut-inspired premium design with smooth animations
 */

import { useColor } from '@/hooks/useColor';
import { FONT_FAMILY_MEDIUM, FONT_FAMILY_SEMIBOLD } from '@/theme/globals';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft, Layout } from 'react-native-reanimated';
import { SearchParams, SearchFacets, FacetBucket } from '@/lib/search-utils';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface QuickFiltersProps {
  params: SearchParams;
  facets: SearchFacets | null;
  isLoading: boolean;
  onSelectMake: (make: string) => void;
  onSelectModel: (model: string) => void;
  onSelectTrim: (trim: string) => void;
}

export function QuickFilters({
  params,
  facets,
  isLoading,
  onSelectMake,
  onSelectModel,
  onSelectTrim,
}: QuickFiltersProps) {
  // Theme colors
  const accent = useColor('accent');
  const border = useColor('border');
  const fg = useColor('foreground');
  const mutedFg = useColor('mutedForeground');

  // Determine what to show based on current selections
  const hasMake = (params.make?.length || 0) > 0;
  const hasModel = (params.model?.length || 0) > 0;

  // Render loading skeletons
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={[styles.skeleton, { backgroundColor: border }]} />
      ))}
    </View>
  );

  // Render chip list with animations
  const renderChips = (
    items: FacetBucket[],
    onSelect: (value: string) => void,
    label: string
  ) => {
    if (items.length === 0) return null;
    
    return (
      <Animated.View 
        entering={FadeInRight.springify()}
        exiting={FadeOutLeft.springify()}
        layout={Layout.springify()}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.labelPill, { backgroundColor: accent }]}>
            <Text style={[styles.label, { color: mutedFg }]}>
              {label}
            </Text>
          </View>
          {items.slice(0, 10).map((item, index) => (
            <AnimatedPressable
              key={item.value}
              onPress={() => onSelect(item.value)}
              style={[styles.chip, { backgroundColor: accent }]}
              entering={FadeInRight.delay(index * 30).springify()}
            >
              <Text 
                style={[styles.chipText, { color: fg }]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
              <View style={[styles.countBadge, { backgroundColor: border }]}>
                <Text style={[styles.chipCount, { color: mutedFg }]}>
                  {item.count}
                </Text>
              </View>
            </AnimatedPressable>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };

  // Don't show if we have make+model+trim selected already
  if (hasMake && hasModel && (params.trim?.length || 0) > 0) {
    return null;
  }

  // Show loading state
  if (isLoading && !facets) {
    return (
      <View style={styles.container}>
        {renderLoading()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* No make selected - show makes */}
      {!hasMake && facets?.make && facets.make.length > 0 && 
        renderChips(facets.make, onSelectMake, 'Makes')
      }

      {/* Make selected but no model - show models */}
      {hasMake && !hasModel && facets?.model && facets.model.length > 0 && 
        renderChips(facets.model, onSelectModel, 'Models')
      }

      {/* Make and model selected but no trim - show trims */}
      {hasMake && hasModel && !(params.trim?.length) && facets?.trim && facets.trim.length > 0 && 
        renderChips(facets.trim, onSelectTrim, 'Trims')
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  labelPill: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 12,
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontFamily: FONT_FAMILY_SEMIBOLD,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 34,
    paddingLeft: 14,
    paddingRight: 10,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY_MEDIUM,
    letterSpacing: -0.3,
    maxWidth: 100,
  },
  countBadge: {
    height: 20,
    minWidth: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipCount: {
    fontSize: 11,
    fontFamily: FONT_FAMILY_SEMIBOLD,
  },
  loadingContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  skeleton: {
    width: 80,
    height: 34,
    borderRadius: 12,
  },
});
