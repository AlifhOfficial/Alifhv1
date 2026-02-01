/**
 * Search Tab Screen
 */

import { StyleSheet, View, Text } from 'react-native';

import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/theme-context';

export default function SearchScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Search</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Find your perfect car
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
