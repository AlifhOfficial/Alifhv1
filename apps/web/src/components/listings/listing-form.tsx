/**
 * Listing Form Component - Alifh Design System
 * Multi-step form for creating/editing car listings
 */

'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/forms/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/forms/select';
import { ImageUpload } from '@/components/ui/forms/image-upload';
import { Car, MapPin, Camera, Wrench, FileText } from 'lucide-react';

interface ListingFormData {
  // Basic Info
  make: string;
  model: string;
  year: number;
  trim?: string;
  vin?: string;
  
  // Pricing
  price: number;
  currency?: string;
  isNegotiable?: boolean;
  
  // Specifications
  mileage: number;
  specs: string;
  steeringSide: string;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  engineSize?: string;
  engineType?: string;
  cylinders?: number;
  doors?: string;
  seatingCapacity?: string;
  exteriorColor?: string;
  interiorColor?: string;
  
  // Status
  exportStatus?: string;
  warrantyType?: string;
  sellerType?: string;
  
  // Location
  emirate: string;
  city?: string;
  
  // Media
  thumbnail?: string;
  images?: string[];
  videoUrl?: string;
  
  // Description
  description?: string;
  
  // Partner (optional)
  partnerId?: string;
}

interface ListingFormProps {
  initialData?: Partial<ListingFormData>;
  isEditing?: boolean;
  onSubmit: (data: ListingFormData, isDraft: boolean) => Promise<void>;
  onCancel?: () => void;
}

type FormStep = 'basic' | 'specs' | 'location' | 'media' | 'description';

const STEPS: { id: FormStep; label: string; icon: any }[] = [
  { id: 'basic', label: 'Basic Info', icon: Car },
  { id: 'specs', label: 'Specifications', icon: Wrench },
  { id: 'location', label: 'Location & Price', icon: MapPin },
  { id: 'media', label: 'Photos & Video', icon: Camera },
  { id: 'description', label: 'Description', icon: FileText },
];

