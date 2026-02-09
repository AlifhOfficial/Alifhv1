/**
 * FilterPills - Horizontal row of floating filter pills
 * Matches GlobalTabBar UI with individual floating bubbles
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Settings2 } from 'lucide-react-native';

import { Colors, Typography } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export type FilterPillType = 'price' | 'yearMileage' | 'location';

interface FilterPillConfig {
  type: FilterPillType;
  label: string;
  activeCount: number;
}

interface FilterPillsProps {
  pills: FilterPillConfig[];
  onPillPress: (type: FilterPillType) => void;
  onSettingsPress?: () => void;
}

export function FilterPills({ pills, onPillPress, onSettingsPress }: FilterPillsProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const handlePress = (type: FilterPillType) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPillPress(type);
  };

  const handleSettingsPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSettingsPress?.();
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* Individual floating pills */}
      {pills.map((pill) => {
        const isActive = pill.activeCount > 0;
        
        return (
          <Pressable
            key={pill.type}
            onPress={() => handlePress(pill.type)}
            style={[
              styles.pill,
              { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {({ pressed }) => (
              <View style={[styles.pillContent, { opacity: pressed ? 0.7 : 1 }]}>
                <Text
                  style={[
                    styles.pillLabel,
                    { color: colors.text },
                  ]}
                  numberOfLines={1}
                >
                  {pill.label}
                </Text>
                {pill.activeCount > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.text }]}>
                    <Text style={[styles.badgeText, { color: colors.background }]}>
                      {pill.activeCount}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Pressable>
        );
      })}

      {/* Settings bubble at the end */}
      <Pressable
        onPress={handleSettingsPress}
        style={[
          styles.settingsBubble,
          { 
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        {({ pressed }) => (
          <Settings2 
            size={20} 
            color={colors.text} 
            strokeWidth={2}
            style={{ opacity: pressed ? 0.7 : 1 }}
          />
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    gap: 8,
  },
  settingsBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  pill: {
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillLabel: {
    ...Typography.chip,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
  },
  badgeText: {
    ...Typography.labelBadge,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
});
