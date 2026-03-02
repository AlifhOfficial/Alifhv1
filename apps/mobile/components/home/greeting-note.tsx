/**
 * GreetingNote Component
 * 
 * A playful, personalized greeting with warmth and character.
 * Adapts based on time of day and authentication state.
 * Uses theme tokens for all styling.
 */

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { Spacing, Layout } from '@/constants/theme';
import { Display, Body, Supporting } from '@/components/ui';

/**
 * Time periods for contextual greetings
 */
type TimePeriod = 'earlyMorning' | 'morning' | 'afternoon' | 'evening' | 'lateEvening' | 'night';

function getTimePeriod(): TimePeriod {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 9) return 'earlyMorning';
  if (hour >= 9 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  if (hour >= 21 && hour < 23) return 'lateEvening';
  return 'night'; // 11pm - 5am
}

/**
 * Authenticated user greetings - personal
 */
const AUTH_GREETINGS: Record<TimePeriod, { top: string; bottom: string }[]> = {
  earlyMorning: [
    { top: 'Up before the sun?', bottom: 'you legend' },
    { top: 'Early bird mode', bottom: 'let\'s find gold' },
    { top: 'Coffee ready?', bottom: 'let\'s roll' },
  ],
  morning: [
    { top: 'Good morning', bottom: 'sunshine' },
    { top: 'Hey hey', bottom: 'let\'s go' },
    { top: 'Morning vibes', bottom: 'ready to browse?' },
    { top: 'Rise & grind', bottom: 'car hunting time' },
  ],
  afternoon: [
    { top: 'Yo', bottom: 'what\'s good?' },
    { top: 'Afternoon hustle', bottom: 'let\'s find your ride' },
    { top: 'Hey', bottom: 'taking a break?' },
    { top: 'Back at it', bottom: 'nice to see you' },
  ],
  evening: [
    { top: 'Evening', bottom: 'how was your day?' },
    { top: 'Winding down?', bottom: 'perfect browse time' },
    { top: 'Hey', bottom: 'let\'s see what\'s new' },
    { top: 'After hours', bottom: 'chill browsing?' },
  ],
  lateEvening: [
    { top: 'Still going?', bottom: 'respect the hustle' },
    { top: 'Late session', bottom: 'best deals drop now' },
    { top: 'Getting late', bottom: 'one more scroll?' },
  ],
  night: [
    { top: 'Night owl', bottom: 'let\'s hunt' },
    { top: 'Can\'t sleep?', bottom: 'same, let\'s browse' },
    { top: 'Midnight mode', bottom: 'the quiet hours hit different' },
    { top: 'Up late?', bottom: 'best time for steals' },
  ],
};

/**
 * Unauthenticated greetings - simple and welcoming
 */
const UNAUTH_GREETINGS: Record<TimePeriod, { top: string; bottom: string }[]> = {
  earlyMorning: [
    { top: 'Up early?', bottom: 'let\'s browse' },
    { top: 'Early start', bottom: 'good timing' },
  ],
  morning: [
    { top: 'Good morning', bottom: 'welcome' },
    { top: 'Hey there', bottom: 'take a look around' },
  ],
  afternoon: [
    { top: 'Hey', bottom: 'welcome' },
    { top: 'Afternoon', bottom: 'browse away' },
  ],
  evening: [
    { top: 'Evening', bottom: 'welcome' },
    { top: 'Hey there', bottom: 'take your time' },
  ],
  lateEvening: [
    { top: 'Still up?', bottom: 'us too' },
    { top: 'Late browse', bottom: 'welcome' },
  ],
  night: [
    { top: 'Night owl?', bottom: 'welcome' },
    { top: 'Can\'t sleep?', bottom: 'browse away' },
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
        top: selected.top, 
        name: firstName, 
        bottom: selected.bottom,
      };
    }
    
    const greetings = UNAUTH_GREETINGS[timePeriod];
    const selected = greetings[getDailyIndex(greetings)];
    return { 
      top: selected.top, 
      name: 'Guest', 
      bottom: selected.bottom,
    };
  }, [isAuthenticated, firstName, timePeriod]);

  return (
    <View style={styles.container}>
      <Supporting size="medium" style={{ color: colors.textTertiary }}>
        {content.top}
      </Supporting>
      <View style={styles.nameRow}>
        <Display size="medium" style={{ color: colors.text }}>
          {content.name}
        </Display>
        {content.bottom && (
          <Body size="medium" style={{ color: colors.textSecondary }}>
            {content.bottom}
          </Body>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.xs,
  },
  nameRow: {
    gap: Spacing.xs,
  },
});