export function ListingForm({ initialData, isEditing, onSubmit, onCancel }: ListingFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('basic');
  const [formData, setFormData] = useState<Partial<ListingFormData>>(initialData || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const updateField = (field: keyof ListingFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (step: FormStep): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 'basic') {
      if (!formData.make) newErrors.make = 'Make is required';
      if (!formData.model) newErrors.model = 'Model is required';
      if (!formData.year) newErrors.year = 'Year is required';
      if (formData.year && (formData.year < 1900 || formData.year > new Date().getFullYear() + 1)) {
        newErrors.year = 'Invalid year';
      }
    }

    if (step === 'specs') {
      if (!formData.specs) newErrors.specs = 'Specs region is required';
      if (!formData.steeringSide) newErrors.steeringSide = 'Steering side is required';
      if (!formData.mileage && formData.mileage !== 0) newErrors.mileage = 'Mileage is required';
      if (formData.mileage && formData.mileage < 0) newErrors.mileage = 'Invalid mileage';
    }

    if (step === 'location') {
      if (!formData.emirate) newErrors.emirate = 'Emirate is required';
      if (!formData.price) newErrors.price = 'Price is required';
      if (formData.price && formData.price <= 0) newErrors.price = 'Invalid price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < STEPS.length) {
        setCurrentStep(STEPS[nextIndex].id);
      }
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };

  const handleSubmit = async (isDraft: boolean) => {
    // Validate all required steps
    const stepsToValidate: FormStep[] = ['basic', 'specs', 'location'];
    let allValid = true;
    for (const step of stepsToValidate) {
      if (!validateStep(step)) {
        allValid = false;
        setCurrentStep(step);
        break;
      }
    }

    if (!allValid && !isDraft) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData as ListingFormData, isDraft);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : isCompleted
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-muted text-muted-foreground hover:bg-secondary/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                  <span className={`text-xs mt-2 ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-4 ${isCompleted ? 'bg-green-500' : 'bg-border'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="rounded-xl border border-border p-8 space-y-8">
        {/* Basic Info Step */}
        {currentStep === 'basic' && (
          <section className="space-y-8">
            <div className="border-b border-border/40 pb-2">
              <h2 className="text-lg font-medium tracking-tight">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Car className="w-3.5 h-3.5 text-muted-foreground" />
                  Make *
                </label>
                <input
                  value={formData.make || ''}
                  onChange={(e) => updateField('make', e.target.value)}
                  placeholder="e.g. Toyota"
                  className={`w-full h-10 bg-transparent border-b focus:border-foreground outline-none transition-colors px-0 ${
                    errors.make ? 'border-red-500' : 'border-border'
                  }`}
                />
                {errors.make && <p className="text-xs text-red-500">{errors.make}</p>}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Model *</label>
                <input
                  value={formData.model || ''}
                  onChange={(e) => updateField('model', e.target.value)}
                  placeholder="e.g. Camry"
                  className={`w-full h-10 bg-transparent border-b focus:border-foreground outline-none transition-colors px-0 ${
                    errors.model ? 'border-red-500' : 'border-border'
                  }`}
                />
                {errors.model && <p className="text-xs text-red-500">{errors.model}</p>}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Year *</label>
                <input
                  type="number"
                  value={formData.year || ''}
                  onChange={(e) => updateField('year', parseInt(e.target.value))}
                  placeholder="e.g. 2022"
                  className={`w-full h-10 bg-transparent border-b focus:border-foreground outline-none transition-colors px-0 ${
                    errors.year ? 'border-red-500' : 'border-border'
                  }`}
                />
                {errors.year && <p className="text-xs text-red-500">{errors.year}</p>}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Trim</label>
                <input
                  value={formData.trim || ''}
                  onChange={(e) => updateField('trim', e.target.value)}
                  placeholder="e.g. Sport, Limited"
                  className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors px-0"
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="text-sm font-medium">VIN (Vehicle Identification Number)</label>
                <input
                  value={formData.vin || ''}
                  onChange={(e) => updateField('vin', e.target.value)}
                  placeholder="17-character VIN"
                  maxLength={17}
                  className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors px-0"
                />
              </div>
            </div>
          </section>
        )}

        {/* Specifications Step */}
        {currentStep === 'specs' && (
          <section className="space-y-8">
            <div className="border-b border-border/40 pb-2">
              <h2 className="text-lg font-medium tracking-tight">Specifications</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-medium">Specs Region *</label>
                <Select value={formData.specs || ''} onValueChange={(value) => updateField('specs', value)}>
                  <SelectTrigger className={`h-10 border-0 border-b rounded-none bg-transparent ${errors.specs ? 'border-red-500' : 'border-border'}`}>
                    <SelectValue placeholder="Select specs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gcc">GCC</SelectItem>
                    <SelectItem value="american">American</SelectItem>
                    <SelectItem value="european">European</SelectItem>
                    <SelectItem value="japanese">Japanese</SelectItem>
                    <SelectItem value="canadian">Canadian</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.specs && <p className="text-xs text-red-500">{errors.specs}</p>}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Steering Side *</label>
                <Select value={formData.steeringSide || ''} onValueChange={(value) => updateField('steeringSide', value)}>
                  <SelectTrigger className={`h-10 border-0 border-b rounded-none bg-transparent ${errors.steeringSide ? 'border-red-500' : 'border-border'}`}>
                    <SelectValue placeholder="Select steering side" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
                {errors.steeringSide && <p className="text-xs text-red-500">{errors.steeringSide}</p>}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Mileage (km) *</label>
                <input
                  type="number"
                  value={formData.mileage || ''}
                  onChange={(e) => updateField('mileage', parseInt(e.target.value))}
                  placeholder="e.g. 50000"
                  className={`w-full h-10 bg-transparent border-b focus:border-foreground outline-none transition-colors px-0 ${
                    errors.mileage ? 'border-red-500' : 'border-border'
                  }`}
                />
                {errors.mileage && <p className="text-xs text-red-500">{errors.mileage}</p>}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Body Type</label>
                <Select value={formData.bodyType || ''} onValueChange={(value) => updateField('bodyType', value)}>
                  <SelectTrigger className="h-10 border-0 border-b border-border rounded-none bg-transparent">
                    <SelectValue placeholder="Select body type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="coupe">Coupe</SelectItem>
                    <SelectItem value="convertible">Convertible</SelectItem>
                    <SelectItem value="hatchback">Hatchback</SelectItem>
                    <SelectItem value="wagon">Wagon</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Fuel Type</label>
                <Select value={formData.fuelType || ''} onValueChange={(value) => updateField('fuelType', value)}>
                  <SelectTrigger className="h-10 border-0 border-b border-border rounded-none bg-transparent">
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="plugin_hybrid">Plug-in Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Transmission</label>
                <Select value={formData.transmission || ''} onValueChange={(value) => updateField('transmission', value)}>
                  <SelectTrigger className="h-10 border-0 border-b border-border rounded-none bg-transparent">
                    <SelectValue placeholder="Select transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="cvt">CVT</SelectItem>
                    <SelectItem value="dct">DCT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Exterior Color</label>
                <Select value={formData.exteriorColor || ''} onValueChange={(value) => updateField('exteriorColor', value)}>
                  <SelectTrigger className="h-10 border-0 border-b border-border rounded-none bg-transparent">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="white">White</SelectItem>
                    <SelectItem value="black">Black</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="grey">Grey</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Interior Color</label>
                <Select value={formData.interiorColor || ''} onValueChange={(value) => updateField('interiorColor', value)}>
                  <SelectTrigger className="h-10 border-0 border-b border-border rounded-none bg-transparent">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="black">Black</SelectItem>
                    <SelectItem value="beige">Beige</SelectItem>
                    <SelectItem value="brown">Brown</SelectItem>
                    <SelectItem value="tan">Tan</SelectItem>
                    <SelectItem value="grey">Grey</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
        )}

        {/* Location & Price Step */}
        {currentStep === 'location' && (
          <section className="space-y-8">
            <div className="border-b border-border/40 pb-2">
              <h2 className="text-lg font-medium tracking-tight">Location & Pricing</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-medium">Emirate *</label>
                <Select value={formData.emirate || ''} onValueChange={(value) => updateField('emirate', value)}>
                  <SelectTrigger className={`h-10 border-0 border-b rounded-none bg-transparent ${errors.emirate ? 'border-red-500' : 'border-border'}`}>
                    <SelectValue placeholder="Select emirate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
                    <SelectItem value="Dubai">Dubai</SelectItem>
                    <SelectItem value="Sharjah">Sharjah</SelectItem>
                    <SelectItem value="Ajman">Ajman</SelectItem>
                    <SelectItem value="Umm Al Quwain">Umm Al Quwain</SelectItem>
                    <SelectItem value="Ras Al Khaimah">Ras Al Khaimah</SelectItem>
                    <SelectItem value="Fujairah">Fujairah</SelectItem>
                  </SelectContent>
                </Select>
                {errors.emirate && <p className="text-xs text-red-500">{errors.emirate}</p>}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">City</label>
                <input
                  value={formData.city || ''}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="e.g. Dubai Marina"
                  className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors px-0"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Price (AED) *</label>
                <input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => updateField('price', parseInt(e.target.value))}
                  placeholder="e.g. 125000"
                  className={`w-full h-10 bg-transparent border-b focus:border-foreground outline-none transition-colors px-0 ${
                    errors.price ? 'border-red-500' : 'border-border'
                  }`}
                />
                {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
              </div>

              <div className="flex items-center pt-4">
                <label className="flex items-center gap-3 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={formData.isNegotiable || false}
                    onChange={(e) => updateField('isNegotiable', e.target.checked)}
                    className="w-4 h-4 rounded border-border accent-blue-500"
                  />
                  Price is negotiable
                </label>
              </div>
            </div>
          </section>
        )}

        {/* Media Step */}
        {currentStep === 'media' && (
          <section className="space-y-8">
            <div className="border-b border-border/40 pb-2">
              <h2 className="text-lg font-medium tracking-tight">Photos & Video</h2>
            </div>
            
            <div className="space-y-8">
              <ImageUpload
                value={formData.images || []}
                onChange={(urls) => updateField('images', urls)}
                maxImages={20}
                directory="listings"
                label="Vehicle Photos"
                description="Add up to 20 high-quality images. First image will be the thumbnail."
              />

              <div className="space-y-3">
                <label className="text-sm font-medium">Video URL (Optional)</label>
                <input
                  value={formData.videoUrl || ''}
                  onChange={(e) => updateField('videoUrl', e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  className="w-full h-10 bg-transparent border-b border-border focus:border-foreground outline-none transition-colors px-0"
                />
                <p className="text-xs text-muted-foreground">
                  Add a YouTube or Vimeo video link for a virtual tour
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Description Step */}
        {currentStep === 'description' && (
          <section className="space-y-8">
            <div className="border-b border-border/40 pb-2">
              <h2 className="text-lg font-medium tracking-tight">Description & Details</h2>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe your vehicle, its condition, features, and any other relevant details..."
                rows={8}
                className="w-full bg-transparent border border-border rounded-xl p-4 focus:border-foreground outline-none transition-colors resize-none"
              />
              <p className="text-xs text-muted-foreground">
                A detailed description helps buyers understand your vehicle better
              </p>
            </div>
          </section>
        )}

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-500 font-medium mb-2">Please fix the following errors:</p>
            <ul className="text-sm text-red-500 space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-border/40">
          <div className="flex gap-3">
            {currentStepIndex > 0 && (
              <button
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-sm transition-colors disabled:opacity-50"
              >
                Back
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-sm transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex gap-3">
            {currentStepIndex === STEPS.length - 1 ? (
              <>
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-full border border-border hover:bg-secondary/10 text-sm transition-colors disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : isEditing ? 'Update Listing' : 'Publish Listing'}
                </button>
              </>
            ) : (
              <button 
                onClick={handleNext} 
                disabled={isSubmitting}
                className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm transition-colors disabled:opacity-50"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
