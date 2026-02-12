/**
 * Delete Account Modal Component
 * Confirmation modal for account deletion - matches Profile styling
 */

import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Modal, Platform } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { BlurView, BlurTint } from 'expo-blur';
import { Loader2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Heading, Body, Supporting, ButtonText } from '@/components/ui';
import { Typography, Spacing, Radius } from '@/constants/theme';
import type { ThemeColors } from './types';

interface DeleteAccountModalProps {
  visible: boolean;
  isDeleting: boolean;
  colors: ThemeColors;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteAccountModal({
  visible,
  isDeleting,
  colors,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
  const [deleteText, setDeleteText] = useState('');
  const isDark = colors.isDark;

  const handleClose = () => {
    setDeleteText('');
    onClose();
  };

  const handleConfirm = () => {
    if (deleteText === 'DELETE') {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      onConfirm();
    }
  };

  const Overlay = Platform.OS === 'ios' ? BlurView : View;
  const overlayProps = Platform.OS === 'ios' 
    ? { intensity: 60, tint: (isDark ? 'dark' : 'light') as BlurTint }
    : {};

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <Overlay 
        {...overlayProps}
        style={[
          styles.overlay, 
          Platform.OS === 'android' && { backgroundColor: colors.overlay }
        ]}
      >
        <HapticPressable style={styles.overlayTouch} onPress={handleClose} />
        
        <View style={[
          styles.content, 
          { 
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }
        ]}>
          <Heading size="small" tone="error" style={styles.title}>
            Delete Account?
          </Heading>
          <Body size="medium" tone="secondary" style={styles.description}>
            This action cannot be undone. Your account will be permanently deleted
            after 6 months.
          </Body>

          <View style={styles.inputContainer}>
            <Supporting size="small" tone="muted" style={styles.inputLabel}>
              Type "DELETE" to confirm
            </Supporting>
            <TextInput
              value={deleteText}
              onChangeText={setDeleteText}
              placeholder="DELETE"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                Typography.dataMedium,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.buttons}>
            <HapticPressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.button,
                { 
                  backgroundColor: colors.surfaceSecondary, 
                  opacity: pressed ? 0.7 : 1 
                },
              ]}
            >
              <ButtonText size="medium">Cancel</ButtonText>
            </HapticPressable>
            <HapticPressable
              onPress={handleConfirm}
              disabled={deleteText !== 'DELETE' || isDeleting}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: colors.error,
                  opacity: deleteText !== 'DELETE' ? 0.5 : pressed ? 0.8 : 1,
                },
              ]}
            >
              {isDeleting ? (
                <Loader2 size={18} color={colors.primaryForeground} strokeWidth={2} />
              ) : (
                <ButtonText size="medium" style={{ color: colors.primaryForeground }}>
                  Delete
                </ButtonText>
              )}
            </HapticPressable>
          </View>
        </View>
      </Overlay>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['2xl'],
  },
  overlayTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    width: '100%',
    maxWidth: 340,
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing['2xl'],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  title: {
    marginBottom: Spacing.sm,
  },
  description: {
    marginBottom: Spacing['2xl'],
  },
  inputContainer: {
    marginBottom: Spacing['2xl'],
  },
  inputLabel: {
    marginBottom: Spacing.sm,
  },
  input: {
    height: Spacing['5xl'],
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    height: Spacing['5xl'],
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
