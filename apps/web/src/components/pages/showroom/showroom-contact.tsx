/**
 * Showroom Contact
 * Left-aligned header, horizontal contact cards, prominent socials.
 */

'use client';

import { useEffect, useRef } from 'react';
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
      <div className="max-w-[1600px] mx-auto px-4 compact:px-6 large:px-8">
        
        {/* Header */}
        <div className="mb-6 compact:mb-8">
          <span className="text-subhead font-semibold uppercase tracking-wider text-primary mb-4 block">
            Contact
          </span>
          <h2 className="text-title2 compact:text-title1 large:text-display font-semibold tracking-tight">
            {showroom.appointmentCtaText || 'Get in Touch'}
          </h2>
        </div>

        {/* Main Content - Map + Info */}
        <div className="grid grid-cols-1 large:grid-cols-5 gap-4 compact:gap-6 mb-6">
          
          {/* Map - Takes more space */}
          {hasLocation && (
            <div className="large:col-span-3 order-2 large:order-1">
              <LeafletMap 
                lat={partner?.locationLat || 25.2048} 
                lng={partner?.locationLng || 55.2708}
                markerTitle={partner?.brandName || 'Showroom'}
              />
            </div>
          )}
          
          {/* Contact Info Cards - Stacked */}
          <div className={`${hasLocation ? 'large:col-span-2' : 'large:col-span-5'} flex flex-col gap-3 compact:gap-4 order-1 large:order-2`}>
            
            {/* Location Card */}
            {fullAddress && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 compact:p-6 rounded-xl bg-sidebar border border-border/40 hover:border-primary/30 transition-colors flex items-start gap-3 compact:gap-4 flex-1"
              >
                <div className="w-9 h-9 compact:w-10 compact:h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                  <MapPin className="w-4 h-4 compact:w-5 compact:h-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-callout font-semibold text-foreground mb-1">
                    Location
                  </h3>
                  <p className="text-subhead text-muted-foreground leading-relaxed break-words">
                    {fullAddress}
                  </p>
                  <p className="text-subhead text-muted-foreground/70 mt-2 group-hover:text-primary transition-colors">
                    View on Map →
                  </p>
                </div>
              </a>
            )}
            
            {/* Phone Card */}
            {displayPhone && (
              <a 
                href={`tel:${displayPhone}`}
                className="group p-4 compact:p-6 rounded-xl bg-sidebar border border-border/40 hover:border-primary/30 transition-colors flex items-start gap-3 compact:gap-4 flex-1"
              >
                <div className="w-9 h-9 compact:w-10 compact:h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Phone className="w-4 h-4 compact:w-5 compact:h-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-callout font-semibold text-foreground mb-1">
                    Phone
                  </h3>
                  <p className="text-subhead text-muted-foreground leading-relaxed">
                    {displayPhone}
                  </p>
                  <p className="text-subhead text-muted-foreground/70 mt-2 group-hover:text-primary transition-colors">
                    Call Now →
                  </p>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* Description - Below Map/Cards */}
        <p className="text-callout text-muted-foreground max-w-2xl leading-relaxed">
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

      // Guard against unmounted component (ref may be null after async import)
      if (!mapRef.current) return;

      // Initialize map
      const map = L.map(mapRef.current, {
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
      className="relative aspect-[4/3] compact:aspect-video large:aspect-[21/9] w-full rounded-xl compact:rounded-2xl overflow-hidden bg-muted z-0"
    />
  );
}

// Skeleton
function ShowroomContactSkeleton() {
  return (
    <section className="py-16 compact:py-20 large:py-24">
      <div className="max-w-[1600px] mx-auto px-4 compact:px-6 large:px-8">
        <div className="text-center mb-10">
          <Skeleton className="h-3 w-20 mx-auto mb-4" />
          <Skeleton className="h-8 w-40 mx-auto" />
        </div>
        <div className="grid compact:grid-cols-2 large:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="aspect-[4/3] compact:aspect-video large:aspect-[21/9] rounded-xl" />
      </div>
    </section>
  );
}
ShowroomContact.Skeleton = ShowroomContactSkeleton;
