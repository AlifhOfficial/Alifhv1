import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { useColorScheme } from '@/hooks/useColorScheme';
import { 
  User, 
  Settings, 
  Moon, 
  Sun, 
  Palette,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react-native';
import { ScrollView, Pressable, Appearance, Platform } from 'react-native';
import { setAndroidNavigationBar } from 'expo-navigation-bar';

export default function ProfileScreen() {
  const muted = useColor('muted');
  const primary = useColor('primary');
  const border = useColor('border');
  const card = useColor('card');
  const foreground = useColor('foreground');
  const colorScheme = useColorScheme();

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
  ];

  const handleThemeChange = async (theme: 'light' | 'dark') => {
    Appearance.setColorScheme(theme);
    
    // Update Android navigation bar
    if (Platform.OS === 'android') {
      setAndroidNavigationBar({
        barStyle: theme === 'light' ? 'dark' : 'light',
      });
    }
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        padding: 24,
        gap: 20,
      }}
    >
      {/* Header with Avatar */}
      <View style={{ gap: 16, marginTop: 20, alignItems: 'center' }}>
        {/* Avatar */}
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: muted,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 3,
            borderColor: border,
          }}
        >
          <Icon name={User} size={48} color={primary} />
        </View>

        {/* Name & Email */}
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text variant='heading'>John Doe</Text>
          <Text variant='captionMuted'>Premium Member</Text>
        </View>
      </View>

      {/* Theme Selector */}
      <Card>
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name={Palette} size={20} color={primary} />
            <Text variant='section'>Appearance</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            {themes.map((theme) => {
              const isSelected = colorScheme === theme.value;
              const ThemeIcon = theme.icon;

              return (
                <Pressable
                  key={theme.value}
                  onPress={() => handleThemeChange(theme.value as 'light' | 'dark' | 'charcoal')}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 12,
                    backgroundColor: isSelected ? primary : muted,
                    borderWidth: 1,
                    borderColor: isSelected ? primary : border,
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Icon
                    name={ThemeIcon}
                    size={24}
                    color={isSelected ? '#FFFFFF' : foreground}
                  />
                  <Text
                    variant='caption'
                    style={{
                      color: isSelected ? '#FFFFFF' : foreground,
                      fontWeight: isSelected ? '600' : '500',
                    }}
                  >
                    {theme.label}
                  </Text>
                  {isSelected && (
                    <CheckCircle2
                      size={16}
                      color='#FFFFFF'
                      style={{ position: 'absolute', top: 8, right: 8 }}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>

          <Text variant='captionMuted'>
            Choose your preferred theme. Changes apply instantly across the app.
          </Text>
        </View>
      </Card>

      {/* Contact Info */}
      <Card>
        <View style={{ gap: 12 }}>
          <Text variant='section'>Contact Information</Text>

          {/* Email */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: muted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name={Mail} size={20} color={primary} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant='label'>Email</Text>
              <Text variant='body'>john.doe@example.com</Text>
            </View>
          </View>

          {/* Phone */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: border,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: muted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name={Phone} size={20} color={primary} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant='label'>Phone</Text>
              <Text variant='body'>+971 50 123 4567</Text>
            </View>
          </View>

          {/* Location */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: border,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: muted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name={MapPin} size={20} color={primary} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant='label'>Location</Text>
              <Text variant='body'>Dubai, UAE</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Settings */}
      <Card>
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name={Settings} size={20} color={primary} />
            <Text variant='section'>Settings & Preferences</Text>
          </View>
          <Text variant='body'>
            Manage your account settings, notifications, privacy, and more.
          </Text>
        </View>
      </Card>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
