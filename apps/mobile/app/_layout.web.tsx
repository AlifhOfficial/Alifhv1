import '../global.css';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Slot } from 'expo-router';

import { Colors } from '@/constants/theme';
import { ThemeProvider } from '@/context/theme-context';
import { AuthProvider } from '@/context/auth-context';
import { FavoritesProvider } from '@/context/favorites-context';

import { SearchProvider } from '@/context/search-context';
import { NetworkProvider } from '@/context/network-context';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function WebLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.dark.background }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <NetworkProvider>
              <BottomSheetModalProvider>
                  <SearchProvider>
                    <AuthProvider>
                      <FavoritesProvider>
                        <Slot />
                      </FavoritesProvider>
                    </AuthProvider>
                  </SearchProvider>
              </BottomSheetModalProvider>
            </NetworkProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
