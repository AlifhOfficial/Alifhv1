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

import { useState, useCallback } from 'react';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/utils';
import {
  type FormStep,
  type ListingFormData,
  type ListingFormProps,
  FORM_STEPS,
  getDefaultFormValues,
  validateStep,
} from './types';
import { VINStep, DetailsStep, PublishStep } from './steps';

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

// ============================================================================
// MAIN FORM COMPONENT
// ============================================================================

export function ListingForm({
  mode,
  initialData,
  onSubmit,
  onSaveDraft,
  onCancel,
  isStaff: _isStaff,
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
    // Derive condition automatically (no UI): < 5000 km => new
    const derivedCondition: ListingFormData['condition'] =
      typeof formData.mileage === 'number' && formData.mileage < 5000 ? 'new' : 'used';
    const submitData = { ...formData, condition: derivedCondition };

    for (const step of FORM_STEPS) {
      const result = validateStep(step.id, submitData);
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
      await onSubmit(submitData as ListingFormData);
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
        const derivedCondition: ListingFormData['condition'] =
          typeof formData.mileage === 'number' && formData.mileage < 5000 ? 'new' : 'used';
        await onSaveDraft({ ...formData, condition: derivedCondition });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-10">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="p-2.5 hover:bg-muted/20 rounded-xl transition-all duration-200 mt-0.5"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground/60" />
            </button>
          )}
          <div className="space-y-1.5">
            <h1 className="text-[24px] sm:text-[28px] font-bold tracking-tight">
              {mode === 'edit' ? 'Edit Listing' : 'New Listing'}
            </h1>
            <p className="text-[15px] text-muted-foreground">
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
                "flex items-center gap-2.5 px-4 py-2.5 rounded-full text-[14px] font-semibold transition-colors",
                index === currentStepIndex && "bg-foreground text-background",
                index < currentStepIndex && "bg-muted/20 text-foreground cursor-pointer hover:bg-muted/30",
                index > currentStepIndex && "text-muted-foreground/50"
              )}
            >
              <span className={cn(
                "w-7 h-7 flex items-center justify-center rounded-full text-[12px] font-bold",
                index === currentStepIndex && "bg-background/20 text-background",
                index < currentStepIndex && "bg-foreground/10 text-foreground",
                index > currentStepIndex && "bg-muted/20 text-muted-foreground/50"
              )}>{index + 1}</span>
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
          <div className="mt-6 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
            <p className="text-[14px] font-semibold text-red-600 mb-2">Please fix the following:</p>
            <ul className="text-[13px] text-red-600/90 space-y-1.5">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field} className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Navigation */}
      <section className="flex items-center justify-between pt-6 border-t border-border/30">
        <div className="flex gap-3">
          {currentStepIndex > 0 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-full border border-border/40 text-[14px] font-semibold text-muted-foreground hover:bg-muted/10 hover:text-foreground transition-all duration-200 flex items-center gap-2"
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
              className="px-5 py-2.5 rounded-full border border-border/40 text-[14px] font-semibold text-muted-foreground hover:bg-muted/10 hover:text-foreground transition-all duration-200"
            >
              Save Draft
            </button>
          )}
          
          {currentStepIndex < FORM_STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-full bg-foreground text-background text-[15px] font-semibold hover:bg-foreground/90 transition-colors flex items-center gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-full bg-primary text-primary-foreground text-[15px] font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
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

// Re-export types and components for external use
export * from './types';
export * from './constants';
export { Combobox } from './combobox';
export { FormField } from './form-field';
export { VINInput } from './vin-input';
export { DecodedVehiclePreview } from './decoded-preview';
