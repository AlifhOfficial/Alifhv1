/**
 * Location Section Component
 */

'use client';

import React, { Suspense, lazy } from 'react';
import { useToast } from '@/hooks/use-toast';

const LocationMap = lazy(() => 
  import('./location-map').then(mod => ({ default: mod.LocationMap }))
);

interface LocationSectionProps {
  city: string;
  emirate: string;
  latitude?: number;
  longitude?: number;
  isEditing: boolean;
  onCityChange: (value: string) => void;
  onEmirateChange: (value: string) => void;
  onLocationSelect: (lat: number, lng: number) => void;
}

export function LocationSection({
  city,
  emirate,
  latitude,
  longitude,
  isEditing,
  onCityChange,
  onEmirateChange,
  onLocationSelect,
}: LocationSectionProps) {
  const { toast } = useToast();

  // Auto-fetch location on mount if editing and no location set
  React.useEffect(() => {
    if (isEditing && !latitude && !longitude && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationSelect(position.coords.latitude, position.coords.longitude);
          // Reverse geocode to get city/emirate
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`)
            .then(res => res.json())
            .then(data => {
              if (data.address) {
                if (data.address.city) onCityChange(data.address.city);
                if (data.address.state) onEmirateChange(data.address.state);
              }
            })
            .catch(() => {});
        },
        () => {}
      );
    }
  }, []);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      toast({
        title: 'Getting location...',
        description: 'Please allow location access',
      });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationSelect(
            position.coords.latitude,
            position.coords.longitude
          );
          
          // Reverse geocode to get city and emirate
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`)
            .then(res => res.json())
            .then(data => {
              if (data.address) {
                if (data.address.city) onCityChange(data.address.city);
                if (data.address.state) onEmirateChange(data.address.state);
              }
              toast({
                title: 'Location fetched',
                description: 'Your location and address have been set',
              });
            })
            .catch(() => {
              toast({
                title: 'Location fetched',
                description: 'Your current location has been set',
              });
            });
        },
        (error) => {
          toast({
            title: 'Location error',
            description: 'Could not fetch your location. Please set it manually.',
            variant: 'destructive',
          });
        }
      );
    }
  };

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">
            City
          </label>
          {isEditing ? (
            <input
              type="text"
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              placeholder="Dubai"
              className="w-full h-10 px-3 bg-background border border-border/40 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          ) : (
            <p className="h-10 px-3 flex items-center text-sm text-foreground">
              {city || '—'}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">
            Emirate
          </label>
          {isEditing ? (
            <input
              type="text"
              value={emirate}
              onChange={(e) => onEmirateChange(e.target.value)}
              placeholder="Dubai"
              className="w-full h-10 px-3 bg-background border border-border/40 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          ) : (
            <p className="h-10 px-3 flex items-center text-sm text-foreground">
              {emirate || '—'}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground">
            {isEditing ? 'Pin your location on map' : 'Your location'}
          </label>
          {isEditing && (
            <button
              onClick={handleUseCurrentLocation}
              className="h-8 px-3 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Use current location
            </button>
          )}
        </div>
        <Suspense
          fallback={
            <div className="h-96 bg-muted/20 border border-border/40 rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          }
        >
          <LocationMap
            latitude={latitude}
            longitude={longitude}
            onLocationSelect={isEditing ? onLocationSelect : undefined}
          />
        </Suspense>
        {isEditing && (
          <div className="bg-muted/20 border border-border/20 rounded-lg p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Click anywhere on the map to set your precise location, or use the button above to auto-fetch your current location.
            </p>
          </div>
        )}
        {latitude && longitude && (
          <p className="text-xs text-muted-foreground">
            Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
        )}
      </div>
    </>
  );
}
