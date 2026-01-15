'use client';

/**
 * Details Step - Clean Style with Color Accents
 * 
 * Larger typography, colored toggle pills.
 * Primary for selected states.
 */

import { useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils';
import { Combobox } from '../combobox';
import {
  BODY_TYPES,
  DOORS_OPTIONS,
  ENGINE_SIZES,
  ENGINE_TYPES,
  EXTERIOR_COLORS,
  EXPORT_STATUSES,
  FUEL_TYPES,
  INTERIOR_COLORS,
  LISTING_TAGS,
  POWER_RANGES,
  SEATING_OPTIONS,
  SPECS_TYPES,
  STEERING_SIDES,
  TRANSMISSION_TYPES,
  VEHICLE_EXTRAS,
  WARRANTY_TYPES,
  MAX_LISTING_TAGS,
} from '../constants';
import type { ListingFormData } from '../types';
import type { StepProps } from './types';

// ============================================================================
// Shared Components
// ============================================================================

function SectionHeader({ title, optional }: { title: string; optional?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <h3 className="text-[15px] font-bold tracking-tight text-foreground">{title}</h3>
      {optional && <span className="text-xs text-muted-foreground/70">Optional</span>}
    </div>
  );
}

function FieldWrapper({ 
  label, 
  required, 
  error, 
  children 
}: { 
  label: string; 
  required?: boolean; 
  error?: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-muted-foreground/70">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs font-semibold text-red-500">{error}</p>
      )}
    </div>
  );
}

function TogglePill({
  label,
  pressed,
  onClick,
  disabled,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200',
        pressed
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground',
        disabled && 'opacity-40 cursor-not-allowed hover:bg-muted/30 hover:text-muted-foreground'
      )}
    >
      {pressed && <CheckCircle2 className="w-4 h-4" />}
      {label}
    </button>
  );
}

// ============================================================================
// Details Step Component
// ============================================================================

