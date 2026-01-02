/**
 * Compare Table - Side-by-side car comparison
 * Neutral, diplomatic highlighting without winner/loser language
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X, ExternalLink } from 'lucide-react';
import { useCompare } from './compare-context';
import { cn } from '@/utils';
import type { CarDetailedData } from '@alifh/database';

// ============================================================================
// Utilities
// ============================================================================

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatMileage = (km: number) => {
  return new Intl.NumberFormat('en-US').format(km) + ' km';
};

const formatEnum = (value: string | null): string => {
  if (!value) return '—';
  return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

// Determines if this value is "notable" compared to others (lower/higher depending on field)
type CompareDirection = 'lower' | 'higher' | 'none';

function getNotable(
  values: (number | null | undefined)[],
  direction: CompareDirection,
  index: number
): boolean {
  if (direction === 'none') return false;
  const numericValues = values.filter((v): v is number => typeof v === 'number');
  if (numericValues.length < 2) return false;
  
  const targetValue = values[index];
  if (typeof targetValue !== 'number') return false;
  
  if (direction === 'lower') {
    return targetValue === Math.min(...numericValues) && numericValues.filter(v => v === targetValue).length === 1;
  } else {
    return targetValue === Math.max(...numericValues) && numericValues.filter(v => v === targetValue).length === 1;
  }
}

// ============================================================================
// Sub-Components
// ============================================================================

interface HeaderRowProps {
  cars: (CarDetailedData | null)[];
  onRemove: (id: string) => void;
}

function HeaderRow({ cars, onRemove }: HeaderRowProps) {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
      <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${cars.length}, 1fr)` }}>
        {/* Car columns */}
        {cars.map((car, i) => (
          <div 
            key={car?.id || i} 
            className="relative rounded-xl border border-border/30 bg-card overflow-hidden"
          >
            {car ? (
              <>
                {/* Image */}
                <div className="relative aspect-[16/10] bg-muted/20">
                  <Image
                    src={car.images[0] || '/assets/cars/placeholder.avif'}
                    alt={`${car.year} ${car.make} ${car.model}`}
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                  {/* Remove button */}
                  <button
                    onClick={() => onRemove(car.id)}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
                    aria-label="Remove from comparison"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                
                {/* Info */}
                <div className="p-4 space-y-2">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{car.year}</p>
                    <h3 className="text-sm font-semibold tracking-tight leading-snug">
                      {car.make} {car.model}
                      {car.trim && <span className="font-normal text-muted-foreground"> {car.trim}</span>}
                    </h3>
                  </div>
                  <p className="text-base font-bold tabular-nums">{formatPrice(car.price)}</p>
                  <Link
                    href={`/listings/${car.slug || car.id}`}
                    className="inline-flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    View listing <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="animate-pulse">
                <div className="aspect-[16/10] bg-muted/40" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-muted/40 rounded w-1/4" />
                  <div className="h-4 bg-muted/40 rounded w-3/4" />
                  <div className="h-5 bg-muted/40 rounded w-1/2" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface SpecRowProps {
  label: string;
  values: (string | number | null | undefined)[];
  highlight?: CompareDirection;
  format?: (value: string | number | null | undefined) => string;
}

function SpecRow({ label, values, highlight = 'none', format }: SpecRowProps) {
  const numericValues = values.map(v => typeof v === 'number' ? v : null);
  
  return (
    <div 
      className="grid items-center gap-4 px-4 py-2.5 border-b border-border/10 hover:bg-muted/5 transition-colors"
      style={{ gridTemplateColumns: `140px repeat(${values.length}, 1fr)` }}
    >
      {/* Label */}
      <div className="text-xs text-muted-foreground/70">
        {label}
      </div>
      
      {/* Values */}
      {values.map((value, i) => {
        const isNotable = highlight !== 'none' && getNotable(numericValues, highlight, i);
        const displayValue = format ? format(value) : (value?.toString() || '—');
        
        return (
          <div 
            key={i}
            className={cn(
              "text-sm font-medium",
              isNotable && "text-green-600 dark:text-green-400",
              !value && value !== 0 && "text-muted-foreground/40"
            )}
          >
            {displayValue}
          </div>
        );
      })}
    </div>
  );
}

interface SpecSectionProps {
  title: string;
  children: React.ReactNode;
}

function SpecSection({ title, children }: SpecSectionProps) {
  return (
    <div className="py-2">
      <div className="px-4 py-2">
        <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
          {title}
        </span>
      </div>
      <div className="rounded-lg border border-border/20 mx-2 overflow-hidden bg-card/50">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function CompareTable() {
  const { items, removeCar } = useCompare();
  
  const cars = items.map(item => item.data);
  const allLoaded = cars.every(car => car !== null);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border/30 overflow-hidden bg-background">
      {/* Sticky Header with Car Cards */}
      <HeaderRow cars={cars} onRemove={removeCar} />

      {/* Spec Rows */}
      {allLoaded && (
        <div className="space-y-2 pb-4">
          {/* Key Metrics */}
          <SpecSection title="Key Metrics">
            <SpecRow
              label="Price"
              values={cars.map(c => c?.price)}
              highlight="lower"
              format={v => typeof v === 'number' ? formatPrice(v) : '—'}
            />
            <SpecRow
              label="Mileage"
              values={cars.map(c => c?.mileage)}
              highlight="lower"
              format={v => typeof v === 'number' ? formatMileage(v) : '—'}
            />
            <SpecRow
              label="Year"
              values={cars.map(c => c?.year)}
              highlight="higher"
              format={v => v?.toString() || '—'}
            />
          </SpecSection>

          {/* Engine & Performance */}
          <SpecSection title="Engine & Performance">
            <SpecRow
              label="Engine Size"
              values={cars.map(c => formatEnum(c?.engineSize || null))}
            />
            <SpecRow
              label="Cylinders"
              values={cars.map(c => c?.cylinders)}
              highlight="higher"
              format={v => v?.toString() || '—'}
            />
            <SpecRow
              label="Power"
              values={cars.map(c => formatEnum(c?.powerRange || null))}
            />
            <SpecRow
              label="Torque"
              values={cars.map(c => c?.torque || '—')}
            />
            <SpecRow
              label="Transmission"
              values={cars.map(c => formatEnum(c?.transmission || null))}
            />
            <SpecRow
              label="Fuel Type"
              values={cars.map(c => formatEnum(c?.fuelType || null))}
            />
            <SpecRow
              label="Fuel Economy"
              values={cars.map(c => c?.fuelEconomy || '—')}
            />
          </SpecSection>

          {/* Body & Design */}
          <SpecSection title="Body & Design">
            <SpecRow
              label="Body Type"
              values={cars.map(c => formatEnum(c?.bodyType || null))}
            />
            <SpecRow
              label="Doors"
              values={cars.map(c => c?.doors)}
              format={v => v?.toString() || '—'}
            />
            <SpecRow
              label="Seating"
              values={cars.map(c => c?.seatingCapacity)}
              format={v => v ? `${v} seats` : '—'}
            />
            <SpecRow
              label="Exterior Color"
              values={cars.map(c => formatEnum(c?.exteriorColor || null))}
            />
            <SpecRow
              label="Interior Color"
              values={cars.map(c => formatEnum(c?.interiorColor || null))}
            />
          </SpecSection>

          {/* Specifications */}
          <SpecSection title="Specifications">
            <SpecRow
              label="Regional Specs"
              values={cars.map(c => formatEnum(c?.specs || null))}
            />
            <SpecRow
              label="Steering Side"
              values={cars.map(c => formatEnum(c?.steeringSide || null))}
            />
            <SpecRow
              label="Engine Type"
              values={cars.map(c => formatEnum(c?.engineType || null))}
            />
          </SpecSection>

          {/* Condition & Seller */}
          <SpecSection title="Condition & Seller">
            <SpecRow
              label="Warranty"
              values={cars.map(c => formatEnum(c?.warrantyType || null))}
            />
            <SpecRow
              label="Seller Type"
              values={cars.map(c => formatEnum(c?.sellerType || null))}
            />
            <SpecRow
              label="Export Status"
              values={cars.map(c => formatEnum(c?.exportStatus || null))}
            />
            <SpecRow
              label="Location"
              values={cars.map(c => c?.city ? `${c.city}, ${formatEnum(c.emirate)}` : formatEnum(c?.emirate || null))}
            />
          </SpecSection>

          {/* Features Count */}
          <SpecSection title="Features">
            <SpecRow
              label="Feature Count"
              values={cars.map(c => c?.extras?.length || 0)}
              highlight="higher"
              format={v => typeof v === 'number' ? `${v} features` : '—'}
            />
          </SpecSection>
        </div>
      )}
    </div>
  );
}
