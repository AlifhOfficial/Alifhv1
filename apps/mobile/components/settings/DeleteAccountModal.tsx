/**
 * Delete Account Modal Component
 * Confirmation modal for account deletion - matches Profile styling
 */

import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, Modal, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Loader2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Typography } from '@/constants/theme';
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
    ? { intensity: 60, tint: isDark ? 'dark' : 'light' }
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
        <Pressable style={styles.overlayTouch} onPress={handleClose} />
        
        <View style={[
          styles.content, 
          { 
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }
        ]}>
          <Text style={[styles.title, { color: colors.error }]}>
            Delete Account?
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            This action cannot be undone. Your account will be permanently deleted
            after 6 months.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textTertiary }]}>
              Type "DELETE" to confirm
            </Text>
            <TextInput
              value={deleteText}
              onChangeText={setDeleteText}
              placeholder="DELETE"
              placeholderTextColor={colors.inputPlaceholder}
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.buttons}>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.button,
                { 
                  backgroundColor: colors.buttonSecondary, 
                  opacity: pressed ? 0.7 : 1 
                },
              ]}
            >
              <Text style={[styles.buttonText, { color: colors.buttonSecondaryForeground }]}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              disabled={deleteText !== 'DELETE' || isDeleting}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: colors.buttonDestructive,
                  opacity: deleteText !== 'DELETE' ? 0.5 : pressed ? 0.8 : 1,
                },
              ]}
            >
              {isDeleting ? (
                <Loader2 size={18} color={colors.buttonDestructiveForeground} strokeWidth={2} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.buttonDestructiveForeground }]}>
                  Delete
                </Text>
              )}
            </Pressable>
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
    padding: 24,
  },
  overlayTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
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
    fontSize: Typography.h4.fontSize,
    lineHeight: Typography.h4.lineHeight,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: Typography.h4.fontWeight as any,
    letterSpacing: Typography.h4.letterSpacing,
    marginBottom: 8,
  },
  description: {
    fontSize: Typography.subhead.fontSize,
    lineHeight: Typography.headline.lineHeight,
    fontFamily: 'Inter_400Regular',
    fontWeight: Typography.subhead.fontWeight as any,
    letterSpacing: Typography.subhead.letterSpacing,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: Typography.footnote.fontSize,
    lineHeight: Typography.footnote.lineHeight,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as any,
    letterSpacing: Typography.footnote.letterSpacing,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: Typography.callout.fontSize,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as any,
    letterSpacing: Typography.callout.letterSpacing,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: Typography.buttonMedium.fontSize,
    lineHeight: Typography.buttonMedium.lineHeight,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: Typography.buttonMedium.fontWeight as any,
    letterSpacing: Typography.buttonMedium.letterSpacing,
  },
});
