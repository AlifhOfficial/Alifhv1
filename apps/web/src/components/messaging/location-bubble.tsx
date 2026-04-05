/**
 * Location Bubble Component - Web
 * Displays a shared location with a static map preview
 * Tappable to open in maps
 */

'use client';

import { MapPin, ExternalLink } from 'lucide-react';
import { cn } from '@/utils/cn';

interface LocationBubbleProps {
  latitude: number;
  longitude: number;
  address?: string;
  placeName?: string;
  isOwn: boolean;
  compact?: boolean;
}

// Static map tile URL (OpenStreetMap - free, no API key)
function getStaticMapUrl(lat: number, lng: number, zoom = 15) {
  // Calculate tile coordinates
  const latRad = (lat * Math.PI) / 180;
  const n = Math.pow(2, zoom);
  const xTile = Math.floor(((lng + 180) / 360) * n);
  const yTile = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );

  // Return single tile as preview
  return `https://tile.openstreetmap.org/${zoom}/${xTile}/${yTile}.png`;
}

function getMapsUrl(lat: number, lng: number, label?: string) {
  const encodedLabel = encodeURIComponent(label || 'Shared Location');
  return `https://maps.google.com/maps?q=${lat},${lng}(${encodedLabel})`;
}

export function LocationBubble({
  latitude,
  longitude,
  address,
  placeName,
  isOwn,
  compact = false,
}: LocationBubbleProps) {
  const mapPreviewUrl = getStaticMapUrl(latitude, longitude);
  const mapsUrl = getMapsUrl(latitude, longitude, placeName || address);

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'block rounded-xl overflow-hidden transition-transform hover:scale-[1.01] cursor-pointer',
        compact ? 'max-w-[180px]' : 'max-w-[220px]'
      )}
    >
      {/* Map Preview */}
      <div className={cn(
        'relative bg-muted/40',
        compact ? 'h-[80px]' : 'h-[100px]'
      )}>
        <img
          src={mapPreviewUrl}
          alt="Location map"
          className="w-full h-full object-cover"
        />
        {/* Pin overlay */}
        <div className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-6 h-6 rounded-full flex items-center justify-center',
          'shadow-lg',
          isOwn ? 'bg-primary' : 'bg-foreground'
        )}>
          <MapPin className={cn(
            'w-3.5 h-3.5',
            isOwn ? 'text-white' : 'text-background'
          )} />
        </div>
      </div>

      {/* Location Info */}
      <div className={cn(
        'flex items-center gap-2',
        compact ? 'px-2 py-1.5' : 'px-3 py-2',
        isOwn ? 'bg-primary text-white' : 'bg-sidebar border-x border-b border-border/30'
      )}>
        <div className="flex-1 min-w-0">
          {placeName && (
            <p className={cn(
              'font-semibold truncate',
              compact ? 'text-caption1' : 'text-subhead',
              isOwn ? 'text-white' : 'text-foreground'
            )}>
              {placeName}
            </p>
          )}
          {address && (
            <p className={cn(
              'truncate',
              compact ? 'text-[10px]' : 'text-caption1',
              isOwn ? 'text-white/80' : 'text-muted-foreground'
            )}>
              {address}
            </p>
          )}
          {!placeName && !address && (
            <p className={cn(
              compact ? 'text-[10px]' : 'text-caption1',
              isOwn ? 'text-white/80' : 'text-muted-foreground'
            )}>
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          )}
        </div>
        <ExternalLink className={cn(
          'flex-shrink-0',
          compact ? 'w-3 h-3' : 'w-3.5 h-3.5',
          isOwn ? 'text-white/60' : 'text-muted-foreground/60'
        )} />
      </div>
    </a>
  );
}
