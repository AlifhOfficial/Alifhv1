/**
 * Location Section Component - Alifh Design System
 * 
 * Clean, minimal location display following "Less is More" principle.
 */

'use client';

import { MapPin, ExternalLink, Navigation } from 'lucide-react';
import { cn } from '@/utils';
import type { SellerData } from '@/hooks/listings';

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

  const locationParts = [locationData.city, locationData.emirate].filter(Boolean);
  const locationString = locationParts.join(', ');

  const mapsSearchUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${locationData.lat},${locationData.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationData.address || locationString)}`;
  
  const directionsUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${locationData.lat},${locationData.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationData.address || locationString)}`;

  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-[13px] uppercase tracking-wider font-semibold text-muted-foreground">
        Location
      </p>

      {/* Address Display */}
      <div className="flex items-start gap-2.5">
        <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          {sellerData.type === 'partner' && locationData.address && (
            <p className="text-sm sm:text-[15px] font-semibold text-foreground">{locationData.address}</p>
          )}
          {locationString && (
            <p className={cn(
              sellerData.type === 'partner' && locationData.address
                ? "text-sm text-muted-foreground font-medium"
                : "text-sm sm:text-[15px] font-semibold text-foreground"
            )}>
              {locationString}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <a
          href={mapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-[120px] py-2.5 px-4 text-sm font-semibold text-foreground border border-border rounded-full hover:bg-muted/50 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <ExternalLink className="w-4 h-4" />
          View Map
        </a>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-[120px] py-2.5 px-4 text-sm font-semibold text-foreground border border-border rounded-full hover:bg-muted/50 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Navigation className="w-4 h-4" />
          Directions
        </a>
      </div>
    </div>
  );
}
