/**
 * KYC Location Map Component
 * 
 * Displays the IP location from KYC verification on a Leaflet map
 */

'use client';

import { useMemo, useEffect, useState, type ComponentType } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet components with no SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
) as ComponentType<any>;
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
) as ComponentType<any>;
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
) as ComponentType<any>;
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
) as ComponentType<any>;

interface KycLocationMapProps {
  latitude: number;
  longitude: number;
  city?: string | null;
  country?: string | null;
  isVpnOrTor?: boolean | null;
}

export function KycLocationMap({ 
  latitude, 
  longitude, 
  city, 
  country,
  isVpnOrTor 
}: KycLocationMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [icon, setIcon] = useState<any>(null);

  // Only render on client side
  useEffect(() => {
    setIsClient(true);
    
    // Load Leaflet and create icon
    import('leaflet').then((leaflet) => {
      // Fix default marker icon issue
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
      
      // Create custom icon (red for VPN, blue for normal)
      const customIcon = new leaflet.Icon({
        iconUrl: isVpnOrTor 
          ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png'
          : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      
      setIcon(customIcon);
    });
  }, [isVpnOrTor]);

  const position = useMemo(() => [latitude, longitude] as [number, number], [latitude, longitude]);
  const locationLabel = [city, country].filter(Boolean).join(', ') || 'Unknown Location';

  if (!isClient || !icon) {
    return (
      <div className="h-[200px] w-full rounded-lg bg-muted flex items-center justify-center">
        <span className="text-subhead text-muted-foreground">Loading map...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <MapContainer
        center={position}
        zoom={10}
        scrollWheelZoom={false}
        className="h-[200px] w-full rounded-lg z-0"
        style={{ height: '200px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={icon}>
          <Popup>
            <div className="text-subhead">
              <p className="font-medium">{locationLabel}</p>
              <p className="text-muted-foreground text-caption1">
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </p>
              {isVpnOrTor && (
                <p className="text-destructive text-caption1 mt-1">
                  ⚠️ VPN/Tor Detected
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Coordinates overlay */}
      <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur px-2 py-1 rounded text-caption1 text-muted-foreground">
        {latitude.toFixed(4)}, {longitude.toFixed(4)}
      </div>
    </div>
  );
}
