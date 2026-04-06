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
    <section className="pt-8 border-t border-border/20 space-y-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-foreground mt-0.5" />
        <div className="min-w-0">
          <p className="text-subhead font-semibold tracking-tight">
            {data.model ? 'Vehicle identified' : 'Partial match'}
          </p>
          <p className="text-footnote text-muted-foreground/70">
            {data.model
              ? `${data.year} ${data.make} ${data.model}`
              : `${data.year} ${data.make} — select model below to continue`}
          </p>
        </div>
      </div>

      {decodedFields.length > 0 && (
        <div className="grid grid-cols-2 regular:grid-cols-4 gap-4 pt-2">
          {decodedFields.map(({ label, value }) => (
            <div key={label} className="space-y-1">
              <p className="text-caption2 text-muted-foreground/50 uppercase tracking-wider">{label}</p>
              <p className="text-subhead font-semibold capitalize text-foreground">{value}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
