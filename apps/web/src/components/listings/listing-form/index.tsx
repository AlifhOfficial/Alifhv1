/**
 * Listing Form Component - Clean Onboarding Style
 * 
 * Minimal 3-step form with proper color accents.
 * Blue for actions, green for success states.
 * 
 * @module components/listings/listing-form
 */

'use client';

import { useState, useCallback } from 'react';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
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
  
  // Step titles for storyline
  const stepTitles = {
    vin: 'Identify Your Vehicle',
    details: 'Add Specifications',
    publish: 'Set Price & Photos',
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Header with cancel and step dots */}
      <header className="mb-10">
        <div className="flex items-center justify-between mb-4">
          {/* Step Dots - left side */}
          <div className="flex items-center gap-2">
            {FORM_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              
              return (
                <button
                  key={step.id}
                  onClick={() => index < currentStepIndex && setCurrentStep(step.id)}
                  disabled={index > currentStepIndex}
                  className="flex items-center gap-1"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <span className={cn(
                      "w-3 h-3 rounded-full transition-all bg-muted-foreground/30"
                    )} />
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Cancel button - right side */}
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
            >
              Cancel listing
            </button>
          )}
        </div>
        
        {/* Title - step specific */}
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {mode === 'edit' ? 'Edit Listing' : stepTitles[currentStep]}
        </h1>
      </header>

      {/* Form Content */}
      <main className="mb-10">
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
          <div className="mt-8 p-4 bg-red-500/10 rounded-xl">
            <p className="text-sm font-semibold text-red-500 mb-2">Please fix:</p>
            <ul className="space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field} className="text-sm text-red-500/90 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      {/* Navigation Footer */}
      <footer className="flex items-center justify-between pt-6 border-t border-border/20">
        <div>
          {currentStepIndex > 0 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {onSaveDraft && (
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-full text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
            >
              Save Draft
            </button>
          )}
          
          {currentStepIndex < FORM_STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-500 text-white text-base font-semibold hover:bg-blue-600 transition-colors"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-green-500 text-white text-base font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
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
      </footer>
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
