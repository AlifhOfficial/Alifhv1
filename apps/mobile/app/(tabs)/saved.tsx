/**
 * Saved Screen
 */

import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { ScreenContainer } from '@/components/layout/screen-container';

export default function SavedScreen() {
  return (
    <ScreenContainer title="Saved">
      <View style={styles.display}>
        <Text variant="caption" muted>No saved listings</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  display: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
