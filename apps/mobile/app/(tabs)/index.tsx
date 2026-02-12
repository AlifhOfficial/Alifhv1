/**
 * Home Tab Screen
 */

import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TopSafeAreaGradient } from '@/components/layout';
import { Calendar, ChevronRight } from 'lucide-react-native';

import { HomeHeader } from '@/components/home';
import { Colors, Layout, Spacing, Radius } from '@/constants/theme';
import { Body, Supporting, HapticPressable } from '@/components/ui';
import { useTheme } from '@/context/theme-context';

export default function HomeScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TopSafeAreaGradient />
      <HomeHeader />
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={{ paddingTop: insets.top + Layout.headerPadding + Layout.hitTarget + Spacing.md + Spacing.md, paddingBottom: insets.bottom + Layout.tabBarHeight }}
        showsVerticalScrollIndicator={false}
      >
        {/* My Bookings card */}
        <View style={{ paddingHorizontal: Layout.screenPadding }}>
          <HapticPressable
            onPress={() => router.push('/bookings')}
            style={[styles.bookingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[styles.bookingsIcon, { backgroundColor: colors.primaryMuted }]}>  
              <Calendar size={22} color={colors.primary} />
            </View>
            <View style={styles.bookingsInfo}>
              <Body size="medium" style={{ fontWeight: '600' }}>My Bookings</Body>
              <Supporting size="small" tone="secondary">View and manage your test drives</Supporting>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </HapticPressable>
        </View>

        {/* Placeholder for more content */}
        <View style={styles.placeholder}>
          <Body size="large" tone="secondary" style={styles.text}>
            Browse the latest listings
          </Body>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 40,
  },
  text: {
  },
  bookingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingsIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingsInfo: {
    flex: 1,
    gap: 2,
  },
});
