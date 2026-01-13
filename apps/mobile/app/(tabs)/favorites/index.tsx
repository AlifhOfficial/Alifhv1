import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { Heart, Star } from 'lucide-react-native';
import { ScrollView } from 'react-native';

export default function FavoritesScreen() {
  const muted = useColor('muted');
  const primary = useColor('primary');

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        padding: 24,
        gap: 20,
      }}
    >
      {/* Header */}
      <View style={{ gap: 8, marginTop: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name={Heart} size={28} color={primary} />
          <Text variant='heading'>Favorites</Text>
        </View>
        <Text variant='captionMuted' style={{ textAlign: 'center' }}>
          Your saved items appear here
        </Text>
      </View>

      {/* Empty State */}
      <Card>
        <View style={{ alignItems: 'center', padding: 40, gap: 16 }}>
          <Icon name={Heart} size={64} color={muted} />
          <Text variant='section' style={{ textAlign: 'center' }}>
            No Favorites Yet
          </Text>
          <Text variant='caption' style={{ textAlign: 'center', opacity: 0.7 }}>
            Tap the heart icon on items you love to save them here
          </Text>
        </View>
      </Card>

      {/* Sample Card */}
      <Card>
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name={Star} size={20} color={primary} />
            <Text variant='section'>How Favorites Work</Text>
          </View>
          <Text variant='body'>
            When you favorite items, they'll appear here for easy access. 
            Perfect for keeping track of listings, profiles, or content you want to revisit.
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}
