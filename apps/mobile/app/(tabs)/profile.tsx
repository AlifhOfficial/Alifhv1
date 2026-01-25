import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColor } from '@/hooks/useColor';
import { FONT_FAMILY_BOLD, FONT_FAMILY } from '@/theme/globals';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const bg = useColor('background');
  const fg = useColor('foreground');
  const mutedFg = useColor('mutedForeground');

  return (
    <View style={[styles.container, { backgroundColor: bg, paddingTop: insets.top }]}>
      <Text style={[styles.title, { color: fg, fontFamily: FONT_FAMILY_BOLD }]}>
        Profile
      </Text>
      <Text style={[styles.subtitle, { color: mutedFg, fontFamily: FONT_FAMILY }]}>
        Sign in to manage your account
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
