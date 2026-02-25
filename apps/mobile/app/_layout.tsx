/**
 * Root Layout - Revvup Mobile App
 */

import { Theme as NavTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, router as expoRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { DancingScript_400Regular, DancingScript_700Bold } from '@expo-google-fonts/dancing-script';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useMemo } from 'react';
import { Modal, View, LogBox, Platform } from 'react-native';
import 'react-native-reanimated';

// Suppress warnings from third-party dependencies that can't be fixed in user code
// Note: These warnings come from dependencies, not our code
LogBox.ignoreLogs([
  /SafeAreaView.*deprecated/,
  'expo-notifications: Android Push notifications',
  '`expo-notifications` functionality is not fully supported in Expo Go',
]);

import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Colors, Fonts } from '@/constants/theme';
import { ThemeProvider, useTheme } from '@/context/theme-context';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { FavoritesProvider } from '@/context/favorites-context';
import { TabBarProvider, useTabBar } from '@/context/tab-bar-context';
import { SearchProvider } from '@/context/search-context';
import { WebSocketProvider } from '@/context/websocket-context';
import { NotificationProvider } from '@/context/notification-context';
import { NetworkProvider } from '@/context/network-context';
import { BootScreen } from '@/components/layout/boot-screen';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { GlobalTabBar } from '@/components/layout/global-tab-bar';
import { BottomSafeAreaGradient } from '@/components/layout/bottom-safe-area';
import { AuthFlow } from '@/components/auth';
import { AuthSheet } from '@/components/sheets';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {});

// Hide native splash immediately - we show our own loader
SplashScreen.hideAsync().catch(() => {});

// Custom themes using our Colors and Fonts
const LightTheme: NavTheme = {
  dark: false,
  colors: {
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.surface,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.primary,
  },
  fonts: {
    regular: { fontFamily: Fonts.regular, fontWeight: '400' },
    medium: { fontFamily: Fonts.medium, fontWeight: '500' },
    bold: { fontFamily: Fonts.bold, fontWeight: '700' },
    heavy: { fontFamily: Fonts.bold, fontWeight: '800' },
  },
};

const CustomDarkTheme: NavTheme = {
  dark: true,
  colors: {
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.surface,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.primary,
  },
  fonts: {
    regular: { fontFamily: Fonts.regular, fontWeight: '400' },
    medium: { fontFamily: Fonts.medium, fontWeight: '500' },
    bold: { fontFamily: Fonts.bold, fontWeight: '700' },
    heavy: { fontFamily: Fonts.bold, fontWeight: '800' },
  },
};

const NAVIGATION_LOCK_MS = 600;
const NAV_LOCK_KEY = '__revvup_nav_lock__';

type NavLockState = {
  locked: boolean;
  timer: ReturnType<typeof setTimeout> | null;
  installed: boolean;
  originalPush?: typeof expoRouter.push;
  originalReplace?: typeof expoRouter.replace;
};

const navLockState = ((globalThis as unknown as Record<string, NavLockState>)[NAV_LOCK_KEY] ||= {
  locked: false,
  timer: null,
  installed: false,
});

if (!navLockState.installed) {
  navLockState.originalPush = expoRouter.push.bind(expoRouter);
  navLockState.originalReplace = expoRouter.replace.bind(expoRouter);

  (expoRouter as typeof expoRouter).push = (...args: Parameters<typeof expoRouter.push>) => {
    if (navLockState.locked) return;
    navLockState.locked = true;
    if (navLockState.timer) {
      clearTimeout(navLockState.timer);
    }
    navLockState.timer = setTimeout(() => {
      navLockState.locked = false;
    }, NAVIGATION_LOCK_MS);
    navLockState.originalPush?.(...args);
  };

  (expoRouter as typeof expoRouter).replace = (...args: Parameters<typeof expoRouter.replace>) => {
    if (navLockState.locked) return;
    navLockState.locked = true;
    if (navLockState.timer) {
      clearTimeout(navLockState.timer);
    }
    navLockState.timer = setTimeout(() => {
      navLockState.locked = false;
    }, NAVIGATION_LOCK_MS);
    navLockState.originalReplace?.(...args);
  };

  navLockState.installed = true;
}

