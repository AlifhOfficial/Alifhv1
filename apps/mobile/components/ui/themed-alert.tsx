/**
 * Themed Alert - Android-compatible alert that respects app theme
 * Drop-in replacement for Alert.alert with consistent styling
 */

import { Text } from './text';
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Alert, type AlertButton as NativeAlertButton, Modal, View, StyleSheet, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import * as NavigationBar from 'expo-navigation-bar';
import { useTheme } from '@/context/theme-context';
import { Colors, Shadows, Spacing, Radius, Sizes } from '@/constants/theme';
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

  const syncAndroidNavBarForAlert = useCallback((isAlertVisible: boolean) => {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      // Android nav bar background expects a solid color; translucent/overlay colors can be ignored.
      const alertNavColor = colorScheme === 'dark' ? Colors.dark.black : Colors.light.background;
      NavigationBar.setBackgroundColorAsync(isAlertVisible ? alertNavColor : colors.background);
      NavigationBar.setStyle(colorScheme === 'dark' ? 'dark' : 'light');
    } catch {
      // Ignore failures when activity is not ready.
    }
  }, [colorScheme, colors.background]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    syncAndroidNavBarForAlert(true);
  }, [visible, syncAndroidNavBarForAlert]);

  const showAlert = useCallback((title: string, message?: string, buttons?: AlertButton[]) => {
    if (Platform.OS === 'ios') {
      const nativeButtons: NativeAlertButton[] | undefined = buttons?.map((button) => ({
        text: button.text,
        style: button.style,
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          button.onPress?.();
        },
      }));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(title, message, nativeButtons);
      return;
    }

    setConfig({
      title,
      message,
      buttons: buttons || [{ text: 'OK', style: 'default' }],
    });
    setVisible(true);
    syncAndroidNavBarForAlert(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [syncAndroidNavBarForAlert]);

  const handleButtonPress = useCallback((button: AlertButton) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVisible(false);
    syncAndroidNavBarForAlert(false);
    // Delay callback to allow modal to close smoothly
    setTimeout(() => {
      button.onPress?.();
    }, 100);
  }, [syncAndroidNavBarForAlert]);

  const handleBackdropPress = useCallback(() => {
    // Find cancel button or dismiss
    const cancelButton = config?.buttons?.find(b => b.style === 'cancel');
    if (cancelButton) {
      handleButtonPress(cancelButton);
    } else {
      setVisible(false);
      syncAndroidNavBarForAlert(false);
    }
  }, [config, handleButtonPress, syncAndroidNavBarForAlert]);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={handleBackdropPress}
      >
        <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={20} tint={colorScheme} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} />
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
            <Text variant="subheadEmphasized" style={styles.title}>
              {config?.title}
            </Text>

            {/* Message */}
            {config?.message && (
              <Text variant="footnote" style={[styles.message, { color: colors.labelSecondary }]}> 
                {config.message}
              </Text>
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
                          ? colors.errorMuted
                          : isCancel
                            ? colors.surfaceSecondary
                            : colors.fill2,
                        borderColor: isDestructive
                          ? colors.error
                          : isCancel
                            ? colors.border
                            : colors.border,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <Text
                      variant="subhead"
                      style={{
                        color: isDestructive
                          ? colors.error
                          : isCancel
                            ? colors.labelSecondary
                            : colors.label,
                      }}
                    >
                      {button.text}
                    </Text>
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
    paddingHorizontal: Spacing['3xl'],
  },
  alertBox: {
    width: '100%',
    maxWidth: 340,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    ...Shadows.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  button: {
    height: Sizes.actionButtonSm,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
