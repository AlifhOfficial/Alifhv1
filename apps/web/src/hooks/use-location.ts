/**
 * useLocation Hook - Web
 * Handles browser geolocation API and reverse geocoding
 */

'use client';

import { useState, useCallback } from 'react';

export interface LocationResult {
  latitude: number;
  longitude: number;
  address?: string;
  placeName?: string;
}

interface UseLocationReturn {
  isLoading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<LocationResult | null>;
}

export function useLocation(): UseLocationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reverseGeocode = useCallback(async (
    latitude: number,
    longitude: number
  ): Promise<{ address?: string; placeName?: string }> => {
    try {
      // Use OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Revvup/1.0', // Required by Nominatim
          },
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();

      if (data.address) {
        const parts = [
          data.address.road,
          data.address.suburb || data.address.neighbourhood,
          data.address.city || data.address.town || data.address.village,
          data.address.state,
        ].filter(Boolean);

        return {
          address: parts.join(', ') || undefined,
          placeName: data.name || data.address.amenity || data.address.building || undefined,
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

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return null;
    }

    try {
      // Request location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // Accept cached position up to 1 minute old
        });
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode for address
      const { address, placeName } = await reverseGeocode(latitude, longitude);

      return {
        latitude,
        longitude,
        address,
        placeName,
      };
    } catch (err) {
      let errorMessage = 'Failed to get location';
      
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
      }

      setError(errorMessage);
      console.error('[useLocation] Error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [reverseGeocode]);

  return {
    isLoading,
    error,
    getCurrentLocation,
  };
}
