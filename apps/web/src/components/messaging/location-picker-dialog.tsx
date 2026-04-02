/**
 * Location Picker Dialog - Web
 * Shows current location preview with confirm/cancel
 * Option to refresh location if not accurate
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { MapPin, RefreshCw, X, Send, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useLocation, type LocationResult } from '@/hooks/use-location';

interface LocationPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (location: LocationResult) => Promise<void>;
}

// Static map tile URL
function getStaticMapUrl(lat: number, lng: number, zoom = 15) {
  const latRad = (lat * Math.PI) / 180;
  const n = Math.pow(2, zoom);
  const xTile = Math.floor(((lng + 180) / 360) * n);
  const yTile = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return `https://tile.openstreetmap.org/${zoom}/${xTile}/${yTile}.png`;
}

export function LocationPickerDialog({
  isOpen,
  onClose,
  onConfirm,
}: LocationPickerDialogProps) {
  const { isLoading, error, getCurrentLocation } = useLocation();
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleRefreshLocation = useCallback(async () => {
    const result = await getCurrentLocation();
    if (result) {
      setLocation(result);
    }
  }, [getCurrentLocation]);

  // Fetch location when dialog opens
  useEffect(() => {
    if (isOpen && !location && !isLoading) {
      handleRefreshLocation();
    }
  }, [isOpen, location, isLoading, handleRefreshLocation]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setLocation(null);
      setIsSending(false);
    }
  }, [isOpen]);

  const handleConfirm = useCallback(async () => {
    if (!location) return;
    setIsSending(true);
    try {
      await onConfirm(location);
      onClose();
    } catch (err) {
      console.error('[LocationPickerDialog] Send failed:', err);
    } finally {
      setIsSending(false);
    }
  }, [location, onConfirm, onClose]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const mapPreviewUrl = location
    ? getStaticMapUrl(location.latitude, location.longitude)
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <div>
              <h3 className="font-bold text-foreground">Share Location</h3>
              <p className="text-xs text-muted-foreground">Send your current location</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Map Preview */}
          <div className="relative h-40 bg-muted">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">Getting your location...</p>
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <MapPin className="w-10 h-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mt-2 text-center">{error}</p>
                <button
                  onClick={handleRefreshLocation}
                  className="mt-3 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : mapPreviewUrl ? (
              <>
                <img
                  src={mapPreviewUrl}
                  alt="Location map"
                  className="w-full h-full object-cover"
                />
                {/* Pin overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Location Info */}
          {location && (
            <div className="flex items-center gap-3 px-4 py-3 bg-sidebar border-y border-border/50">
              <div className="flex-1 min-w-0">
                {location.placeName && (
                  <p className="font-semibold text-foreground truncate">
                    {location.placeName}
                  </p>
                )}
                {location.address ? (
                  <p className="text-sm text-muted-foreground truncate">
                    {location.address}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                )}
              </div>
              <button
                onClick={handleRefreshLocation}
                disabled={isLoading}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'
                )}
                title="Refresh location"
              >
                <RefreshCw className={cn('w-4 h-4 text-muted-foreground', isLoading && 'animate-spin')} />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 px-4 py-4">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-muted text-foreground font-medium rounded-xl hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!location || isSending}
              className={cn(
                'flex-[2] py-2.5 px-4 font-medium rounded-xl transition-colors flex items-center justify-center gap-2',
                location && !isSending
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Location
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
