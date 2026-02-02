/**
 * Root Layout - Alifh Mobile App
 */

import { Theme as NavTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TamaguiProvider, Theme } from 'tamagui';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import config from '../tamagui.config';
import { Colors } from '@/constants/theme';
import { ThemeProvider, useTheme } from '@/context/theme-context';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

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

  return (
    <TamaguiProvider config={config} defaultTheme={colorScheme}>
      <Theme name={colorScheme}>
        <NavigationThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : LightTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </NavigationThemeProvider>
      </Theme>
    </TamaguiProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
