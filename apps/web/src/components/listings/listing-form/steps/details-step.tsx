'use client';

import { useMemo } from 'react';
import { cn } from '@/utils';
import { Combobox } from '../combobox';
import { FormField } from '../form-field';
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

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="p-6 sm:p-7 bg-background border border-border/50 rounded-2xl">
      <header className="space-y-1.5 mb-6">
        <h3 className="text-[16px] sm:text-[17px] font-semibold tracking-tight">{title}</h3>
        {subtitle && <p className="text-[14px] text-muted-foreground">{subtitle}</p>}
      </header>
      {children}
    </section>
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
        'px-3.5 py-2 rounded-full text-[14px] font-medium border transition-colors',
        pressed
          ? 'bg-foreground text-background border-foreground'
          : 'bg-muted/20 text-foreground border-border/50 hover:bg-muted/30',
        disabled && 'opacity-40 cursor-not-allowed hover:bg-muted/20'
      )}
    >
      {label}
    </button>
  );
}

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
    <div className="space-y-6">
      <Card title="Essentials" subtitle="The basics buyers look for first.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Mileage (km)" required error={errors.mileage}>
            <input
              type="number"
              inputMode="numeric"
              value={data.mileage ?? ''}
              onChange={(e) => updateField('mileage', parseInt(e.target.value || '0', 10) || 0)}
              placeholder="e.g. 45,000"
              min={0}
              className="w-full h-12 bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 hover:bg-muted/10 transition-colors px-4 text-[15px] font-medium placeholder:text-muted-foreground/50"
            />
          </FormField>

          <FormField label="Regional Specs" required error={errors.specs}>
            <Combobox
              options={specsOptions}
              value={data.specs || ''}
              onValueChange={(v) => setRequiredEnum('specs', v)}
              placeholder="Select specs..."
              searchPlaceholder="Search specs..."
            />
          </FormField>

          <FormField label="Steering" required error={errors.steeringSide}>
            <Combobox
              options={steeringOptions}
              value={data.steeringSide || ''}
              onValueChange={(v) => setRequiredEnum('steeringSide', v)}
              placeholder="Select steering..."
            />
          </FormField>
        </div>
      </Card>

      <Card title="Appearance" subtitle="Helps buyers filter quickly.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Body Type" hint="Optional">
            <Combobox
              options={bodyTypeOptions}
              value={data.bodyType || ''}
              onValueChange={(v) => setOptionalEnum('bodyType', v)}
              placeholder="Select body type..."
            />
          </FormField>

          <FormField label="Exterior Color" hint="Optional">
            <Combobox
              options={exteriorColorOptions}
              value={data.exteriorColor || ''}
              onValueChange={(v) => setOptionalEnum('exteriorColor', v)}
              placeholder="Select exterior color..."
            />
          </FormField>

          <FormField label="Interior Color" hint="Optional">
            <Combobox
              options={interiorColorOptions}
              value={data.interiorColor || ''}
              onValueChange={(v) => setOptionalEnum('interiorColor', v)}
              placeholder="Select interior color..."
            />
          </FormField>

          <FormField label="Doors" hint="Optional">
            <Combobox
              options={doorsOptions}
              value={data.doors || ''}
              onValueChange={(v) => setOptionalEnum('doors', v)}
              placeholder="Select doors..."
            />
          </FormField>

          <FormField label="Seating" hint="Optional">
            <Combobox
              options={seatingOptions}
              value={data.seatingCapacity || ''}
              onValueChange={(v) => setOptionalEnum('seatingCapacity', v)}
              placeholder="Select seating..."
            />
          </FormField>
        </div>
      </Card>

      <Card title="Powertrain" subtitle="Optional, but improves search results.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Fuel Type" hint="Optional">
            <Combobox
              options={fuelOptions}
              value={data.fuelType || ''}
              onValueChange={(v) => setOptionalEnum('fuelType', v)}
              placeholder="Select fuel type..."
            />
          </FormField>

          <FormField label="Transmission" hint="Optional">
            <Combobox
              options={transmissionOptions}
              value={data.transmission || ''}
              onValueChange={(v) => setOptionalEnum('transmission', v)}
              placeholder="Select transmission..."
            />
          </FormField>

          <FormField label="Engine Size" hint="Optional">
            <Combobox
              options={engineSizeOptions}
              value={data.engineSize || ''}
              onValueChange={(v) => setOptionalEnum('engineSize', v)}
              placeholder="Select engine size..."
            />
          </FormField>

          <FormField label="Engine Type" hint="Optional">
            <Combobox
              options={engineTypeOptions}
              value={data.engineType || ''}
              onValueChange={(v) => setOptionalEnum('engineType', v)}
              placeholder="Select engine type..."
            />
          </FormField>

          <FormField label="Cylinders" hint="Optional" error={errors.cylinders}>
            <input
              type="number"
              inputMode="numeric"
              value={data.cylinders ?? ''}
              onChange={(e) => {
                const next = e.target.value ? parseInt(e.target.value, 10) : null;
                updateField('cylinders', next);
              }}
              placeholder="e.g. 4"
              min={0}
              max={16}
              className="w-full h-12 bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 hover:bg-muted/10 transition-colors px-4 text-[15px] font-medium placeholder:text-muted-foreground/50"
            />
          </FormField>

          <FormField label="Power" hint="Optional">
            <Combobox
              options={powerOptions}
              value={data.powerRange || ''}
              onValueChange={(v) => setOptionalEnum('powerRange', v)}
              placeholder="Select power range..."
            />
          </FormField>

          <FormField label="Fuel Economy" hint="Optional">
            <input
              type="text"
              value={data.fuelEconomy || ''}
              onChange={(e) => updateField('fuelEconomy', e.target.value)}
              placeholder="e.g. 12 km/L"
              className="w-full h-12 bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 hover:bg-muted/10 transition-colors px-4 text-[15px] font-medium placeholder:text-muted-foreground/50"
            />
          </FormField>

          <FormField label="Torque" hint="Optional">
            <input
              type="text"
              value={data.torque || ''}
              onChange={(e) => updateField('torque', e.target.value)}
              placeholder="e.g. 350 Nm"
              className="w-full h-12 bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 hover:bg-muted/10 transition-colors px-4 text-[15px] font-medium placeholder:text-muted-foreground/50"
            />
          </FormField>
        </div>
      </Card>

      <Card title="Status" subtitle="Optional fields that build trust.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Warranty" hint="Optional">
            <Combobox
              options={warrantyOptions}
              value={data.warrantyType || ''}
              onValueChange={(v) => setOptionalEnum('warrantyType', v)}
              placeholder="Select warranty..."
            />
          </FormField>

          <FormField label="Export" hint="Optional">
            <Combobox
              options={exportOptions}
              value={data.exportStatus || ''}
              onValueChange={(v) => setRequiredEnum('exportStatus', v)}
              placeholder="Select export status..."
            />
          </FormField>
        </div>
      </Card>

      <Card title="Extras" subtitle="Select the features that apply.">
        <div className="flex flex-wrap gap-2.5">
          {VEHICLE_EXTRAS.map((extra) => {
            const pressed = selectedExtras.includes(extra.value);
            return (
              <TogglePill
                key={extra.value}
                label={extra.label}
                pressed={pressed}
                onClick={() => {
                  const next = pressed
                    ? selectedExtras.filter((v) => v !== extra.value)
                    : [...selectedExtras, extra.value];
                  updateField('extras', next);
                }}
              />
            );
          })}
        </div>
      </Card>

      <Card title="Tags" subtitle={`Pick up to ${MAX_LISTING_TAGS}. Keep it minimal and accurate.`}>
        <div className="flex flex-wrap gap-2.5">
          {LISTING_TAGS.map((tag) => {
            const pressed = selectedTags.includes(tag.value);
            const disabled = !pressed && selectedTags.length >= MAX_LISTING_TAGS;

            return (
              <TogglePill
                key={tag.value}
                label={tag.label}
                pressed={pressed}
                disabled={disabled}
                onClick={() => {
                  const next = pressed
                    ? selectedTags.filter((v) => v !== tag.value)
                    : [...selectedTags, tag.value];
                  updateField('tags', next);
                }}
              />
            );
          })}
        </div>
        {errors.tags && <p className="mt-3 text-sm font-medium text-red-500">{errors.tags}</p>}
      </Card>
    </div>
  );
}
