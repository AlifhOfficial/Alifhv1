'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapUpdaterProps {
  latitude: number;
  longitude: number;
}

export function MapUpdater({ latitude, longitude }: MapUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    if (latitude && longitude) {
      map.flyTo([latitude, longitude], map.getZoom(), {
        duration: 0.5,
      });
    }
  }, [map, latitude, longitude]);

  return null;
}
