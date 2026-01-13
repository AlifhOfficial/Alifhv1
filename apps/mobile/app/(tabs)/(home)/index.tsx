import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import {
  Home,
  TrendingUp,
  Car,
  Star,
  MapPin,
} from 'lucide-react-native';
import { ScrollView } from 'react-native';

export default function HomeScreen() {
  const muted = useColor('muted');
  const primary = useColor('primary');

  const stats = [
    { label: 'Active Listings', value: '1,234', icon: Car },
    { label: 'Sold This Week', value: '87', icon: TrendingUp },
    { label: 'Top Rated', value: '4.8', icon: Star },
  ];

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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name={Home} size={28} color={primary} />
          <Text variant='heading'>Alifh</Text>
        </View>
        <Text variant='captionMuted'>
          UAE's trusted automotive marketplace
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {stats.map((stat, index) => {
          const StatIcon = stat.icon;
          return (
            <Card key={index} style={{ flex: 1 }}>
              <View style={{ alignItems: 'center', gap: 8 }}>
                <Icon name={StatIcon} size={24} color={primary} />
                <Text variant='stat'>{stat.value}</Text>
                <Text variant='captionMuted' style={{ textAlign: 'center' }}>
                  {stat.label}
                </Text>
              </View>
            </Card>
          );
        })}
      </View>

      {/* Featured Card */}
      <Card>
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name={Star} size={20} color={primary} />
            <Text variant='section'>Featured Listing</Text>
          </View>
          
          {/* Listing Preview */}
          <View
            style={{
              height: 160,
              borderRadius: 12,
              backgroundColor: muted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={Car} size={48} color={primary} />
          </View>

          <View style={{ gap: 8 }}>
            <Text variant='bodySemibold'>2024 Toyota Land Cruiser</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name={MapPin} size={14} color={primary} />
              <Text variant='caption'>Dubai, UAE</Text>
            </View>
            <Text variant='heading' style={{ color: primary }}>
              AED 285,000
            </Text>
          </View>

          <Button variant='default'>View Details</Button>
        </View>
      </Card>

      {/* Quick Actions */}
      <Card>
        <View style={{ gap: 12 }}>
          <Text variant='section'>Quick Actions</Text>
          <View style={{ gap: 8 }}>
            <Button variant='outline'>Browse Listings</Button>
            <Button variant='outline'>Sell Your Car</Button>
          </View>
        </View>
      </Card>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
