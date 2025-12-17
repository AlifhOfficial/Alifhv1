/**
 * Location Section Component
 */

"use client";

import React, { Suspense, lazy } from 'react';
import { useToast } from '@/hooks/use-toast';

const LocationMap = lazy(() => 
  import('../../profile/sections/location-map').then(mod => ({ default: mod.LocationMap }))
);

interface LocationSectionProps {
  address: string;
  emirate: string;
  city: string;
  locationLat: number | null;
  locationLng: number | null;
  showroomCount: number;
  isEditing: boolean;
  onAddressChange: (value: string) => void;
  onEmirateChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onLocationLatChange: (lat: number) => void;
  onLocationLngChange: (lng: number) => void;
  onShowroomCountChange: (value: number) => void;
}

export function LocationSection({
  address,
  emirate,
  city,
  locationLat,
  locationLng,
  showroomCount,
  isEditing,
  onAddressChange,
  onEmirateChange,
  onCityChange,
  onLocationLatChange,
  onLocationLngChange,
  onShowroomCountChange,
}: LocationSectionProps) {
  const { toast } = useToast();
  const [isLoadingLocation, setIsLoadingLocation] = React.useState(false);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Not supported',
        description: 'Location services are not available in your browser',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        onLocationLatChange(position.coords.latitude);
        onLocationLngChange(position.coords.longitude);
        
        // Reverse geocode to get address details
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
          );
          const data = await response.json();
          
          if (data.address) {
            if (data.address.city) onCityChange(data.address.city);
            if (data.address.state) onEmirateChange(data.address.state);
            if (data.display_name) onAddressChange(data.display_name);
          }
          
          toast({
            title: 'Location set',
            description: 'Your current location has been detected',
          });
        } catch {
          toast({
            title: 'Location set',
            description: 'Location coordinates set. Please enter address manually.',
          });
        } finally {
          setIsLoadingLocation(false);
        }
      },
      () => {
        setIsLoadingLocation(false);
        toast({
          title: 'Permission denied',
          description: 'Please allow location access or enter manually',
          variant: 'destructive',
        });
      }
    );
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    onLocationLatChange(lat);
    onLocationLngChange(lng);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">
          Full Address
        </label>
        {isEditing ? (
          <input
            type="text"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="Sheikh Zayed Road, Dubai"
            className="w-full h-10 px-3 bg-background border border-border/40 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        ) : (
          <p className="h-10 px-3 flex items-center text-sm text-foreground">
            {address || '—'}
          </p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">
            City/Area
          </label>
          {isEditing ? (
            <input
              type="text"
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              placeholder="Dubai Marina"
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

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">
            Showrooms
          </label>
          {isEditing ? (
            <input
              type="number"
              value={showroomCount}
              onChange={(e) => onShowroomCountChange(parseInt(e.target.value) || 1)}
              placeholder="1"
              min="1"
              className="w-full h-10 px-3 bg-background border border-border/40 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          ) : (
            <p className="h-10 px-3 flex items-center text-sm text-foreground">
              {showroomCount > 0 ? showroomCount : 1}
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
              disabled={isLoadingLocation}
              className="h-8 px-3 text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoadingLocation && (
                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
              {isLoadingLocation ? 'Getting location...' : 'Use current location'}
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
            latitude={locationLat ?? undefined}
            longitude={locationLng ?? undefined}
            onLocationSelect={isEditing ? handleLocationSelect : undefined}
          />
        </Suspense>
        {isEditing && (
          <div className="bg-muted/20 border border-border/20 rounded-lg p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Click anywhere on the map to set your precise location, or use the button above to auto-fetch your current location.
            </p>
          </div>
        )}
        {locationLat && locationLng && (
          <p className="text-xs text-muted-foreground">
            Coordinates: {locationLat.toFixed(6)}, {locationLng.toFixed(6)}
          </p>
        )}
      </div>
    </div>
  );
}