function RootLayoutNav() {
  const { colorScheme } = useTheme();
  const { showAuthFlow, closeAuthFlow, signIn } = useAuth();
  const { isTabBarVisible } = useTabBar();
  const router = useRouter();
  const colors = Colors[colorScheme];
  
  // Set native root view background color (fixes Android black flash during transitions)
  useEffect(() => {
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync(colors.background);
    }
  }, [colors.background]);
  
  // Memoize navigation theme to prevent full re-renders
  const navTheme = useMemo(
    () => colorScheme === 'dark' ? CustomDarkTheme : LightTheme,
    [colorScheme]
  );

  // Track if user has completed onboarding
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem('hasCompletedOnboarding');
        setHasCompletedOnboarding(value === 'true');
      } catch {
        setHasCompletedOnboarding(false);
      }
    };
    checkOnboarding();
  }, []);

  const handleOnboardingComplete = async (user?: { id: string; name: string; email: string }) => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      if (user) {
        signIn(user);
      }
      setHasCompletedOnboarding(true);
    } catch {
      setHasCompletedOnboarding(true);
    }
  };

  const handleOnboardingSkip = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      setHasCompletedOnboarding(true);
    } catch {
      setHasCompletedOnboarding(true);
    }
  };

  const handleAuthComplete = (user?: { id: string; name: string; email: string }) => {
    if (user) {
      signIn(user);
    }
    closeAuthFlow();
    router.replace('/browse');
  };

  // Show onboarding auth flow if not completed
  if (hasCompletedOnboarding === false) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <AuthFlow 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </View>
    );
  }

  // Show loading while checking onboarding status
  if (hasCompletedOnboarding === null) {
    return <BootScreen />;
  }

  return (
    <NavigationThemeProvider value={navTheme}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: colors.background },
            animationTypeForReplace: 'push',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="browse" options={{ animation: 'none' }} />
          <Stack.Screen name="messages" options={{ animation: 'none' }} />
          <Stack.Screen name="listing/[id]" />
          <Stack.Screen name="seller-contact/[listingId]" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="chat/[conversationId]" />
          <Stack.Screen name="create-listing" />
          <Stack.Screen name="inventory" />
          <Stack.Screen name="blk" />
          <Stack.Screen name="partners" />
        </Stack>
      </View>
      
      {/* Global Safe Area Gradients - hidden when chrome is hidden */}
      {isTabBarVisible && <BottomSafeAreaGradient />}
      
      {/* Global Tab Bar - always render, let component handle visibility */}
      <GlobalTabBar />
      
      {/* Auth Sheet - renders above tab bar */}
      <AuthSheetRenderer />
      
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Auth Flow Modal - can be triggered from anywhere via useAuth */}
      <Modal
        visible={showAuthFlow}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <AuthFlow 
            onComplete={handleAuthComplete}
            onSkip={closeAuthFlow}
          />
        </View>
      </Modal>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    DancingScript_400Regular,
    DancingScript_700Bold,
  });

  // Show branded boot screen until fonts are loaded
  // No artificial delays - app proceeds as soon as fonts are ready
  if (!fontsLoaded) {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.dark.background }}>
        <BootScreen />
      </GestureHandlerRootView>
    );
  }

  // Always render with full provider stack - onboarding is handled inside RootLayoutNav
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.dark.background }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <KeyboardProvider>
              <NetworkProvider>
                <BottomSheetModalProvider>
                  <TabBarProvider>
                    <SearchProvider>
                      <AuthProvider>
                        <FavoritesProvider>
                          <WebSocketWrapper>
                            <NotificationWrapper>
                              <RootLayoutNav />
                              <OfflineBanner />
                            </NotificationWrapper>
                          </WebSocketWrapper>
                        </FavoritesProvider>
                      </AuthProvider>
                    </SearchProvider>
                  </TabBarProvider>
                </BottomSheetModalProvider>
              </NetworkProvider>
            </KeyboardProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

// WebSocket wrapper that uses auth context
function WebSocketWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <WebSocketProvider userId={user?.id}>
      {children}
    </WebSocketProvider>
  );
}

// Auth sheet renderer - uses auth context
function AuthSheetRenderer() {
  const { authSheetVisible, authSheetContext, hideAuthSheet, openAuthFlow } = useAuth();
  
  const handleSignIn = () => {
    hideAuthSheet();
    // Small delay to let sheet dismiss smoothly
    setTimeout(() => {
      openAuthFlow();
    }, 150);
  };
  
  return (
    <AuthSheet
      visible={authSheetVisible}
      onClose={hideAuthSheet}
      onSignIn={handleSignIn}
      context={authSheetContext}
    />
  );
}

// Notification wrapper that uses auth context
function NotificationWrapper({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  );
}
