'use client';

/**
 * VIN Step - Clean Onboarding Style
 * 
 * Larger typography, colored accents.
 * Green success states, blue actions.
 */

import { useState, useCallback, useMemo } from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/utils';
import { Combobox } from '../combobox';
import { VINInput } from '../vin-input';
import type { VINCheckResponse, ListingFormData } from '../types';
import { CAR_MAKES, getModelsForMake } from '../constants';
import type { StepProps } from './types';

// ============================================================================
// Field Wrapper - Clean Label/Input Pattern
// ============================================================================

function FieldWrapper({ 
  label, 
  required, 
  hint, 
  error, 
  children 
}: { 
  label: string; 
  required?: boolean; 
  hint?: string;
  error?: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="text-subhead font-semibold text-sidebar-foreground/70">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
        {hint && !error && (
          <span className="text-caption1 text-sidebar-foreground/70">{hint}</span>
        )}
      </div>
      {children}
      {error && (
        <p className="text-caption1 font-semibold text-destructive">{error}</p>
      )}
    </div>
  );
}

// ============================================================================
// VIN Step Component
// ============================================================================

export function VINStep({ data, updateField, errors, excludeListingId }: StepProps) {
  const [vinDecoded, setVinDecoded] = useState(false);
  
  const makeOptions = useMemo(() => 
    CAR_MAKES.map(make => ({ value: make, label: make })), 
  []);
  
  const modelOptions = useMemo(() => {
    if (!data.make) return [];
    const models = getModelsForMake(data.make);
    return models.map(m => ({ value: m, label: m }));
  }, [data.make]);
  
  const handleVINDecode = useCallback((response: VINCheckResponse) => {
    if (response.decoded) {
      const decoded = response.decoded;
      
      const matchedMake = CAR_MAKES.find(
        m => m.toLowerCase() === decoded.make.toLowerCase()
      );
      if (matchedMake) {
        updateField('make', matchedMake);
        
        if (decoded.model) {
          const models = getModelsForMake(matchedMake);
          const matchedModel = models.find(
            m => m.toLowerCase() === decoded.model.toLowerCase()
          );
          // Only set model if it's in our predefined list
          // Otherwise user must select manually
          if (matchedModel) {
            updateField('model', matchedModel);
          }
          // If model not found, leave empty - user will see warning to select manually
        }
      } else {
        updateField('make', decoded.make);
        // Don't set model if make isn't matched - they need to select both manually
      }
      
      updateField('year', decoded.year);
      if (decoded.trim) updateField('trim', decoded.trim);
      if (decoded.bodyType) updateField('bodyType', decoded.bodyType as ListingFormData['bodyType']);
      if (decoded.doors) updateField('doors', decoded.doors as ListingFormData['doors']);
      if (decoded.engineSize) updateField('engineSize', decoded.engineSize as ListingFormData['engineSize']);
      if (decoded.engineType) updateField('engineType', decoded.engineType as ListingFormData['engineType']);
      if (decoded.cylinders) updateField('cylinders', decoded.cylinders);
      if (decoded.fuelType) updateField('fuelType', decoded.fuelType as ListingFormData['fuelType']);
      if (decoded.transmission) updateField('transmission', decoded.transmission as ListingFormData['transmission']);
      setVinDecoded(true);
    }
  }, [updateField]);

  // Collect decoded fields for display
  const decodedFields = useMemo(() => {
    if (!vinDecoded || !data.make) return [];
    return [
      { label: 'Trim', value: data.trim },
      { label: 'Body', value: data.bodyType },
      { label: 'Doors', value: data.doors },
      { label: 'Fuel', value: data.fuelType },
      { label: 'Transmission', value: data.transmission },
      { label: 'Engine', value: data.engineSize },
    ].filter(f => f.value);
  }, [vinDecoded, data.trim, data.bodyType, data.doors, data.fuelType, data.transmission, data.engineSize, data.make]);
  
  return (
    <div className="space-y-8">
      {/* VIN Entry Section */}
      <section>
        <h3 className="text-subhead font-bold tracking-tight text-sidebar-foreground mb-3">
          VIN
          <span className="text-destructive ml-0.5">*</span>
        </h3>
        
        <div className="rounded-xl bg-sidebar-accent/30 p-5 space-y-5">
          <VINInput
            value={data.vin || ''}
            onChange={(v) => {
              updateField('vin', v);
              if (v.length < 17) setVinDecoded(false);
            }}
            onDecode={handleVINDecode}
            excludeListingId={excludeListingId}
            error={errors.vin}
          />
          
          {/* VIN Visibility Toggle */}
          <div className="flex items-center justify-between pt-3 border-t border-border/20">
            <div>
              <p className="text-subhead text-sidebar-foreground">
                Public VIN
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={data.vinVisibility === 'public'}
              onClick={() => updateField('vinVisibility', data.vinVisibility === 'public' ? 'private' : 'public')}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                data.vinVisibility === 'public' ? 'bg-success' : 'bg-sidebar-accent'
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform",
                  data.vinVisibility === 'public' ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>
          
          {/* Info */}
          <p className="text-caption1 text-sidebar-foreground/50 flex items-center gap-1.5">
            <Info className="w-3 h-3 flex-shrink-0" />
            Verifies specs & protects buyers. Visibility setting is permanent.
          </p>
        </div>
      </section>
      
      {/* Decoded Vehicle Preview */}
      {vinDecoded && data.make && (
        <section>
          <h3 className="text-subhead font-bold tracking-tight text-sidebar-foreground mb-3">Decoded Information</h3>
          
          <div className="rounded-xl bg-success/5 p-5 space-y-5">
            {/* Success indicator */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success-muted rounded-full">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-subhead font-semibold text-sidebar-foreground">
                  {data.model ? 'Vehicle identified' : 'Partial match'}
                </p>
                <p className="text-caption1 text-sidebar-foreground/70">
                  {data.model
                    ? `${data.year} ${data.make} ${data.model}`
                    : `${data.year} ${data.make} — select model below`}
                </p>
              </div>
            </div>

            {/* Decoded specs grid */}
            {decodedFields.length > 0 && (
              <div className="grid grid-cols-3 compact:grid-cols-6 gap-4 pt-3 border-t border-border/20">
                {decodedFields.map(({ label, value }) => (
                  <div key={label} className="space-y-1">
                    <p className="text-caption2 font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
                      {label}
                    </p>
                    <p className="text-subhead text-sidebar-foreground capitalize">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
      
      {/* Manual Entry Fields */}
      <section>
        <h3 className="text-subhead font-bold tracking-tight text-sidebar-foreground mb-3">
          {vinDecoded ? 'Verify Details' : 'Enter Manually'}
        </h3>

        <div className="rounded-xl bg-sidebar-accent/30 p-5">
          <div className="grid grid-cols-1 compact:grid-cols-2 gap-6">
          {/* Make */}
          <FieldWrapper label="Make" required error={errors.make}>
            <Combobox
              options={makeOptions}
              value={data.make || ''}
              onValueChange={(v) => {
                updateField('make', v);
                updateField('model', v === 'Other' ? 'Other' : '');
              }}
              placeholder="Select make"
              searchPlaceholder="Search makes..."
            />
          </FieldWrapper>
          
          {/* Model - highlight if VIN decoded but model is missing */}
          <FieldWrapper 
            label="Model" 
            required 
            error={errors.model}
            hint={vinDecoded && !data.model ? '⚠️ Select model manually' : undefined}
          >
            <Combobox
              options={modelOptions}
              value={data.model || ''}
              onValueChange={(v) => updateField('model', v)}
              placeholder={vinDecoded && !data.model ? 'Model required - select one' : 'Select model'}
              searchPlaceholder="Search models..."
              disabled={!data.make}
              className={vinDecoded && !data.model ? 'ring-2 ring-amber-500/50' : undefined}
            />
          </FieldWrapper>
          
          {/* Year */}
          <FieldWrapper label="Year" required error={errors.year}>
            <input
              type="number"
              value={data.year || ''}
              onChange={(e) => updateField('year', parseInt(e.target.value) || 0)}
              placeholder="2024"
              min={1990}
              max={new Date().getFullYear() + 1}
              className={cn(
                "w-full h-12 bg-transparent px-0 text-subhead text-sidebar-foreground",
                "outline-none transition-colors",
                "placeholder:text-sidebar-foreground/40"
              )}
            />
          </FieldWrapper>
          
          {/* Trim */}
          <FieldWrapper label="Trim" hint="Optional">
            <input
              type="text"
              value={data.trim || ''}
              onChange={(e) => updateField('trim', e.target.value)}
              placeholder="Sport, Limited, GT"
              className={cn(
                "w-full h-12 bg-transparent px-0 text-subhead text-sidebar-foreground",
                "outline-none transition-colors",
                "placeholder:text-sidebar-foreground/40"
              )}
            />
          </FieldWrapper>
          </div>
        </div>
      </section>
    </div>
  );
}
