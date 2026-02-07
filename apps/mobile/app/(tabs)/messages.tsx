/**
 * Messages Tab Screen
 */

import { StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Layout } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export default function MessagesScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom + Layout.tabBarHeight }]}>
      <Text style={[styles.title, { color: colors.text }]}>Messages</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Your conversations
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
});
