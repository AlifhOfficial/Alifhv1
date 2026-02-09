/**
 * Saved Tube - Home screen quick access to saved listings
 * 
 * A compact tube/pill component that navigates to the Saved screen.
 * Matches notifications icon button styling.
 */

import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export function SavedTube() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/saved');
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
        onPress={handlePress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {({ pressed }) => (
          <Text style={[styles.text, { color: colors.textSecondary, opacity: pressed ? 0.7 : 1 }]}>
            Saved
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  container: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    // Color applied inline
  },
});