export function DetailsStep({ data, updateField, errors }: StepProps) {
  const specsOptions = useMemo(
    () => SPECS_TYPES.map((o) => ({ value: o.value, label: o.label })),
    []
  );
  const steeringOptions = useMemo(
    () => STEERING_SIDES.map((o) => ({ value: o.value, label: o.label })),
    []
  );

  const bodyTypeOptions = useMemo(
    () => BODY_TYPES.map((o) => ({ value: o.value, label: o.label })),
    []
  );
  const exteriorColorOptions = useMemo(
    () => EXTERIOR_COLORS.map((o) => ({ value: o.value, label: o.label })),
    []
  );
  const interiorColorOptions = useMemo(
    () => INTERIOR_COLORS.map((o) => ({ value: o.value, label: o.label })),
    []
  );
  const doorsOptions = useMemo(
    () => DOORS_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
    []
  );
  const seatingOptions = useMemo(
    () => SEATING_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
    []
  );

  const fuelOptions = useMemo(
    () => FUEL_TYPES.map((o) => ({ value: o.value, label: o.label })),
    []
  );
  const transmissionOptions = useMemo(
    () => TRANSMISSION_TYPES.map((o) => ({ value: o.value, label: o.label })),
    []
  );
  const engineSizeOptions = useMemo(
    () => ENGINE_SIZES.map((o) => ({ value: o.value, label: o.label })),
    []
  );
  const engineTypeOptions = useMemo(
    () => ENGINE_TYPES.map((o) => ({ value: o.value, label: o.label })),
    []
  );
  const powerOptions = useMemo(
    () => POWER_RANGES.map((o) => ({ value: o.value, label: o.label })),
    []
  );

  const exportOptions = useMemo(
    () => EXPORT_STATUSES.map((o) => ({ value: o.value, label: o.label })),
    []
  );
  const warrantyOptions = useMemo(
    () => WARRANTY_TYPES.map((o) => ({ value: o.value, label: o.label })),
    []
  );

  const selectedExtras: ListingFormData['extras'] = data.extras ?? [];
  const selectedTags: ListingFormData['tags'] = data.tags ?? [];

  const setRequiredEnum = <K extends keyof ListingFormData>(field: K, value: string) => {
    updateField(field, value as ListingFormData[K]);
  };

  const setOptionalEnum = <K extends keyof ListingFormData>(field: K, value: string) => {
    updateField(field, (value ? (value as ListingFormData[K]) : (null as ListingFormData[K])));
  };

  return (
    <div className="space-y-8">
      {/* Essentials */}
      <section>
        <SectionHeader title="Essentials" />
        
        <div className="rounded-xl border border-border/40 bg-sidebar p-5 mt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FieldWrapper label="Mileage" required error={errors.mileage}>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                value={data.mileage ?? ''}
                onChange={(e) => updateField('mileage', parseInt(e.target.value || '0', 10) || 0)}
                placeholder="45,000"
                min={0}
                className={cn(
                  "w-full h-12 bg-transparent border-b-2 border-border/40 focus:border-primary",
                  "outline-none transition-colors px-0 pr-12 text-sm font-medium",
                  "placeholder:text-muted-foreground/40"
                )}
              />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/70">
                km
              </span>
            </div>
          </FieldWrapper>

          <FieldWrapper label="Regional Specs" required error={errors.specs}>
            <Combobox
              options={specsOptions}
              value={data.specs || ''}
              onValueChange={(v) => setRequiredEnum('specs', v)}
              placeholder="Select specs"
              searchPlaceholder="Search..."
            />
          </FieldWrapper>

          <FieldWrapper label="Steering" required error={errors.steeringSide}>
            <Combobox
              options={steeringOptions}
              value={data.steeringSide || ''}
              onValueChange={(v) => setRequiredEnum('steeringSide', v)}
              placeholder="Select steering"
            />
          </FieldWrapper>
        </div>
      </div>
      </section>
     

      {/* Appearance */}
      <section>
        <SectionHeader title="Appearance" optional />
        
        <div className="rounded-xl border border-border/40 bg-sidebar p-5 mt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FieldWrapper label="Body Type">
            <Combobox
              options={bodyTypeOptions}
              value={data.bodyType || ''}
              onValueChange={(v) => setOptionalEnum('bodyType', v)}
              placeholder="Select body type"
            />
          </FieldWrapper>

          <FieldWrapper label="Exterior Color">
            <Combobox
              options={exteriorColorOptions}
              value={data.exteriorColor || ''}
              onValueChange={(v) => setOptionalEnum('exteriorColor', v)}
              placeholder="Select color"
            />
          </FieldWrapper>

          <FieldWrapper label="Interior Color">
            <Combobox
              options={interiorColorOptions}
              value={data.interiorColor || ''}
              onValueChange={(v) => setOptionalEnum('interiorColor', v)}
              placeholder="Select color"
            />
          </FieldWrapper>

          <FieldWrapper label="Doors">
            <Combobox
              options={doorsOptions}
              value={data.doors || ''}
              onValueChange={(v) => setOptionalEnum('doors', v)}
              placeholder="Select doors"
            />
          </FieldWrapper>

          <FieldWrapper label="Seating">
            <Combobox
              options={seatingOptions}
              value={data.seatingCapacity || ''}
              onValueChange={(v) => setOptionalEnum('seatingCapacity', v)}
              placeholder="Select seating"
            />
          </FieldWrapper>
          </div>
        </div>
      </section>

      {/* Powertrain */}
      <section>
        <SectionHeader title="Powertrain" optional />
        
        <div className="rounded-xl border border-border/40 bg-sidebar p-5 mt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FieldWrapper label="Fuel Type">
            <Combobox
              options={fuelOptions}
              value={data.fuelType || ''}
              onValueChange={(v) => setOptionalEnum('fuelType', v)}
              placeholder="Select fuel type"
            />
          </FieldWrapper>

          <FieldWrapper label="Transmission">
            <Combobox
              options={transmissionOptions}
              value={data.transmission || ''}
              onValueChange={(v) => setOptionalEnum('transmission', v)}
              placeholder="Select transmission"
            />
          </FieldWrapper>

          <FieldWrapper label="Engine Size">
            <Combobox
              options={engineSizeOptions}
              value={data.engineSize || ''}
              onValueChange={(v) => setOptionalEnum('engineSize', v)}
              placeholder="Select engine size"
            />
          </FieldWrapper>

          <FieldWrapper label="Engine Type">
            <Combobox
              options={engineTypeOptions}
              value={data.engineType || ''}
              onValueChange={(v) => setOptionalEnum('engineType', v)}
              placeholder="Select engine type"
            />
          </FieldWrapper>

          <FieldWrapper label="Cylinders" error={errors.cylinders}>
            <input
              type="number"
              inputMode="numeric"
              value={data.cylinders ?? ''}
              onChange={(e) => {
                const next = e.target.value ? parseInt(e.target.value, 10) : null;
                updateField('cylinders', next);
              }}
              placeholder="4"
              min={0}
              max={16}
              className={cn(
                "w-full h-12 bg-transparent border-b-2 border-border/40 focus:border-primary",
                "outline-none transition-colors px-0 text-sm font-medium",
                "placeholder:text-muted-foreground/40"
              )}
            />
          </FieldWrapper>

          <FieldWrapper label="Power">
            <Combobox
              options={powerOptions}
              value={data.powerRange || ''}
              onValueChange={(v) => setOptionalEnum('powerRange', v)}
              placeholder="Select power range"
            />
          </FieldWrapper>

          <FieldWrapper label="Fuel Economy">
            <input
              type="text"
              value={data.fuelEconomy || ''}
              onChange={(e) => updateField('fuelEconomy', e.target.value)}
              placeholder="12 km/L"
              className={cn(
                "w-full h-12 bg-transparent border-b-2 border-border/40 focus:border-primary",
                "outline-none transition-colors px-0 text-sm font-medium",
                "placeholder:text-muted-foreground/40"
              )}
            />
          </FieldWrapper>

          <FieldWrapper label="Torque">
            <input
              type="text"
              value={data.torque || ''}
              onChange={(e) => updateField('torque', e.target.value)}
              placeholder="350 Nm"
              className={cn(
                "w-full h-12 bg-transparent border-b-2 border-border/40 focus:border-primary",
                "outline-none transition-colors px-0 text-sm font-medium",
                "placeholder:text-muted-foreground/40"
              )}
            />
          </FieldWrapper>
          </div>
        </div>
      </section>

      {/* Status */}
      <section>
        <SectionHeader title="Status" optional />
        
        <div className="rounded-xl border border-border/40 bg-sidebar p-5 mt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FieldWrapper label="Warranty">
            <Combobox
              options={warrantyOptions}
              value={data.warrantyType || ''}
              onValueChange={(v) => setOptionalEnum('warrantyType', v)}
              placeholder="Select warranty"
            />
          </FieldWrapper>

          <FieldWrapper label="Export">
            <Combobox
              options={exportOptions}
              value={data.exportStatus || ''}
              onValueChange={(v) => setRequiredEnum('exportStatus', v)}
              placeholder="Select export status"
            />
          </FieldWrapper>
          </div>
        </div>
      </section>

      {/* Extras */}
      <section>
        <SectionHeader title="Extras" optional />
        
        <div className="rounded-xl border border-border/40 bg-sidebar p-5 mt-3">
          <div className="flex flex-wrap gap-3">
          {VEHICLE_EXTRAS.map((extra) => {
            const isSelected = selectedExtras.includes(extra.value);
            return (
              <button
                key={extra.value}
                onClick={() => {
                  const next = isSelected
                    ? selectedExtras.filter((v) => v !== extra.value)
                    : [...selectedExtras, extra.value];
                  updateField('extras', next);
                }}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors border",
                  isSelected 
                    ? "bg-muted/40 text-foreground border-border/60" 
                    : "bg-muted/30 text-foreground/90 border-border/40 hover:border-primary/40 hover:bg-muted/40"
                )}
              >
                {isSelected && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {extra.label}
              </button>
            );
          })}
          </div>
        </div>
      </section>

      {/* Tags */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <SectionHeader title="Tags" />
          <span className="text-xs font-semibold text-muted-foreground/70">{MAX_LISTING_TAGS} max</span>
        </div>
        
        <div className="rounded-xl border border-border/40 bg-sidebar p-5">
          <div className="flex flex-wrap gap-3">
          {LISTING_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag.value);
            const disabled = !isSelected && selectedTags.length >= MAX_LISTING_TAGS;

            return (
              <button
                key={tag.value}
                disabled={disabled}
                onClick={() => {
                  if (isSelected) {
                    const next = selectedTags.filter((v) => v !== tag.value);
                    updateField('tags', next);
                  } else {
                    const next = [...selectedTags, tag.value];
                    updateField('tags', next);
                  }
                }}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors border",
                  isSelected 
                    ? "bg-muted/40 text-foreground border-border/60" 
                    : "bg-muted/30 text-foreground/90 border-border/40 hover:border-primary/40 hover:bg-muted/40",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {isSelected && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {tag.label}
              </button>
            );
          })}
          </div>
          {errors.tags && <p className="text-xs font-semibold text-red-500 mt-3">{errors.tags}</p>}
        </div>
      </section>
    </div>
  );
}
