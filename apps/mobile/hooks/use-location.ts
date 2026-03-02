/**
 * useLocation Hook
 * Handles location permissions and fetching current position
 * Uses expo-location for native location services
 */

import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';

export interface LocationResult {
  latitude: number;
  longitude: number;
  address?: string;
  placeName?: string;
}

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

interface UseLocationOptions {
  showAlert?: (title: string, message?: string, buttons?: AlertButton[]) => void;
}

interface UseLocationReturn {
  isLoading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<LocationResult | null>;
}

export function useLocation(options: UseLocationOptions = {}): UseLocationReturn {
  const { showAlert } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
    
    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      // Show alert with option to open settings
      showAlert?.(
        'Location Permission Required',
        'Please enable location access in Settings to share your location.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );
      return false;
    }

    return true;
  }, []);

  const reverseGeocode = useCallback(async (
    latitude: number,
    longitude: number
  ): Promise<{ address?: string; placeName?: string }> => {
    try {
      const [result] = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      if (result) {
        // Build address string
        const addressParts = [
          result.street,
          result.district,
          result.city,
          result.region,
        ].filter(Boolean);
        
        return {
          address: addressParts.join(', ') || undefined,
          placeName: result.name || undefined,
        };
      }
    } catch (err) {
      console.warn('[useLocation] Reverse geocode failed:', err);
    }
    
    return {};
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<LocationResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Request permission
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setError('Location permission denied');
        return null;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // Reverse geocode for address
      const { address, placeName } = await reverseGeocode(latitude, longitude);

      return {
        latitude,
        longitude,
        address,
        placeName,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      console.error('[useLocation] Error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [requestPermission, reverseGeocode]);

  return {
    isLoading,
    error,
    getCurrentLocation,
  };
}
