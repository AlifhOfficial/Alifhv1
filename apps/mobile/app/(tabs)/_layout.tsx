import { Tabs } from 'expo-router';
import { Home, Heart, MessageCircle, User } from 'lucide-react-native';
import { useColor } from '@/hooks/useColor';
import { FONT_FAMILY_MEDIUM } from '@/theme/globals';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const fg = useColor('foreground');
  const mutedFg = useColor('mutedForeground');
  const bg = useColor('sidebar');
  const border = useColor('border');
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: fg,
        tabBarInactiveTintColor: mutedFg,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: bg,
          borderTopWidth: 0.5,
          borderTopColor: border,
          height: 56 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontFamily: FONT_FAMILY_MEDIUM,
          fontSize: 10,
          letterSpacing: -0.2,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color }) => <Home size={22} color={color} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color }) => <Heart size={22} color={color} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <MessageCircle size={22} color={color} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={22} color={color} strokeWidth={1.75} />,
        }}
      />
    </Tabs>
  );
}
