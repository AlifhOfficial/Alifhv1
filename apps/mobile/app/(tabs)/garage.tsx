/**
 * Garage Screen
 */

import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { ScreenContainer } from '@/components/layout/screen-container';

export default function GarageScreen() {
  return (
    <ScreenContainer title="Garage">
      <View style={styles.display}>
        <Text variant="caption" muted>Your garage is empty</Text>
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
