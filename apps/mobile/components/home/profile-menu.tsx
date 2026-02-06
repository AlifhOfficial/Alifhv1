/**
 * Profile Menu - Simple dropdown for auth actions
 * Revvup Design System + Inter font
 */

import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { User } from 'lucide-react-native';
import { useTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const handleSignIn = () => {
    setOpen(false);
    // TODO: Implement auth
  };

  const handleCreateAccount = () => {
    setOpen(false);
    // TODO: Implement auth
  };

  return (
    <>
      <Pressable
        style={[
          styles.trigger,
          { 
            borderColor: colors.border,
            backgroundColor: colors.surface,
          }
        ]}
        onPress={() => setOpen(true)}
      >
        {({ pressed }) => (
          <User 
            size={20} 
            color="#8E8E93"
            strokeWidth={2}
            style={{ opacity: pressed ? 0.7 : 1 }}
          />
        )}
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable 
          style={styles.overlay} 
          onPress={() => setOpen(false)}
        >
          <View style={styles.contentWrapper}>
            <View style={[
              styles.content,
              { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }
            ]}>
              {/* Sign In */}
              <Pressable
                style={styles.menuItem}
                onPress={handleSignIn}
              >
                {({ pressed }) => (
                  <View style={[
                    styles.menuItemInner,
                    pressed && { backgroundColor: colors.fillTertiary }
                  ]}>
                    <Text style={[styles.menuText, { color: colors.text }]}>
                      Sign in
                    </Text>
                  </View>
                )}
              </Pressable>

              <View style={[styles.separator, { backgroundColor: colors.border }]} />

              {/* Create Account */}
              <Pressable
                style={styles.menuItem}
                onPress={handleCreateAccount}
              >
                {({ pressed }) => (
                  <View style={[
                    styles.menuItemInner,
                    pressed && { backgroundColor: colors.fillTertiary }
                  ]}>
                    <Text style={[styles.menuText, { color: colors.text }]}>
                      Create account
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    padding: 4,
    borderRadius: 24,
    borderWidth: 1,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  contentWrapper: {
    marginTop: 80,
    marginRight: 16,
  },
  content: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    minWidth: 160,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  menuItemInner: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  menuText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    fontWeight: '400' as any,
    letterSpacing: -0.24,
  },
  separator: {
    height: 1,
    marginVertical: 4,
  },
});
