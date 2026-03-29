/**
 * GreetingNote Component
 * 
 * A warm, personalized greeting for UAE market.
 * Adapts based on time of day and authentication state.
 * Uses theme tokens for all styling.
 */

import { Text } from '@/components/ui';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { Spacing, Layout } from '@/constants/theme';

/**
 * Time periods for contextual greetings
 */
type TimePeriod = 'earlyMorning' | 'morning' | 'afternoon' | 'evening' | 'night';

function getTimePeriod(): TimePeriod {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 9) return 'earlyMorning';
  if (hour >= 9 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night'; // 9pm - 5am
}

/**
 * Authenticated user greetings - warm and personal with UAE flavor
 * Mix of Arabic greetings that everyone in UAE recognizes
 */
const AUTH_GREETINGS: Record<TimePeriod, { greeting: string; subtitle: string }[]> = {
  earlyMorning: [
    { greeting: 'Sabah al-khair', subtitle: 'Early riser! Fresh listings await' },
    { greeting: 'Good morning', subtitle: 'Starting the day right' },
    { greeting: 'Morning', subtitle: 'The best cars go early' },
  ],
  morning: [
    { greeting: 'Marhaba', subtitle: 'Good to see you back' },
    { greeting: 'Sabah al-noor', subtitle: 'What are we finding today?' },
    { greeting: 'Good morning', subtitle: 'New arrivals just dropped' },
    { greeting: 'Ahlan', subtitle: 'Ready to explore?' },
  ],
  afternoon: [
    { greeting: 'Marhaba', subtitle: 'Taking a break? Good timing' },
    { greeting: 'Ahlan wa sahlan', subtitle: 'Welcome back' },
    { greeting: 'Good afternoon', subtitle: 'Perfect browsing weather' },
    { greeting: 'Hey', subtitle: 'Something caught your eye?' },
  ],
  evening: [
    { greeting: 'Masa al-khair', subtitle: 'Unwinding? Let\'s browse' },
    { greeting: 'Good evening', subtitle: 'Golden hour for car shopping' },
    { greeting: 'Ahlan', subtitle: 'The evening rush is real' },
    { greeting: 'Marhaba', subtitle: 'End the day on a good note' },
  ],
  night: [
    { greeting: 'Masa al-noor', subtitle: 'Night owl mode activated' },
    { greeting: 'Hey', subtitle: 'Best deals come to those who wait' },
    { greeting: 'Marhaba', subtitle: 'Late night browsing hits different' },
  ],
};

/**
 * Unauthenticated greetings - welcoming with local touch
 */
const UNAUTH_GREETINGS: Record<TimePeriod, { greeting: string; subtitle: string }[]> = {
  earlyMorning: [
    { greeting: 'Sabah al-khair', subtitle: 'Welcome to Revvup' },
    { greeting: 'Good morning', subtitle: 'Find your perfect ride' },
  ],
  morning: [
    { greeting: 'Marhaba', subtitle: 'Welcome to Revvup' },
    { greeting: 'Good morning', subtitle: 'Your car search starts here' },
    { greeting: 'Ahlan', subtitle: 'Thousands of cars await' },
  ],
  afternoon: [
    { greeting: 'Ahlan wa sahlan', subtitle: 'Welcome' },
    { greeting: 'Marhaba', subtitle: 'Browse our collection' },
    { greeting: 'Good afternoon', subtitle: 'Find something great' },
  ],
  evening: [
    { greeting: 'Masa al-khair', subtitle: 'Welcome' },
    { greeting: 'Good evening', subtitle: 'Your next car is here' },
    { greeting: 'Ahlan', subtitle: 'Let\'s find your ride' },
  ],
  night: [
    { greeting: 'Marhaba', subtitle: 'Welcome to Revvup' },
    { greeting: 'Hey', subtitle: 'Late night browsing? We got you' },
  ],
};

/**
 * Gets the user's first name for personalized greeting
 */
function getFirstName(user: { firstName?: string | null; name?: string } | null): string | null {
  if (!user) return null;
  
  if (user.firstName) return user.firstName;
  
  if (user.name) {
    const firstName = user.name.split(' ')[0];
    return firstName || null;
  }
  
  return null;
}

/**
 * Stable random selection based on day
 */
function getDailyIndex(options: unknown[]): number {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return seed % options.length;
}

export function GreetingNote() {
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuth();
  
  const timePeriod = getTimePeriod();
  const firstName = getFirstName(user);

  const content = useMemo(() => {
    if (isAuthenticated && firstName) {
      const greetings = AUTH_GREETINGS[timePeriod];
      const selected = greetings[getDailyIndex(greetings)];
      return { 
        greeting: selected.greeting,
        name: firstName, 
        subtitle: selected.subtitle,
      };
    }
    
    const greetings = UNAUTH_GREETINGS[timePeriod];
    const selected = greetings[getDailyIndex(greetings)];
    return { 
      greeting: selected.greeting,
      name: null, 
      subtitle: selected.subtitle,
    };
  }, [isAuthenticated, firstName, timePeriod]);

  const tone = useMemo(() => {
    if (timePeriod === 'earlyMorning' || timePeriod === 'morning') {
      return { label: 'Morning', color: colors.info, bg: colors.infoMuted };
    }
    if (timePeriod === 'afternoon') {
      return { label: 'Afternoon', color: colors.primary, bg: colors.primaryMuted };
    }
    if (timePeriod === 'evening') {
      return { label: 'Evening', color: colors.warning, bg: colors.warningMuted };
    }
    return { label: 'Night', color: colors.amna, bg: colors.amnaMuted };
  }, [timePeriod, colors]);

  return (
    <View style={styles.container}>
      <View style={styles.greetingRow}>
        <Text variant="largeTitleEmphasized" style={{ color: colors.label }}>
          {content.greeting}
          {content.name ? ', ' : ''}
        </Text>
        {content.name && (
          <Text variant="largeTitleEmphasized" style={{ color: tone.color }}>
            {content.name}
          </Text>
        )}
      </View>

      <Text variant="body" style={{ color: colors.labelSecondary }} tone="secondary">
        {content.subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing['3xl'],
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.xs,
  },
  greetingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
});
