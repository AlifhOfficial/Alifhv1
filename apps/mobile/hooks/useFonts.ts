import { useFonts as useExpoFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Prevent the splash screen from auto-hiding before fonts are loaded
SplashScreen.preventAutoHideAsync();

export function useFonts() {
  const [loaded, error] = useExpoFonts({
    Inter: require('@/assets/fonts/InterVariable.ttf'),
    'Inter-Italic': require('@/assets/fonts/InterVariable-Italic.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  return { loaded, error };
}
