'use client';

/**
 * VIN Step - Clean Onboarding Style
 * 
 * Larger typography, colored accents.
 * Green success states, blue actions.
 */

import { useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
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
        <label className="text-base font-medium text-muted-foreground">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {hint && !error && (
          <span className="text-sm text-muted-foreground/60">{hint}</span>
        )}
      </div>
      {children}
      {error && (
        <p className="text-base font-medium text-red-500">{error}</p>
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
    return [...models.map(m => ({ value: m, label: m })), { value: 'other', label: 'Other' }];
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
          updateField('model', matchedModel || decoded.model);
        }
      } else {
        updateField('make', decoded.make);
        if (decoded.model) updateField('model', decoded.model);
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
    <div className="space-y-10">
      {/* VIN Entry Section */}
      <div className="space-y-4">
        <VINInput
          value={data.vin || ''}
          onChange={(v) => {
            updateField('vin', v);
            if (v.length < 17) setVinDecoded(false);
          }}
          onDecode={handleVINDecode}
          excludeListingId={excludeListingId}
        />
        
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
          <span className="font-semibold text-yellow-500">Experimental</span>
          <span className="text-muted-foreground font-medium">— Some VINs may not decode, especially Japanese-made vehicles.</span>
        </div>
      </div>
      
      {/* Decoded Vehicle Preview */}
      {vinDecoded && data.make && (
        <div className="space-y-6 p-5 bg-sidebar rounded-xl">
          {/* Success indicator */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-full">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">
                {data.model ? 'Vehicle identified' : 'Partial match'}
              </p>
              <p className="text-sm text-muted-foreground">
                {data.model
                  ? `${data.year} ${data.make} ${data.model}`
                  : `${data.year} ${data.make} — select model below`}
              </p>
            </div>
          </div>

          {/* Decoded specs grid */}
          {decodedFields.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {decodedFields.map(({ label, value }) => (
                <div key={label} className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
                    {label}
                  </p>
                  <p className="text-sm font-semibold text-foreground capitalize">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Manual Entry Fields */}
      <div className="space-y-8">
        <h3 className="text-lg font-medium text-foreground">
          {vinDecoded ? 'Verify details' : 'Enter manually'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Make */}
          <FieldWrapper label="Make" required error={errors.make}>
            <Combobox
              options={makeOptions}
              value={data.make || ''}
              onValueChange={(v) => {
                updateField('make', v);
                updateField('model', '');
              }}
              placeholder="Select make"
              searchPlaceholder="Search makes..."
            />
          </FieldWrapper>
          
          {/* Model */}
          <FieldWrapper label="Model" required error={errors.model}>
            <Combobox
              options={modelOptions}
              value={data.model || ''}
              onValueChange={(v) => updateField('model', v)}
              placeholder="Select model"
              searchPlaceholder="Search models..."
              disabled={!data.make}
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
                "w-full h-12 bg-transparent border-b-2 border-border/40 focus:border-blue-500",
                "outline-none transition-colors px-0 text-base font-medium",
                "placeholder:text-muted-foreground/40"
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
                "w-full h-12 bg-transparent border-b-2 border-border/40 focus:border-blue-500",
                "outline-none transition-colors px-0 text-base font-medium",
                "placeholder:text-muted-foreground/40"
              )}
            />
          </FieldWrapper>
        </div>
      </div>
    </div>
  );
}
