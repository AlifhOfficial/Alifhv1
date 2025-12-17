/**
 * Location Map - Alifh Design System
 * Interactive map for selecting location coordinates
 * Following minimal design principles
 */

'use client';

import { useEffect, useState, memo } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet components with no SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

// Dynamically import the MapClickHandler component
const MapClickHandler = dynamic(
  () => import('./map-click-handler').then((mod) => mod.MapClickHandler),
  { ssr: false }
);

interface LocationMapProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
}

function LocationMapComponent({ latitude, longitude, onLocationSelect }: LocationMapProps) {
  const [position, setPosition] = useState<[number, number]>([
    latitude ?? 25.2048,
    longitude ?? 55.2708,
  ]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    // Load Leaflet only on client side
    import('leaflet').then((leaflet) => {
      // Fix for default marker icon
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
      setIsMounted(true);
    });
  }, []);

  if (!isMounted) {
    return (
      <div className="h-40 bg-muted/20 border border-border rounded-lg flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="h-40 w-full border border-border rounded-lg overflow-hidden relative z-0">
      <MapContainer
        center={position}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} />
        {onLocationSelect && <MapClickHandler onLocationSelect={onLocationSelect} />}
      </MapContainer>
    </div>
  );
}

export const LocationMap = memo(LocationMapComponent);
