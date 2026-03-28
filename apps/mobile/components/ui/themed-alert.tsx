/**
 * Themed Alert - Android-compatible alert that respects app theme
 * Drop-in replacement for Alert.alert with consistent styling
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Modal, View, StyleSheet, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/context/theme-context';
import { Colors, Spacing, Radius, Sizes } from '@/constants/theme';
import { Heading, Body, ButtonText } from './text';
import * as Haptics from 'expo-haptics';

// ============================================================================
// TYPES
// ============================================================================

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

interface AlertContextType {
  showAlert: (title: string, message?: string, buttons?: AlertButton[]) => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AlertContext = createContext<AlertContextType | null>(null);

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

interface AlertProviderProps {
  children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig | null>(null);

  const showAlert = useCallback((title: string, message?: string, buttons?: AlertButton[]) => {
    setConfig({
      title,
      message,
      buttons: buttons || [{ text: 'OK', style: 'default' }],
    });
    setVisible(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);

  const handleButtonPress = useCallback((button: AlertButton) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVisible(false);
    // Delay callback to allow modal to close smoothly
    setTimeout(() => {
      button.onPress?.();
    }, 100);
  }, []);

  const handleBackdropPress = useCallback(() => {
    // Find cancel button or dismiss
    const cancelButton = config?.buttons?.find(b => b.style === 'cancel');
    if (cancelButton) {
      handleButtonPress(cancelButton);
    } else {
      setVisible(false);
    }
  }, [config, handleButtonPress]);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={handleBackdropPress}
      >
        <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={20} tint={colorScheme} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
          )}
        </Pressable>

        <View style={styles.centeredContainer} pointerEvents="box-none">
          <Pressable
            style={[
              styles.alertBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <Heading size="subheading" style={styles.title}>
              {config?.title}
            </Heading>

            {/* Message */}
            {config?.message && (
              <Body size="body" style={[styles.message, { color: colors.text2 }]}>
                {config.message}
              </Body>
            )}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {config?.buttons?.map((button, index) => {
                const isDestructive = button.style === 'destructive';
                const isCancel = button.style === 'cancel';

                return (
                  <Pressable
                    key={index}
                    onPress={() => handleButtonPress(button)}
                    style={({ pressed }) => [
                      styles.button,
                      {
                        backgroundColor: isDestructive
                          ? colors.error
                          : isCancel
                            ? colors.fill2
                            : colors.primary,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <ButtonText
                      size="body"
                      style={{
                        color: isDestructive
                          ? '#FFFFFF'
                          : isCancel
                            ? colors.text
                            : colors.primaryFg,
                      }}
                    >
                      {button.text}
                    </ButtonText>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  alertBox: {
    width: '100%',
    maxWidth: Spacing["5xl"],
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: Spacing.sm },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  buttonContainer: {
    gap: Spacing.sm,
  },
  button: {
    height: Sizes.actionButtonMd,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
