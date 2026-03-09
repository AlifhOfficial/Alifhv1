/**
 * Showroom Contact
 * Left-aligned header, horizontal contact cards, prominent socials.
 */

'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { ShowroomData } from './types';
import { getAmbientTheme } from './types';

interface ShowroomContactProps {
  showroom: ShowroomData;
}

export function ShowroomContact({ showroom }: ShowroomContactProps) {
  const partner = showroom.partner;
  const theme = getAmbientTheme(showroom.ambientStyle);

  // Build address from partner data
  const addressParts = [
    showroom.showroomAddress,
    partner?.city,
    partner?.emirate
  ].filter(Boolean);
  const fullAddress = addressParts.join(', ');
  
  // Contact priority: tollNumber > adminPhone > registered phone
  const displayPhone = partner?.tollNumber || partner?.adminPhone || partner?.phone;

  const mapUrl = partner?.locationLat && partner?.locationLng 
    ? `https://www.google.com/maps/search/?api=1&query=${partner.locationLat},${partner.locationLng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  const hasLocation = (partner?.locationLat && partner?.locationLng) || fullAddress;

  return (
    <section id="showroom-contact" className={`${theme.sectionSpacing} overflow-hidden`}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary mb-4 block">
            Contact
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            {showroom.appointmentCtaText || 'Get in Touch'}
          </h2>
        </div>

        {/* Main Content - Map + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 mb-6">
          
          {/* Map - Takes more space */}
          {hasLocation && (
            <div className="lg:col-span-3 order-2 lg:order-1">
              <LeafletMap 
                lat={partner?.locationLat || 25.2048} 
                lng={partner?.locationLng || 55.2708}
                markerTitle={partner?.brandName || 'Showroom'}
              />
            </div>
          )}
          
          {/* Contact Info Cards - Stacked */}
          <div className={`${hasLocation ? 'lg:col-span-2' : 'lg:col-span-5'} flex flex-col gap-3 sm:gap-4 order-1 lg:order-2`}>
            
            {/* Location Card */}
            {fullAddress && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 sm:p-6 rounded-xl bg-sidebar border border-border/40 hover:border-primary/30 transition-colors flex items-start gap-3 sm:gap-4 flex-1"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    Location
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed break-words">
                    {fullAddress}
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-2 group-hover:text-primary transition-colors">
                    View on Map →
                  </p>
                </div>
              </a>
            )}
            
            {/* Phone Card */}
            {displayPhone && (
              <a 
                href={`tel:${displayPhone}`}
                className="group p-4 sm:p-6 rounded-xl bg-sidebar border border-border/40 hover:border-primary/30 transition-colors flex items-start gap-3 sm:gap-4 flex-1"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    Phone
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {displayPhone}
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-2 group-hover:text-primary transition-colors">
                    Call Now →
                  </p>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* Description - Below Map/Cards */}
        <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
          We're here when you're ready.
        </p>

      </div>
    </section>
  );
}

// ============================================================================
// Leaflet Map Component
// ============================================================================

interface LeafletMapProps {
  lat: number;
  lng: number;
  markerTitle: string;
}

function LeafletMap({ lat, lng, markerTitle }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically load Leaflet
    const loadLeaflet = async () => {
      // Add Leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      const L = (await import('leaflet')).default;

      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Initialize map
      const map = L.map(mapRef.current!, {
        scrollWheelZoom: false,
      }).setView([lat, lng], 15);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Add marker
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(markerTitle);

      mapInstanceRef.current = map;
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, markerTitle]);

  return (
    <div 
      ref={mapRef} 
      className="relative aspect-[4/3] sm:aspect-video lg:aspect-[21/9] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-muted z-0"
    />
  );
}

// Skeleton
function ShowroomContactSkeleton() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <Skeleton className="h-3 w-20 mx-auto mb-4" />
          <Skeleton className="h-8 w-40 mx-auto" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="aspect-[4/3] sm:aspect-video lg:aspect-[21/9] rounded-xl" />
      </div>
    </section>
  );
}
ShowroomContact.Skeleton = ShowroomContactSkeleton;
