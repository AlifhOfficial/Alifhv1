/**
 * Location Section Component
 * 
 * Displays seller location on the listing detail page sidebar.
 * Shows a static map preview and address for partner showrooms or user location.
 */

'use client';

import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { cn } from '@/utils';
import type { SellerData } from './listing-detail-view';

interface LocationSectionProps {
  sellerData: SellerData;
  className?: string;
}

export function LocationSection({ sellerData, className }: LocationSectionProps) {
  // Get location data based on seller type
  let locationData: {
    address: string | null;
    city: string | null;
    emirate: string | null;
    lat: number | null;
    lng: number | null;
    name: string;
  };

  if (sellerData.type === 'partner' && sellerData.partner) {
    locationData = {
      address: sellerData.partner.address,
      city: sellerData.partner.city,
      emirate: sellerData.partner.emirate,
      lat: sellerData.partner.locationLat,
      lng: sellerData.partner.locationLng,
      name: sellerData.partner.brandName,
    };
  } else if (sellerData.type === 'user') {
    const profile = sellerData.userProfile;
    const name = profile?.userName ?? 
      [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') ?? 
      'Seller';
    
    locationData = {
      address: null,
      city: profile?.locationCity ?? null,
      emirate: profile?.locationEmirate ?? null,
      lat: profile?.locationLat ?? null,
      lng: profile?.locationLng ?? null,
      name,
    };
  } else {
    return null;
  }

  const hasCoordinates = locationData.lat && locationData.lng;
  const hasLocation = locationData.city || locationData.emirate || locationData.address;

  if (!hasLocation && !hasCoordinates) {
    return null;
  }

  // Build location display string
  const locationParts = [locationData.city, locationData.emirate].filter(Boolean);
  const locationString = locationParts.join(', ');

  // Google Maps URLs
  const mapsSearchUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${locationData.lat},${locationData.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationData.address || locationString)}`;
  
  const directionsUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${locationData.lat},${locationData.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationData.address || locationString)}`;

  // Static map image URL (using OpenStreetMap static tiles for free usage)
  const staticMapUrl = hasCoordinates
    ? `https://staticmap.openstreetmap.de/staticmap.php?center=${locationData.lat},${locationData.lng}&zoom=14&size=400x200&maptype=mapnik&markers=${locationData.lat},${locationData.lng},red-pushpin`
    : null;

  return (
    <div className={cn(
      "p-5 bg-card border border-border/40 rounded-xl space-y-4",
      className
    )}>
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Location
      </h4>

      {/* Map Preview */}
      {staticMapUrl && (
        <a
          href={mapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative aspect-[2/1] w-full rounded-lg overflow-hidden bg-muted/30 hover:opacity-90 transition-opacity"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={staticMapUrl}
            alt={`Map showing ${locationData.name} location`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <MapPin className="w-4 h-4 text-white" />
            </div>
          </div>
        </a>
      )}

      {/* Address Display */}
      <div className="space-y-2">
        {sellerData.type === 'partner' && locationData.address && (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">{locationData.address}</p>
          </div>
        )}
        
        {locationString && (
          <p className={cn(
            "text-sm",
            sellerData.type === 'partner' && locationData.address
              ? "text-muted-foreground pl-6"
              : "text-foreground flex items-center gap-2"
          )}>
            {!(sellerData.type === 'partner' && locationData.address) && (
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
            {locationString}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <a
          href={mapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 px-3 text-xs font-medium text-foreground border border-border rounded-lg hover:bg-muted/30 transition-colors flex items-center justify-center gap-1.5"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View on Map
        </a>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 px-3 text-xs font-medium text-foreground border border-border rounded-lg hover:bg-muted/30 transition-colors flex items-center justify-center gap-1.5"
        >
          <Navigation className="w-3.5 h-3.5" />
          Get Directions
        </a>
      </div>
    </div>
  );
}
