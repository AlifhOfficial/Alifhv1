/**
 * Root Layout - Revvup Mobile App
 */

import { Theme as NavTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
    primary: Colors.light.tint,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.tint,
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
    primary: Colors.dark.tint,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.tint,
  },
  fonts: {
    regular: { fontFamily: 'Inter_400Regular', fontWeight: '400' },
    medium: { fontFamily: 'Inter_500Medium', fontWeight: '500' },
    bold: { fontFamily: 'Inter_700Bold', fontWeight: '700' },
    heavy: { fontFamily: 'Inter_700Bold', fontWeight: '800' },
  },
};

function RootLayoutNav() {
  const { colorScheme } = useTheme();
  const { showAuthFlow, closeAuthFlow, signIn } = useAuth();
  const { isTabBarVisible, isHeaderVisible } = useTabBar();
  const router = useRouter();
  const colors = Colors[colorScheme];

  const handleAuthComplete = (user?: { id: string; name: string; email: string }) => {
    if (user) {
      signIn(user);
    }
    closeAuthFlow();
    // Navigate to search tab after successful auth
    router.replace('/(tabs)/search');
  };

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
        <Stack.Screen name="profile" options={{ presentation: 'card' }} />
        <Stack.Screen name="settings" options={{ presentation: 'card' }} />
        <Stack.Screen name="saved" options={{ presentation: 'card' }} />
        <Stack.Screen name="chat" options={{ presentation: 'card' }} />
      </Stack>
      
      {/* Global Safe Area Gradients - hidden when chrome is hidden */}
      {isHeaderVisible && <TopSafeAreaGradient />}
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
        <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' }}>
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
  // Track if user has completed onboarding
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2000); // Show loader for at least 2 seconds

    return () => clearTimeout(timer);
  }, []);

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

  const handleAuthComplete = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      setHasCompletedOnboarding(true);
    } catch (e) {
      // Still proceed even if storage fails
      setHasCompletedOnboarding(true);
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      setHasCompletedOnboarding(true);
    } catch (e) {
      setHasCompletedOnboarding(true);
    }
  };

  // Show branded loader until fonts are loaded AND minimum time has passed AND onboarding check complete
  if (!fontsLoaded || !minTimeElapsed || hasCompletedOnboarding === null) {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000000' }}>
        <ThemeProvider>
          <Loader />
        </ThemeProvider>
      </GestureHandlerRootView>
    );
  }

  // Show auth flow if user hasn't completed onboarding
  if (!hasCompletedOnboarding) {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000000' }}>
        <ThemeProvider>
          <AuthFlow 
            onComplete={handleAuthComplete}
            onSkip={handleSkip}
          />
          <StatusBar style="auto" />
        </ThemeProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000000' }}>
      <BottomSheetModalProvider>
        <ThemeProvider>
          <TabBarProvider>
            <AuthProvider>
              <WebSocketWrapper>
                <RootLayoutNav />
              </WebSocketWrapper>
            </AuthProvider>
          </TabBarProvider>
        </ThemeProvider>
      </BottomSheetModalProvider>
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
