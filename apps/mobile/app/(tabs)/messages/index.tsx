import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useColor } from '@/hooks/useColor';
import { MessageCircle, Send, User } from 'lucide-react-native';
import { ScrollView } from 'react-native';

export default function MessagesScreen() {
  const muted = useColor('muted');
  const primary = useColor('primary');
  const border = useColor('border');

  // Sample messages
  const messages = [
    {
      id: 1,
      name: 'Ahmed Hassan',
      message: 'Is this still available?',
      time: '2m ago',
      unread: true,
    },
    {
      id: 2,
      name: 'Sara Ali',
      message: 'Thanks for the quick response!',
      time: '1h ago',
      unread: true,
    },
    {
      id: 3,
      name: 'Mohammed Khan',
      message: 'Can we schedule a viewing?',
      time: '3h ago',
      unread: false,
    },
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
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name={MessageCircle} size={28} color={primary} />
          <Text variant='heading'>Messages</Text>
        </View>
        <Text variant='captionMuted' style={{ textAlign: 'center' }}>
          Chat with buyers and sellers
        </Text>
      </View>

      {/* Messages List */}
      <Card>
        <View style={{ gap: 0 }}>
          {messages.map((msg, index) => (
            <View
              key={msg.id}
              style={{
                paddingVertical: 16,
                borderBottomWidth: index < messages.length - 1 ? 1 : 0,
                borderBottomColor: border,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {/* Avatar */}
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: muted,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={User} size={24} color={primary} />
              </View>

              {/* Message Content */}
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text variant='bodySemibold'>{msg.name}</Text>
                  <Text variant='captionMuted'>{msg.time}</Text>
                </View>
                <Text
                  variant='caption'
                  style={{ opacity: msg.unread ? 1 : 0.7 }}
                  numberOfLines={1}
                >
                  {msg.message}
                </Text>
              </View>

              {/* Unread Badge */}
              {msg.unread && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: primary,
                  }}
                />
              )}
            </View>
          ))}
        </View>
      </Card>

      {/* Info Card */}
      <Card>
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name={Send} size={20} color={primary} />
            <Text variant='section'>Instant Communication</Text>
          </View>
          <Text variant='body'>
            Stay connected with potential buyers and sellers. Get instant notifications 
            and respond quickly to inquiries.
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}
