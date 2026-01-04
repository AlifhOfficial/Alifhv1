'use client';

import { useState, useCallback, useMemo } from 'react';
import { Combobox } from '../combobox';
import { FormField } from '../form-field';
import { VINInput } from '../vin-input';
import { DecodedVehiclePreview } from '../decoded-preview';
import type { VINCheckResponse, ListingFormData } from '../types';
import { CAR_MAKES, getModelsForMake } from '../constants';
import type { StepProps } from './types';

// VIN limitation notice
const VIN_NOTICE = "Note: Not all VINs are supported yet, especially Japanese-made vehicles (data sourced from NHTSA).";

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
      
      // Find matching make (case-insensitive) from our options
      const matchedMake = CAR_MAKES.find(
        m => m.toLowerCase() === decoded.make.toLowerCase()
      );
      if (matchedMake) {
        updateField('make', matchedMake);
        
        // Find matching model (case-insensitive) from models for this make
        if (decoded.model) {
          const models = getModelsForMake(matchedMake);
          const matchedModel = models.find(
            m => m.toLowerCase() === decoded.model.toLowerCase()
          );
          updateField('model', matchedModel || decoded.model);
        }
      } else {
        // Fallback: use decoded values as-is (will show in preview but not in dropdown)
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
  
  return (
    <div className="space-y-6">
      {/* VIN Limitation Notice */}
      <div className="px-4 py-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
        <p className="text-[13px] font-medium text-amber-700 dark:text-amber-400">{VIN_NOTICE}</p>
      </div>
      
      {/* VIN Input Card */}
      <div className="p-6 bg-background border border-border/50 rounded-2xl space-y-4">
        <div>
          <h4 className="text-[16px] font-semibold tracking-tight mb-1">Enter VIN</h4>
          <p className="text-[14px] text-muted-foreground">We&apos;ll automatically decode your vehicle details</p>
        </div>
        
        <VINInput
          value={data.vin || ''}
          onChange={(v) => {
            updateField('vin', v);
            if (v.length < 17) setVinDecoded(false);
          }}
          onDecode={handleVINDecode}
          excludeListingId={excludeListingId}
        />
      </div>
      
      {/* Decoded vehicle preview */}
      <DecodedVehiclePreview data={data} isVisible={vinDecoded} />
      
      {/* Divider */}
      <div className="flex items-center gap-4 pt-2">
        <div className="flex-1 h-px bg-border/30" />
        <span className="text-[12px] font-semibold text-muted-foreground/50 uppercase tracking-wider">
          {vinDecoded ? "Verify details" : "Or enter manually"}
        </span>
        <div className="flex-1 h-px bg-border/30" />
      </div>
      
      {/* Manual entry card */}
      <div className="p-6 bg-background border border-border/50 rounded-2xl">
        <div className="mb-5">
          <h4 className="text-[16px] font-semibold tracking-tight mb-1">Vehicle Details</h4>
          <p className="text-[14px] text-muted-foreground">Select or verify your vehicle information</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField label="Make" required error={errors.make}>
            <Combobox
              options={makeOptions}
              value={data.make || ''}
              onValueChange={(v) => {
                updateField('make', v);
                updateField('model', '');
              }}
              placeholder="Select make..."
              searchPlaceholder="Search makes..."
            />
          </FormField>
          
          <FormField label="Model" required error={errors.model}>
            <Combobox
              options={modelOptions}
              value={data.model || ''}
              onValueChange={(v) => updateField('model', v)}
              placeholder="Select model..."
              searchPlaceholder="Search models..."
              disabled={!data.make}
            />
          </FormField>
          
          <FormField label="Year" required error={errors.year}>
            <input
              type="number"
              value={data.year || ''}
              onChange={(e) => updateField('year', parseInt(e.target.value) || 0)}
              placeholder="e.g. 2024"
              min={1990}
              max={new Date().getFullYear() + 1}
              className="w-full h-12 bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 hover:bg-muted/10 transition-colors px-4 text-[15px] font-medium placeholder:text-muted-foreground/50"
            />
          </FormField>
          
          <FormField label="Trim / Variant" hint="Optional">
            <input
              type="text"
              value={data.trim || ''}
              onChange={(e) => updateField('trim', e.target.value)}
              placeholder="e.g. Sport, Limited, GT"
              className="w-full h-12 bg-background border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 hover:bg-muted/10 transition-colors px-4 text-[15px] font-medium placeholder:text-muted-foreground/50"
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}
