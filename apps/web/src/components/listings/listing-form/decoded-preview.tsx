'use client';

import { CheckCircle2 } from 'lucide-react';
import type { ListingFormData } from './types';

interface DecodedVehiclePreviewProps {
  data: Partial<ListingFormData>;
  isVisible: boolean;
}

export function DecodedVehiclePreview({ data, isVisible }: DecodedVehiclePreviewProps) {
  if (!isVisible || !data.make) return null;
  
  // Collect all decoded fields to display
  const decodedFields = [
    { label: 'Trim', value: data.trim },
    { label: 'Body Type', value: data.bodyType },
    { label: 'Doors', value: data.doors },
    { label: 'Fuel Type', value: data.fuelType },
    { label: 'Transmission', value: data.transmission },
    { label: 'Engine Size', value: data.engineSize },
    { label: 'Engine Type', value: data.engineType },
    { label: 'Cylinders', value: data.cylinders },
  ].filter(f => f.value);
  
  return (
    <div className="mt-5 p-6 bg-background border border-border/50 rounded-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border/20">
        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-green-600">
            {data.model ? 'Vehicle Identified' : 'Partial Match'}
          </p>
          {!data.model && (
            <p className="text-[12px] text-muted-foreground/60">Select model below to continue</p>
          )}
        </div>
      </div>
      
      {/* Vehicle Title */}
      <h3 className="text-[18px] font-bold tracking-tight mt-4 mb-4">
        {data.year} {data.make} {data.model || ''}
      </h3>
      
      {/* Decoded Specs Grid */}
      {decodedFields.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {decodedFields.map(({ label, value }) => (
            <div key={label} className="space-y-1">
              <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider">{label}</p>
              <p className="text-[15px] font-semibold capitalize text-foreground">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
