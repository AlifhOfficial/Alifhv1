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
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Modal, View } from 'react-native';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { ThemeProvider, useTheme } from '@/context/theme-context';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { TabBarProvider, useTabBar } from '@/context/tab-bar-context';
import { SearchProvider } from '@/context/search-context';
import { WebSocketProvider } from '@/context/websocket-context';
import { Loader } from '@/components/ui/loader';
import { GlobalTabBar } from '@/components/layout/global-tab-bar';
import { TopSafeAreaGradient } from '@/components/layout/top-safe-area';
import { BottomSafeAreaGradient } from '@/components/layout/bottom-safe-area';
import { AuthFlow } from '@/components/auth';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {});

// Hide native splash immediately - we show our own loader
SplashScreen.hideAsync().catch(() => {});

// Custom themes using our Colors
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
    regular: { fontFamily: 'Inter_400Regular', fontWeight: '400' },
    medium: { fontFamily: 'Inter_500Medium', fontWeight: '500' },
    bold: { fontFamily: 'Inter_700Bold', fontWeight: '700' },
    heavy: { fontFamily: 'Inter_700Bold', fontWeight: '800' },
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
    regular: { fontFamily: 'Inter_400Regular', fontWeight: '400' },
    medium: { fontFamily: 'Inter_500Medium', fontWeight: '500' },
    bold: { fontFamily: 'Inter_700Bold', fontWeight: '700' },
    heavy: { fontFamily: 'Inter_700Bold', fontWeight: '800' },
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
  const { isTabBarVisible, isHeaderVisible } = useTabBar();
  const router = useRouter();
  const colors = Colors[colorScheme];

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
    router.replace('/(tabs)/browse');
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
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Loader />
      </View>
    );
  }

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : LightTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="listing/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="seller-contact/[listingId]" options={{ presentation: 'card' }} />
        <Stack.Screen name="profile" options={{ presentation: 'card' }} />
        <Stack.Screen name="settings" options={{ presentation: 'card' }} />
        <Stack.Screen name="saved" options={{ presentation: 'card' }} />
        <Stack.Screen name="chat/[conversationId]" options={{ presentation: 'card' }} />
        <Stack.Screen name="create-listing" options={{ presentation: 'card' }} />
        <Stack.Screen name="inventory" options={{ presentation: 'card' }} />
      </Stack>
      
      {/* Global Safe Area Gradients - hidden when chrome is hidden */}
      {isTabBarVisible && <BottomSafeAreaGradient />}
      
      {/* Global Tab Bar - visible on all screens unless explicitly hidden */}
      {isTabBarVisible && <GlobalTabBar />}
      
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
  });

  // Minimum splash time to show branded loader (2 seconds)
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2000); // Show loader for at least 2 seconds

    return () => clearTimeout(timer);
  }, []);

  // Show branded loader until fonts are loaded AND minimum time has passed
  if (!fontsLoaded || !minTimeElapsed) {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.dark.background }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <Loader />
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  // Always render with full provider stack - onboarding is handled inside RootLayoutNav
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.dark.background }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <BottomSheetModalProvider>
            <TabBarProvider>
              <SearchProvider>
                <AuthProvider>
                  <WebSocketWrapper>
                    <RootLayoutNav />
                  </WebSocketWrapper>
                </AuthProvider>
              </SearchProvider>
            </TabBarProvider>
          </BottomSheetModalProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
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
