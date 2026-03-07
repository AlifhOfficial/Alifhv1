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
  // In edit mode, only allow details and publish steps (skip VIN)
  const editableSteps = mode === 'edit' 
    ? FORM_STEPS.filter(s => s.id !== 'vin') 
    : FORM_STEPS;
  
  const [currentStep, setCurrentStep] = useState<FormStep>(mode === 'edit' ? 'details' : 'vin');
  const [formData, setFormData] = useState<Partial<ListingFormData>>(() => ({
    ...getDefaultFormValues(),
    ...initialData,
    partnerId: partnerId || initialData?.partnerId,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentStepIndex = editableSteps.findIndex(s => s.id === currentStep);
  
  // Check if draft can be saved (DB requires make, model, year, mileage, price, emirate)
  const canSaveDraft = Boolean(
    formData.make && 
    formData.model && 
    formData.year && 
    typeof formData.mileage === 'number' && 
    typeof formData.price === 'number' && 
    formData.emirate
  );
  
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
      if (nextIndex < editableSteps.length) {
        setCurrentStep(editableSteps[nextIndex].id);
      }
    }
  };
  
  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(editableSteps[prevIndex].id);
    }
  };
  
  const handleSubmit = async () => {
    const derivedCondition: ListingFormData['condition'] =
      typeof formData.mileage === 'number' && formData.mileage < 5000 ? 'new' : 'used';
    const submitData = { ...formData, condition: derivedCondition };

    // In edit mode, only validate editable steps (details & publish)
    const stepsToValidate = mode === 'edit' ? editableSteps : FORM_STEPS;
    for (const step of stepsToValidate) {
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
    <div className="pb-12 sm:pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header with cancel and progress bars */}
      <header className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          {/* Progress Bars - macOS welcome style with varying widths */}
          <div className="flex items-center gap-1.5 mr-4">
            {editableSteps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              // macOS style: progressively wider bars (small → medium → large)
              const widths = ['w-8', 'w-14', 'w-20'];
              const widthClass = widths[index] || 'w-14';
              
              return (
                <button
                  key={step.id}
                  onClick={() => index < currentStepIndex && setCurrentStep(step.id)}
                  disabled={index > currentStepIndex}
                  className={cn(
                    "h-1 rounded-full transition-all duration-500 ease-out",
                    widthClass,
                    isCompleted || isCurrent 
                      ? "bg-sidebar-foreground" 
                      : "bg-sidebar-foreground/15"
                  )}
                />
              );
            })}
          </div>
          
          {/* Cancel button - right side */}
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="text-xs sm:text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
        
        {/* Title - step specific */}
        <h1 className="text-base sm:text-xl font-semibold tracking-tight text-sidebar-foreground">
          {mode === 'edit' ? 'Edit Listing' : stepTitles[currentStep]}
        </h1>
        <p className="text-[11px] sm:text-sm text-sidebar-foreground/60 mt-0.5">
          Step {currentStepIndex + 1} of {editableSteps.length}
        </p>
      </header>

      {/* Form Content */}
      <main className="mb-6 sm:mb-8">
        {currentStep === 'vin' && mode !== 'edit' && (
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
        
        {/* Error Summary - exclude errors already shown inline in current step */}
        {Object.keys(errors).filter(key => {
          // VIN error is shown inline in VINInput on vin step
          if (currentStep === 'vin' && key === 'vin') return false;
          return true;
        }).length > 0 && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl border border-red-500/30 bg-red-500/5">
            <p className="text-[11px] sm:text-xs font-bold text-red-500 mb-1.5 sm:mb-2">Please fix:</p>
            <ul className="space-y-1">
              {Object.entries(errors)
                .filter(([field]) => !(currentStep === 'vin' && field === 'vin'))
                .map(([field, error]) => (
                <li key={field} className="text-[11px] sm:text-xs text-red-500/90 flex items-center gap-1.5 sm:gap-2">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-red-500 shrink-0" />
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      {/* Navigation Footer */}
      <footer className="flex items-center justify-between pt-4 sm:pt-6">
        <div>
          {currentStepIndex > 0 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Back
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          {onSaveDraft && canSaveDraft && (
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="hidden sm:block px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
            >
              Save Draft
            </button>
          )}
          
          {currentStepIndex < editableSteps.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Continue
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50",
                mode === 'edit' 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-green-500 text-white hover:bg-green-600"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  <span className="hidden sm:inline">{mode === 'edit' ? 'Updating...' : 'Publishing...'}</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : mode === 'edit' ? (
                <span className="whitespace-nowrap">Update Listing</span>
              ) : (
                <span className="whitespace-nowrap">Publish Listing</span>
              )}
            </button>
          )}
        </div>
      </footer>
      </div>
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
