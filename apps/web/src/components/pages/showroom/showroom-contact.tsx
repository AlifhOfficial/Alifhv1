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
  const hasSocials = showroom.instagramHandle || showroom.youtubeChannelUrl || showroom.linkedinUrl || showroom.tiktokHandle;

  // Build address from partner data
  const addressParts = [
    showroom.showroomAddress,
    partner?.city,
    partner?.emirate
  ].filter(Boolean);
  const fullAddress = addressParts.join(', ');

  const mapUrl = partner?.locationLat && partner?.locationLng 
    ? `https://www.google.com/maps/search/?api=1&query=${partner.locationLat},${partner.locationLng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  const hasLocation = (partner?.locationLat && partner?.locationLng) || fullAddress;

  return (
    <section id="showroom-contact" className={`${theme.sectionSpacing} overflow-hidden`}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <p className={`text-xs uppercase tracking-widest ${theme.labelClass} text-muted-foreground mb-2 sm:mb-3`}>
            Contact
          </p>
          <h2 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl ${theme.headingClass} text-foreground tracking-tight leading-tight`}>
            {showroom.appointmentCtaText || 'Get in Touch'}
          </h2>
        </div>

        {/* Main Content - Map + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 mb-8 sm:mb-10">
          
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
                className="group p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-sidebar border border-sidebar-border hover:border-sidebar-accent/50 transition-colors flex items-start gap-3 sm:gap-4 flex-1"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-sidebar-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-sidebar-accent/20 transition-colors">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-sidebar-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm ${theme.subheadingClass} text-sidebar-foreground mb-1`}>
                    Location
                  </h3>
                  <p className="text-xs sm:text-sm text-sidebar-foreground/60 leading-relaxed break-words">
                    {fullAddress}
                  </p>
                  <p className="text-xs text-sidebar-foreground/40 mt-2 group-hover:text-sidebar-foreground/60 transition-colors">
                    View on Map →
                  </p>
                </div>
              </a>
            )}
            
            {/* Phone Card */}
            {partner?.phone && (
              <a 
                href={`tel:${partner.phone}`}
                className="group p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-sidebar border border-sidebar-border hover:border-sidebar-accent/50 transition-colors flex items-start gap-3 sm:gap-4 flex-1"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-sidebar-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-sidebar-accent/20 transition-colors">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-sidebar-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm ${theme.subheadingClass} text-sidebar-foreground mb-1`}>
                    Phone
                  </h3>
                  <p className="text-xs sm:text-sm text-sidebar-foreground/60 leading-relaxed">
                    {partner.phone}
                  </p>
                  <p className="text-xs text-sidebar-foreground/40 mt-2 group-hover:text-sidebar-foreground/60 transition-colors">
                    Call Now →
                  </p>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* Social Links */}
        {hasSocials && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 overflow-hidden">
            <span className={`text-xs uppercase tracking-widest ${theme.labelClass} text-muted-foreground mr-1 sm:mr-2 flex-shrink-0`}>
              Follow
            </span>
            {showroom.instagramHandle && (
              <a
                href={`https://instagram.com/${showroom.instagramHandle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 sm:h-10 px-3 sm:px-4 rounded-full bg-sidebar border border-sidebar-border flex items-center gap-1.5 sm:gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:border-sidebar-accent/50 transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon />
                <span className="text-xs sm:text-sm hidden sm:inline">Instagram</span>
              </a>
            )}
            {showroom.youtubeChannelUrl && (
              <a
                href={showroom.youtubeChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 sm:h-10 px-3 sm:px-4 rounded-full bg-sidebar border border-sidebar-border flex items-center gap-1.5 sm:gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:border-sidebar-accent/50 transition-colors"
                aria-label="YouTube"
              >
                <YouTubeIcon />
                <span className="text-xs sm:text-sm hidden sm:inline">YouTube</span>
              </a>
            )}
            {showroom.linkedinUrl && (
              <a
                href={showroom.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 sm:h-10 px-3 sm:px-4 rounded-full bg-sidebar border border-sidebar-border flex items-center gap-1.5 sm:gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:border-sidebar-accent/50 transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedInIcon />
                <span className="text-xs sm:text-sm hidden sm:inline">LinkedIn</span>
              </a>
            )}
            {showroom.tiktokHandle && (
              <a
                href={`https://tiktok.com/${showroom.tiktokHandle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 sm:h-10 px-3 sm:px-4 rounded-full bg-sidebar border border-sidebar-border flex items-center gap-1.5 sm:gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:border-sidebar-accent/50 transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon />
                <span className="text-xs sm:text-sm hidden sm:inline">TikTok</span>
              </a>
            )}
          </div>
        )}

      </div>
    </section>
  );
}

// ============================================================================
// Social Icons
// ============================================================================

function InstagramIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
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
