/**
 * Listing Form Component
 * 
 * Clean, minimal 3-step form following Alifh design system.
 * "Keep it neat, don't overdo it"
 * 
 * Steps:
 * 1. Vehicle → VIN entry with auto-decode
 * 2. Details → Specs, colors, features
 * 3. Publish → Price, photos, location
 * 
 * @module components/listings/listing-form
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { 
  Loader2,
  CheckCircle2,
  X,
  Plus,
  ChevronsUpDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/utils';
import { ImageUpload } from '@/components/ui/forms/image-upload';
import { Textarea } from '@/components/ui/forms/textarea';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  type FormStep,
  type ListingFormData,
  type ListingFormProps,
  type VINCheckResponse,
  FORM_STEPS,
  getDefaultFormValues,
  validateStep,
} from './types';
import {
  CAR_MAKES,
  BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  SPECS_TYPES,
  ENGINE_SIZES,
  EXTERIOR_COLORS,
  INTERIOR_COLORS,
  DOORS_OPTIONS,
  SEATING_OPTIONS,
  UAE_EMIRATES,
  VEHICLE_EXTRAS,
  LISTING_TAGS,
  MAX_LISTING_TAGS,
  getModelsForMake,
} from './constants';

// ============================================================================
// STEP CONFIGURATION
// ============================================================================

const STEP_CONFIG = {
  vin: {
    title: "Vehicle Information",
    subtitle: "Enter your 17-character VIN to auto-fill details",
  },
  details: {
    title: "Specifications",
    subtitle: "Add specs, colors, and features",
  },
  publish: {
    title: "Publish",
    subtitle: "Set price and add photos",
  },
} as const;

// VIN limitation notice
const VIN_NOTICE = "Note: Not all VINs are supported yet, especially Japanese-made vehicles (data sourced from NHTSA).";

// ============================================================================
// COMBOBOX COMPONENT - Minimal Design
// ============================================================================

interface ComboboxProps {
  options: { value: string; label: string; icon?: React.ReactNode }[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full h-10 flex items-center justify-between px-3 bg-background border border-border/40 rounded-lg text-sm",
            "transition-colors focus:outline-none focus:ring-1 focus:ring-ring hover:bg-secondary/30",
            value ? "text-foreground font-medium" : "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed hover:bg-background"
          )}
        >
          <span className="flex items-center gap-2.5 truncate">
            {selected?.icon}
            {selected?.label || placeholder}
          </span>
          <ChevronsUpDown className="w-4 h-4 text-muted-foreground/80" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-10" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <span className="flex items-center gap-2 flex-1">
                    {option.icon}
                    {option.label}
                  </span>
                  <CheckCircle2
                    className={cn(
                      "w-4 h-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ============================================================================
// VIN INPUT COMPONENT - Clean & Minimal
// ============================================================================

interface VINInputProps {
  value: string;
  onChange: (value: string) => void;
  onDecode: (response: VINCheckResponse) => void;
  disabled?: boolean;
  excludeListingId?: string;
}

function VINInput({ value, onChange, onDecode, disabled, excludeListingId }: VINInputProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  const checkVIN = useCallback(async (vin: string) => {
    if (vin.length !== 17) {
      setStatus('idle');
      setMessage('');
      return;
    }
    
    setIsChecking(true);
    setStatus('checking');
    
    try {
      const params = new URLSearchParams({ vin });
      if (excludeListingId) params.append('excludeId', excludeListingId);
      
      const response = await fetch(`/api/listings/check-vin?${params}`);
      const data: VINCheckResponse = await response.json();
      
      if (data.available) {
        setStatus('available');
        // Handle partial decode - model may be empty for some VINs
        if (data.decoded) {
          const { year, make, model } = data.decoded;
          setMessage(model ? `${year} ${make} ${model}` : `${year} ${make} - select model below`);
        } else {
          setMessage('VIN verified');
        }
        onDecode(data);
      } else {
        setStatus('taken');
        setMessage(data.message);
      }
    } catch {
      setStatus('error');
      setMessage('Failed to verify VIN');
    } finally {
      setIsChecking(false);
    }
  }, [excludeListingId, onDecode]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase().replace(/[IOQ]/g, '').slice(0, 17);
    onChange(newValue);
    
    if (newValue.length === 17) {
      checkVIN(newValue);
    } else {
      setStatus('idle');
      setMessage('');
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        <label className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
          Vehicle Identification Number
        </label>
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={handleChange}
            disabled={disabled}
            placeholder="Enter 17-character VIN"
            className={cn(
              "w-full h-11 bg-background border rounded-lg text-sm font-mono tracking-widest uppercase px-4",
              "transition-colors focus:outline-none focus:ring-1 focus:ring-ring",
              status === 'available' && "border-green-500/50 bg-green-500/5",
              status === 'taken' && "border-destructive/50 bg-destructive/5",
              status === 'error' && "border-yellow-500/50 bg-yellow-500/5",
              (status === 'idle' || status === 'checking') && "border-border/40 hover:bg-secondary/30",
              disabled && "opacity-50 cursor-not-allowed",
              "placeholder:text-muted-foreground/70 placeholder:tracking-normal placeholder:font-sans"
            )}
          />
          
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {isChecking ? (
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            ) : status === 'available' ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : status === 'taken' || status === 'error' ? (
              <X className="w-4 h-4 text-red-500" />
            ) : null}
          </div>
        </div>
      </div>
      
      {/* Character count */}
      <p className="text-xs text-muted-foreground/70 tabular-nums">
        {value.length}/17 characters
      </p>
      
      {/* Status message */}
      {message && (
        <p className={cn(
          "text-sm font-medium",
          status === 'available' && "text-green-600",
          status === 'taken' && "text-destructive",
          status === 'error' && "text-yellow-600"
        )}>
          {message}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// DECODED VEHICLE PREVIEW - Minimal Card
// ============================================================================

interface DecodedVehiclePreviewProps {
  data: Partial<ListingFormData>;
  isVisible: boolean;
}

function DecodedVehiclePreview({ data, isVisible }: DecodedVehiclePreviewProps) {
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
    <div className="mt-6 p-4 sm:p-6 bg-card border border-border/40 rounded-2xl">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
        </div>
        <span className="text-sm font-medium tracking-tight">
          {data.model ? 'Vehicle Identified' : 'Partial match - select model below'}
        </span>
      </div>
      
      <h3 className="text-lg font-semibold tracking-tight mb-4">
        {data.year} {data.make} {data.model || '(select model)'}
      </h3>
      
      {decodedFields.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {decodedFields.map(({ label, value }) => (
            <div key={label} className="space-y-1">
              <p className="text-xs text-muted-foreground/70">{label}</p>
              <p className="text-sm font-medium capitalize">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FORM FIELD WRAPPER - Underline Style
// ============================================================================

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

// ============================================================================
// STEP PROPS
// ============================================================================

interface StepProps {
  data: Partial<ListingFormData>;
  updateField: <K extends keyof ListingFormData>(field: K, value: ListingFormData[K]) => void;
  errors: Record<string, string>;
  excludeListingId?: string;
}

// ============================================================================
// STEP 1: VIN - Clean Layout
// ============================================================================

function VINStep({ data, updateField, errors, excludeListingId }: StepProps) {
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
      if (decoded.bodyType) updateField('bodyType', decoded.bodyType as any);
      if (decoded.doors) updateField('doors', decoded.doors as any);
      if (decoded.engineSize) updateField('engineSize', decoded.engineSize as any);
      if (decoded.engineType) updateField('engineType', decoded.engineType as any);
      if (decoded.cylinders) updateField('cylinders', decoded.cylinders);
      if (decoded.fuelType) updateField('fuelType', decoded.fuelType as any);
      if (decoded.transmission) updateField('transmission', decoded.transmission as any);
      setVinDecoded(true);
    }
  }, [updateField]);
  
  return (
    <div className="space-y-6">
      {/* VIN Limitation Notice */}
      <div className="p-3 sm:p-4 bg-muted/50 border border-border/40 rounded-lg">
        <p className="text-xs text-muted-foreground">{VIN_NOTICE}</p>
      </div>
      
      {/* VIN Input */}
      <VINInput
        value={data.vin || ''}
        onChange={(v) => {
          updateField('vin', v);
          if (v.length < 17) setVinDecoded(false);
        }}
        onDecode={handleVINDecode}
        excludeListingId={excludeListingId}
      />
      
      {/* Decoded vehicle preview */}
      <DecodedVehiclePreview data={data} isVisible={vinDecoded} />
      
      {/* Divider */}
      <div className="flex items-center gap-4 pt-6">
        <div className="flex-1 h-px bg-border/40" />
        <span className="text-xs font-medium text-muted-foreground/70">
          {vinDecoded ? "Verify details" : "Or enter manually"}
        </span>
        <div className="flex-1 h-px bg-border/40" />
      </div>
      
      {/* Manual entry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FormField label="Make" required error={errors.make}>
          <Combobox
            options={makeOptions}
            value={data.make || ''}
            onValueChange={(v) => {
              updateField('make', v);
              updateField('model', '');
            }}
            placeholder="Select make..."
            searchPlaceholder="Search..."
          />
        </FormField>
        
        <FormField label="Model" required error={errors.model}>
          <Combobox
            options={modelOptions}
            value={data.model || ''}
            onValueChange={(v) => updateField('model', v)}
            placeholder="Select model..."
            searchPlaceholder="Search..."
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
            className="w-full h-10 bg-background border border-border/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-ring hover:bg-secondary/30 transition-colors px-3 text-sm font-medium placeholder:text-muted-foreground"
          />
        </FormField>
        
        <FormField label="Trim / Variant">
          <input
            type="text"
            value={data.trim || ''}
            onChange={(e) => updateField('trim', e.target.value)}
            placeholder="e.g. Sport, Limited, GT"
            className="w-full h-10 bg-background border border-border/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-ring hover:bg-secondary/30 transition-colors px-3 text-sm font-medium placeholder:text-muted-foreground"
          />
        </FormField>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 2: DETAILS - Clean Sections
// ============================================================================

function DetailsStep({ data, updateField, errors }: StepProps) {
  // Convert constants to combobox options
  const bodyTypeOptions = BODY_TYPES.map(t => ({ value: t.value, label: t.label }));
  const fuelTypeOptions = FUEL_TYPES.map(t => ({ value: t.value, label: t.label }));
  const transmissionOptions = TRANSMISSION_TYPES.map(t => ({ value: t.value, label: t.label }));
  const engineSizeOptions = ENGINE_SIZES.map(t => ({ value: t.value, label: t.label }));
  const specsOptions = SPECS_TYPES.map(t => ({ value: t.value, label: t.label }));
  const doorsOptions = DOORS_OPTIONS.map(t => ({ value: t.value, label: t.label }));
  const seatingOptions = SEATING_OPTIONS.map(t => ({ value: t.value, label: t.label }));
  
  const exteriorColorOptions = EXTERIOR_COLORS.map(c => ({
    value: c.value,
    label: c.label,
    icon: <div className="w-3 h-3 rounded-full border border-border/40" style={{ backgroundColor: c.hex }} />
  }));
  
  const interiorColorOptions = INTERIOR_COLORS.map(c => ({
    value: c.value,
    label: c.label,
    icon: <div className="w-3 h-3 rounded-full border border-border/40" style={{ backgroundColor: c.hex }} />
  }));
  
  const toggleExtra = (extra: string) => {
    const current = data.extras || [];
    const updated = current.includes(extra)
      ? current.filter(e => e !== extra)
      : [...current, extra];
    updateField('extras', updated);
  };
  
  const toggleTag = (tag: string) => {
    const current = data.tags || [];
    if (current.includes(tag)) {
      updateField('tags', current.filter(t => t !== tag));
    } else if (current.length < MAX_LISTING_TAGS) {
      updateField('tags', [...current, tag]);
    }
  };
  
  return (
    <div className="space-y-12">
      {/* Required Specs */}
      <section className="space-y-6">
        <div className="border-b border-border/40 pb-3">
          <h3 className="text-base font-medium tracking-tight">Specifications</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FormField label="Mileage (km)" required error={errors.mileage}>
            <input
              type="number"
              value={data.mileage || ''}
              onChange={(e) => updateField('mileage', parseInt(e.target.value) || 0)}
              placeholder="e.g. 50,000"
              min={0}
              className="w-full h-10 bg-background border border-border/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-ring hover:bg-secondary/30 transition-colors px-3 text-sm font-medium placeholder:text-muted-foreground"
            />
          </FormField>
          
          <FormField label="Regional Specs" required error={errors.specs}>
            <Combobox
              options={specsOptions}
              value={data.specs || 'gcc'}
              onValueChange={(v) => updateField('specs', v as any)}
              placeholder="Select specs"
            />
          </FormField>
          
          <FormField label="Steering Side" required error={errors.steeringSide}>
            <Combobox
              options={[
                { value: 'left', label: 'Left Hand Drive' },
                { value: 'right', label: 'Right Hand Drive' },
              ]}
              value={data.steeringSide || 'left'}
              onValueChange={(v) => updateField('steeringSide', v as any)}
            />
          </FormField>
        </div>
      </section>
      
      {/* Appearance */}
      <section className="space-y-6">
        <div className="border-b border-border/40 pb-3">
          <h3 className="text-base font-medium tracking-tight">Appearance</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FormField label="Body Type">
            <Combobox
              options={bodyTypeOptions}
              value={data.bodyType || ''}
              onValueChange={(v) => updateField('bodyType', v as any)}
              placeholder="Select..."
            />
          </FormField>
          
          <FormField label="Exterior Color">
            <Combobox
              options={exteriorColorOptions}
              value={data.exteriorColor || ''}
              onValueChange={(v) => updateField('exteriorColor', v as any)}
              placeholder="Select..."
            />
          </FormField>
          
          <FormField label="Interior Color">
            <Combobox
              options={interiorColorOptions}
              value={data.interiorColor || ''}
              onValueChange={(v) => updateField('interiorColor', v as any)}
              placeholder="Select..."
            />
          </FormField>
          
          <FormField label="Doors">
            <Combobox
              options={doorsOptions}
              value={data.doors || ''}
              onValueChange={(v) => updateField('doors', v as any)}
              placeholder="Select..."
            />
          </FormField>
          
          <FormField label="Seating Capacity">
            <Combobox
              options={seatingOptions}
              value={data.seatingCapacity || ''}
              onValueChange={(v) => updateField('seatingCapacity', v as any)}
              placeholder="Select..."
            />
          </FormField>
        </div>
      </section>
      
      {/* Engine & Performance */}
      <section className="space-y-6">
        <div className="border-b border-border/40 pb-3">
          <h3 className="text-base font-medium tracking-tight">Engine & Performance</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FormField label="Fuel Type">
            <Combobox
              options={fuelTypeOptions}
              value={data.fuelType || ''}
              onValueChange={(v) => updateField('fuelType', v as any)}
              placeholder="Select..."
            />
          </FormField>
          
          <FormField label="Transmission">
            <Combobox
              options={transmissionOptions}
              value={data.transmission || ''}
              onValueChange={(v) => updateField('transmission', v as any)}
              placeholder="Select..."
            />
          </FormField>
          
          <FormField label="Engine Size">
            <Combobox
              options={engineSizeOptions}
              value={data.engineSize || ''}
              onValueChange={(v) => updateField('engineSize', v as any)}
              placeholder="Select..."
            />
          </FormField>
          
          <FormField label="Cylinders">
            <input
              type="number"
              value={data.cylinders || ''}
              onChange={(e) => updateField('cylinders', parseInt(e.target.value) || null)}
              placeholder="e.g. 4, 6, 8"
              min={0}
              max={16}
              className="w-full h-10 bg-background border border-border/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-ring hover:bg-secondary/30 transition-colors px-3 text-sm font-medium placeholder:text-muted-foreground"
            />
          </FormField>
          
          <FormField label="Engine Type">
            <Combobox
              options={[
                { value: 'inline-3', label: 'Inline 3' },
                { value: 'inline-4', label: 'Inline 4' },
                { value: 'inline-6', label: 'Inline 6' },
                { value: 'v6', label: 'V6' },
                { value: 'v8', label: 'V8' },
                { value: 'v10', label: 'V10' },
                { value: 'v12', label: 'V12' },
                { value: 'w12', label: 'W12' },
                { value: 'electric', label: 'Electric Motor' },
                { value: 'hybrid', label: 'Hybrid' },
                { value: 'other', label: 'Other' },
              ]}
              value={data.engineType || ''}
              onValueChange={(v) => updateField('engineType', v as any)}
              placeholder="Select..."
            />
          </FormField>
          
          <FormField label="Power Range">
            <Combobox
              options={[
                { value: 'under_100', label: 'Under 100 HP' },
                { value: '100_200', label: '100 - 200 HP' },
                { value: '200_300', label: '200 - 300 HP' },
                { value: '300_400', label: '300 - 400 HP' },
                { value: '400_500', label: '400 - 500 HP' },
                { value: '500_600', label: '500 - 600 HP' },
                { value: '600_700', label: '600 - 700 HP' },
                { value: '700_plus', label: '700+ HP' },
              ]}
              value={data.powerRange || ''}
              onValueChange={(v) => updateField('powerRange', v as any)}
              placeholder="Select..."
            />
          </FormField>
          
          <FormField label="Torque (Nm)">
            <input
              type="text"
              value={data.torque || ''}
              onChange={(e) => updateField('torque', e.target.value)}
              placeholder="e.g. 350 Nm"
              className="w-full h-10 bg-background border border-border/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-ring hover:bg-secondary/30 transition-colors px-3 text-sm font-medium placeholder:text-muted-foreground"
            />
          </FormField>
          
          <FormField label="Fuel Economy">
            <input
              type="text"
              value={data.fuelEconomy || ''}
              onChange={(e) => updateField('fuelEconomy', e.target.value)}
              placeholder="e.g. 8.5 L/100km"
              className="w-full h-10 bg-background border border-border/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-ring hover:bg-secondary/30 transition-colors px-3 text-sm font-medium placeholder:text-muted-foreground"
            />
          </FormField>
        </div>
      </section>
      
      {/* Warranty & Status */}
      <section className="space-y-6">
        <div className="border-b border-border/40 pb-3">
          <h3 className="text-base font-medium tracking-tight">Warranty & Status</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField label="Warranty">
            <Combobox
              options={[
                { value: 'none', label: 'No Warranty' },
                { value: 'manufacturer', label: 'Manufacturer Warranty' },
                { value: 'extended', label: 'Extended Warranty' },
                { value: 'dealer', label: 'Dealer Warranty' },
                { value: 'other', label: 'Other' },
              ]}
              value={data.warrantyType || ''}
              onValueChange={(v) => updateField('warrantyType', v as any)}
              placeholder="Select..."
            />
          </FormField>
          
          <FormField label="Export Status">
            <Combobox
              options={[
                { value: 'local_only', label: 'Local Use Only' },
                { value: 'gcc', label: 'GCC Export' },
                { value: 'international', label: 'International Export' },
                { value: 'restricted', label: 'Export Restricted' },
              ]}
              value={data.exportStatus || 'local_only'}
              onValueChange={(v) => updateField('exportStatus', v as any)}
              placeholder="Select..."
            />
          </FormField>
        </div>
      </section>
      
      {/* Tags */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-border/40 pb-3">
          <h3 className="text-base font-medium tracking-tight">Highlights</h3>
          <span className="text-xs text-muted-foreground/70 tabular-nums">
            {(data.tags || []).length}/{MAX_LISTING_TAGS}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {LISTING_TAGS.map((tag) => {
            const isSelected = (data.tags || []).includes(tag.value);
            const isDisabled = !isSelected && (data.tags || []).length >= MAX_LISTING_TAGS;
            
            return (
              <button
                key={tag.value}
                type="button"
                onClick={() => toggleTag(tag.value)}
                disabled={isDisabled}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                  isSelected
                    ? "bg-foreground text-background border-foreground"
                    : isDisabled
                    ? "bg-muted/30 text-muted-foreground/30 border-border/30 cursor-not-allowed"
                    : "bg-transparent text-muted-foreground border-border/40 hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <span className="mr-1.5">{tag.icon}</span>
                {tag.label}
              </button>
            );
          })}
        </div>
      </section>
      
      {/* Extras */}
      <section className="space-y-6">
        <div className="border-b border-border/40 pb-3">
          <h3 className="text-base font-medium tracking-tight">Features</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {VEHICLE_EXTRAS.map((extra) => {
            const isSelected = (data.extras || []).includes(extra.value);
            
            return (
              <button
                key={extra.value}
                type="button"
                onClick={() => toggleExtra(extra.value)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                  isSelected
                    ? "bg-muted text-foreground border-border"
                    : "bg-transparent text-muted-foreground/70 border-border/40 hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5" />}
                {extra.label}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// STEP 3: PUBLISH - Clean & Focused
// ============================================================================

function PublishStep({ data, updateField, errors }: StepProps) {
  const [newRemark, setNewRemark] = useState('');
  const ownerRemarks = data.ownerRemarks || [];
  
  const emirateOptions = UAE_EMIRATES.map(e => ({ value: e.value, label: e.label }));
  
  const addRemark = () => {
    if (newRemark.trim() && ownerRemarks.length < 10) {
      updateField('ownerRemarks', [...ownerRemarks, newRemark.trim()]);
      setNewRemark('');
    }
  };
  
  const removeRemark = (index: number) => {
    updateField('ownerRemarks', ownerRemarks.filter((_, i) => i !== index));
  };
  
  const imageUrls = (data.images || []).map(img => img.key);
  
  const handleImagesChange = (urls: string[]) => {
    const images = urls.map((key, index) => ({ key, order: index }));
    updateField('images', images);
  };
  
  return (
    <div className="space-y-12">
      {/* Pricing */}
      <section className="space-y-6">
        <div className="border-b border-border/40 pb-3">
          <h3 className="text-base font-medium tracking-tight">Pricing</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField label="Price (AED)" required error={errors.price}>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                AED
              </span>
              <input
                type="number"
                value={data.price || ''}
                onChange={(e) => updateField('price', parseInt(e.target.value) || 0)}
                placeholder="0"
                min={1000}
                className="w-full h-11 bg-background border border-border/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-ring hover:bg-secondary/30 transition-colors pl-14 pr-4 text-lg font-bold tabular-nums placeholder:text-muted-foreground"
              />
            </div>
          </FormField>
          
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={data.isNegotiable ?? true}
                onChange={(e) => updateField('isNegotiable', e.target.checked)}
                className="w-4 h-4 rounded border-border/60 accent-primary cursor-pointer"
              />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Price is negotiable</span>
            </label>
          </div>
        </div>
      </section>
      
      {/* Location */}
      <section className="space-y-6">
        <div className="border-b border-border/40 pb-3">
          <h3 className="text-base font-medium tracking-tight">Location</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField label="Emirate" required error={errors.emirate}>
            <Combobox
              options={emirateOptions}
              value={data.emirate || ''}
              onValueChange={(v) => updateField('emirate', v)}
              placeholder="Select emirate"
            />
          </FormField>
          
          <FormField label="City / Area">
            <input
              type="text"
              value={data.city || ''}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="e.g. Dubai Marina"
              className="w-full h-10 bg-background border border-border/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-ring hover:bg-secondary/30 transition-colors px-3 text-sm font-medium placeholder:text-muted-foreground"
            />
          </FormField>
        </div>
      </section>
      
      {/* Photos */}
      <section className="space-y-6">
        <div className="border-b border-border/40 pb-3">
          <h3 className="text-base font-medium tracking-tight">
            Photos <span className="text-destructive">*</span>
          </h3>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Add up to 20 photos. First photo will be the cover.
          </p>
        </div>
        
        <ImageUpload
          value={imageUrls}
          onChange={handleImagesChange}
          maxImages={20}
          directory="listings"
        />
        {errors.images && <p className="text-xs text-red-500">{errors.images}</p>}
      </section>
      
      {/* Video URL */}
      <section className="space-y-6">
        <FormField label="Video URL">
          <input
            type="url"
            value={data.videoUrl || ''}
            onChange={(e) => updateField('videoUrl', e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full h-10 bg-background border border-border/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-ring hover:bg-secondary/30 transition-colors px-3 text-sm font-medium placeholder:text-muted-foreground"
          />
        </FormField>
      </section>
      
      {/* Description */}
      <section className="space-y-6">
        <div className="border-b border-border/40 pb-3">
          <h3 className="text-base font-medium tracking-tight">Description</h3>
        </div>
        
        <Textarea
          value={data.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Describe your vehicle, its condition, history, and any other details..."
          rows={4}
          className="w-full p-3 bg-background border border-border/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-ring hover:bg-secondary/30 transition-colors text-sm font-medium resize-none placeholder:text-muted-foreground"
        />
      </section>
      
      {/* Owner Remarks */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-border/40 pb-3">
          <h3 className="text-base font-medium tracking-tight">Quick Notes</h3>
          <span className="text-xs text-muted-foreground/70 tabular-nums">{ownerRemarks.length}/10</span>
        </div>
        
        {ownerRemarks.length > 0 && (
          <div className="space-y-1">
            {ownerRemarks.map((remark, index) => (
              <div 
                key={index}
                className="flex items-center justify-between gap-3 py-2.5 border-b border-border/40 group"
              >
                <span className="text-sm font-medium">{remark}</span>
                <button
                  type="button"
                  onClick={() => removeRemark(index)}
                  className="p-1.5 text-muted-foreground/40 hover:text-foreground hover:bg-muted/30 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {ownerRemarks.length < 10 && (
          <div className="flex gap-3">
            <input
              type="text"
              value={newRemark}
              onChange={(e) => setNewRemark(e.target.value.slice(0, 200))}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRemark())}
              placeholder="e.g. Recently serviced, New tires..."
              maxLength={200}
              className="flex-1 h-10 bg-background border border-border/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-ring hover:bg-secondary/30 transition-colors px-3 text-sm font-medium placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={addRemark}
              disabled={!newRemark.trim()}
              className="px-3 h-10 bg-background border border-border/40 rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground disabled:opacity-30 transition-colors flex items-center justify-center"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

// ============================================================================
// MAIN FORM COMPONENT
// ============================================================================

export function ListingForm({
  mode,
  initialData,
  onSubmit,
  onSaveDraft,
  onCancel,
  isStaff,
  partnerId,
}: ListingFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('vin');
  const [formData, setFormData] = useState<Partial<ListingFormData>>(() => ({
    ...getDefaultFormValues(),
    ...initialData,
    partnerId: partnerId || initialData?.partnerId,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentStepIndex = FORM_STEPS.findIndex(s => s.id === currentStep);
  const stepConfig = STEP_CONFIG[currentStep];
  
  const updateField = useCallback(<K extends keyof ListingFormData>(
    field: K, 
    value: ListingFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);
  
  const validateCurrentStep = (): boolean => {
    const result = validateStep(currentStep, formData);
    if (!result.success && result.errors) {
      const newErrors: Record<string, string> = {};
      const zodErrors = result.errors.issues || [];
      zodErrors.forEach(err => {
        const path = err.path.join('.') || 'form';
        newErrors[path] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };
  
  const handleNext = () => {
    if (validateCurrentStep()) {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < FORM_STEPS.length) {
        setCurrentStep(FORM_STEPS[nextIndex].id);
      }
    }
  };
  
  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(FORM_STEPS[prevIndex].id);
    }
  };
  
  const handleSubmit = async () => {
    for (const step of FORM_STEPS) {
      const result = validateStep(step.id, formData);
      if (!result.success) {
        setCurrentStep(step.id);
        if (result.errors) {
          const newErrors: Record<string, string> = {};
          const zodErrors = result.errors.issues || [];
          zodErrors.forEach(err => {
            const path = err.path.join('.') || 'form';
            newErrors[path] = err.message;
          });
          setErrors(newErrors);
        }
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData as ListingFormData);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSaveDraft = async () => {
    if (onSaveDraft) {
      setIsSubmitting(true);
      try {
        await onSaveDraft(formData);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12 sm:space-y-16">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 sm:gap-8">
        <div className="flex items-start gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="p-2.5 hover:bg-muted/50 rounded-xl transition-all duration-200 mt-0.5"
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
              {mode === 'edit' ? 'Edit Listing' : 'New Listing'}
            </h1>
            <p className="text-sm text-muted-foreground/70">
              {stepConfig.subtitle}
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {FORM_STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => index < currentStepIndex && setCurrentStep(step.id)}
              disabled={index > currentStepIndex}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                index === currentStepIndex && "bg-primary text-primary-foreground",
                index < currentStepIndex && "bg-muted text-foreground cursor-pointer hover:bg-secondary",
                index > currentStepIndex && "text-muted-foreground/40"
              )}
            >
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-current/10 text-current">{index + 1}</span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Form Content */}
      <section>
        {currentStep === 'vin' && (
          <VINStep 
            data={formData} 
            updateField={updateField} 
            errors={errors}
            excludeListingId={initialData?.id}
          />
        )}
        {currentStep === 'details' && (
          <DetailsStep data={formData} updateField={updateField} errors={errors} />
        )}
        {currentStep === 'publish' && (
          <PublishStep data={formData} updateField={updateField} errors={errors} />
        )}
        
        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="mt-8 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <p className="text-sm font-medium text-destructive mb-2">Please fix the following:</p>
            <ul className="text-xs text-destructive/90 space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field} className="flex items-start gap-2">
                  <span className="text-destructive">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Navigation */}
      <section className="flex items-center justify-between pt-6 border-t border-border/40">
        <div className="flex gap-3">
          {currentStepIndex > 0 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-full border border-border/40 text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
        </div>
        
        <div className="flex gap-3">
          {onSaveDraft && (
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-full border border-border/40 text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
            >
              Save Draft
            </button>
          )}
          
          {currentStepIndex < FORM_STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : mode === 'edit' ? (
                'Update Listing'
              ) : (
                'Publish Listing'
              )}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
