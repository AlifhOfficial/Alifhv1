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
 * Authenticated user greetings - playful and personal
 */
const AUTH_GREETINGS: Record<TimePeriod, { top: string; bottom: string }[]> = {
  earlyMorning: [
    { top: 'Up before the sun? 🌅', bottom: 'you legend' },
    { top: 'Early bird mode 🐦', bottom: 'let\'s find gold' },
    { top: 'Coffee ready? ☕', bottom: 'let\'s roll' },
  ],
  morning: [
    { top: 'Good morning', bottom: 'sunshine ☀️' },
    { top: 'Hey hey', bottom: 'let\'s gooo 🚗' },
    { top: 'Morning vibes ✨', bottom: 'ready to browse?' },
    { top: 'Rise & grind', bottom: 'car hunting time 🔥' },
  ],
  afternoon: [
    { top: 'Yo', bottom: 'what\'s good? 👋' },
    { top: 'Afternoon hustle', bottom: 'let\'s find your ride 🚙' },
    { top: 'Hey', bottom: 'taking a break? 😎' },
    { top: 'Back at it', bottom: 'nice to see you ❤️' },
  ],
  evening: [
    { top: 'Evening', bottom: 'how was your day? 🌅' },
    { top: 'Winding down?', bottom: 'perfect browse time ✨' },
    { top: 'Hey', bottom: 'let\'s see what\'s new 🚗' },
    { top: 'After hours', bottom: 'chill browsing? 😌' },
  ],
  lateEvening: [
    { top: 'Still going? 🌙', bottom: 'respect the hustle' },
    { top: 'Late session', bottom: 'best deals drop now 👀' },
    { top: 'Getting late', bottom: 'one more scroll? 😏' },
  ],
  night: [
    { top: 'Night owl 🦉', bottom: 'let\'s hunt' },
    { top: 'Can\'t sleep?', bottom: 'same, let\'s browse 🌙' },
    { top: 'Midnight mode 🦇', bottom: 'the quiet hours hit different' },
    { top: 'Up late?', bottom: 'best time for steals 💎' },
  ],
};

/**
 * Unauthenticated greetings - inviting and exciting
 */
const UNAUTH_GREETINGS: Record<TimePeriod, { greeting: string; tagline: string }[]> = {
  earlyMorning: [
    { greeting: 'Early start? 🌅', tagline: 'The best deals drop at dawn' },
    { greeting: 'You\'re up early ☕', tagline: 'Fresh listings just landed' },
  ],
  morning: [
    { greeting: 'Hey there 👋', tagline: 'Your dream car is one scroll away' },
    { greeting: 'Good morning ☀️', tagline: 'Thousands of cars, zero pressure' },
    { greeting: 'Morning! ✨', tagline: 'Let\'s find you something special' },
  ],
  afternoon: [
    { greeting: 'Hey 👋', tagline: 'Quick browse? We got you' },
    { greeting: 'Afternoon! 🚗', tagline: 'Your next ride awaits' },
    { greeting: 'What\'s up 😎', tagline: 'Deals are looking good today' },
  ],
  evening: [
    { greeting: 'Evening �', tagline: 'Perfect time to explore' },
    { greeting: 'Hey there ✨', tagline: 'New listings just dropped' },
    { greeting: 'Winding down?', tagline: 'Browse while you chill 😌' },
  ],
  lateEvening: [
    { greeting: 'Still up? 🌙', tagline: 'The good stuff surfaces late' },
    { greeting: 'Late browse?', tagline: 'We saved the best for now 👀' },
  ],
  night: [
    { greeting: 'Night owl? 🦉', tagline: 'The quiet hours = best finds' },
    { greeting: 'Can\'t sleep? 🌙', tagline: 'Neither can these deals' },
    { greeting: 'Midnight vibes 💫', tagline: 'Explore at your own pace' },
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
        tagline: null,
      };
    }
    
    const options = UNAUTH_GREETINGS[timePeriod];
    const selected = options[getDailyIndex(options)];
    return { 
      top: selected.greeting, 
      name: null, 
      bottom: null,
      tagline: selected.tagline,
    };
  }, [isAuthenticated, firstName, timePeriod]);

  return (
    <View style={styles.container}>
      <Supporting size="medium" style={{ color: colors.textTertiary }}>
        {content.top}
      </Supporting>
      
      {content.name ? (
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
      ) : (
        <View style={styles.unauthContent}>
          <Display size="medium" style={{ color: colors.text }}>
            Revvup
          </Display>
          {content.tagline && (
            <Body size="small" style={{ color: colors.textSecondary }}>
              {content.tagline}
            </Body>
          )}
        </View>
      )}
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
  unauthContent: {
    gap: Spacing.xs,
  },
});
