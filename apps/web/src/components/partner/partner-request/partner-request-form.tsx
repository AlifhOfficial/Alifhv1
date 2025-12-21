/**
 * Partner Request Form - User Application
 * 
 * Multi-step form for users to apply as partners
 * - Company details
 * - Contact information
 * - Business information
 * - Review & submit
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  usePartnerRequestSubmit, 
  usePartnerRequestValidate,
  type CreatePartnerRequestInput 
} from '@/hooks/partner';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Mail, 
  Phone, 
  FileText, 
  MapPin, 
  Globe,
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface PartnerRequestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

type FormStep = 'company' | 'contact' | 'business' | 'review';

const EMIRATES = [
  'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 
  'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'
];

const PARTNER_TYPES = [
  { value: 'dealer', label: 'Car Dealer', description: 'Independent car dealer' },
  { value: 'showroom', label: 'Showroom', description: 'Physical showroom location' },
  { value: 'multi_brand', label: 'Multi-Brand', description: 'Multiple car brands' },
  { value: 'rental', label: 'Rental Company', description: 'Car rental service' },
  { value: 'broker', label: 'Broker', description: 'Car brokerage service' },
  { value: 'other', label: 'Other', description: 'Other business type' },
] as const;

export function PartnerRequestForm({ onSuccess, onCancel }: PartnerRequestFormProps) {
  const { submit, isSubmitting, error, success, authRequired, authMessage, dismissAuth } = usePartnerRequestSubmit();
  const { validate, isValidating, validationResult } = usePartnerRequestValidate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<FormStep>('company');
  const [formData, setFormData] = useState<Partial<CreatePartnerRequestInput>>({
    partnerType: 'dealer',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (success) {
      toast({
        title: 'Application Submitted',
        description: 'Your partner application has been submitted for review.',
      });
      onSuccess?.();
    }
  }, [success, onSuccess, toast]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Submission Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const updateField = (field: keyof CreatePartnerRequestInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep = (step: FormStep): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 'company') {
      if (!formData.companyNameLegal?.trim()) {
        newErrors.companyNameLegal = 'Company name is required';
      }
      if (!formData.tradeLicense?.trim()) {
        newErrors.tradeLicense = 'Trade license is required';
      }
      if (!formData.tradeLicenseExpiry) {
        newErrors.tradeLicenseExpiry = 'Expiry date is required';
      }
      if (!formData.partnerType) {
        newErrors.partnerType = 'Business type is required';
      }
    }

    if (step === 'contact') {
      if (!formData.email?.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email address';
      }
      if (!formData.phone?.trim()) {
        newErrors.phone = 'Phone is required';
      } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Invalid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    const steps: FormStep[] = ['company', 'contact', 'business', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: FormStep[] = ['company', 'contact', 'business', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = () => {
    if (!validateStep('review')) return;

    const submissionData: CreatePartnerRequestInput = {
      companyNameLegal: formData.companyNameLegal!,
      email: formData.email!,
      phone: formData.phone!,
      tradeLicense: formData.tradeLicense!,
      tradeLicenseExpiry: formData.tradeLicenseExpiry!,
      partnerType: formData.partnerType!,
      vatNumber: formData.vatNumber,
      brandName: formData.brandName,
      tradeLicenseDocumentUrl: formData.tradeLicenseDocumentUrl,
      website: formData.website,
      address: formData.address,
      emirate: formData.emirate,
      description: formData.description,
      experienceYears: formData.experienceYears,
      specialties: formData.specialties,
    };

    submit(submissionData);
  };

  const handleValidateLicense = () => {
    if (formData.tradeLicense) {
      validate({ tradeLicense: formData.tradeLicense, checkType: 'license' });
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'company', label: 'Company' },
      { id: 'contact', label: 'Contact' },
      { id: 'business', label: 'Business' },
      { id: 'review', label: 'Review' },
    ];

    const currentIndex = steps.findIndex(s => s.id === currentStep);

    return (
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  index <= currentIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index < currentIndex ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span className="text-xs mt-2 font-medium">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 ${
                  index < currentIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCompanyStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          Legal Company Name <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={formData.companyNameLegal || ''}
            onChange={(e) => updateField('companyNameLegal', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="ABC Trading LLC"
          />
        </div>
        {errors.companyNameLegal && (
          <p className="text-xs text-destructive mt-1">{errors.companyNameLegal}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Brand Name (Optional)
        </label>
        <input
          type="text"
          value={formData.brandName || ''}
          onChange={(e) => updateField('brandName', e.target.value)}
          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="ABC Motors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Trade License Number <span className="text-destructive">*</span>
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={formData.tradeLicense || ''}
              onChange={(e) => updateField('tradeLicense', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="123456"
            />
          </div>
          <button
            type="button"
            onClick={handleValidateLicense}
            disabled={isValidating || !formData.tradeLicense}
            className="px-4 py-2.5 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Validate'}
          </button>
        </div>
        {errors.tradeLicense && (
          <p className="text-xs text-destructive mt-1">{errors.tradeLicense}</p>
        )}
        {validationResult && !validationResult.valid && (
          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            {validationResult.errors.join(', ')}
          </p>
        )}
        {validationResult && validationResult.valid && (
          <p className="text-xs text-primary mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Trade license available
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Trade License Expiry <span className="text-destructive">*</span>
        </label>
        <input
          type="date"
          value={formData.tradeLicenseExpiry || ''}
          onChange={(e) => updateField('tradeLicenseExpiry', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {errors.tradeLicenseExpiry && (
          <p className="text-xs text-destructive mt-1">{errors.tradeLicenseExpiry}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          VAT Number (Optional)
        </label>
        <input
          type="text"
          value={formData.vatNumber || ''}
          onChange={(e) => updateField('vatNumber', e.target.value)}
          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="123456789012345"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Business Type <span className="text-destructive">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {PARTNER_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => updateField('partnerType', type.value)}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                formData.partnerType === type.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-border/60'
              }`}
            >
              <div className="font-medium text-sm">{type.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{type.description}</div>
            </button>
          ))}
        </div>
        {errors.partnerType && (
          <p className="text-xs text-destructive mt-1">{errors.partnerType}</p>
        )}
      </div>
    </div>
  );

  const renderContactStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          Business Email <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => updateField('email', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="info@company.ae"
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Business Phone <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => updateField('phone', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="+971501234567"
          />
        </div>
        {errors.phone && (
          <p className="text-xs text-destructive mt-1">{errors.phone}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Website (Optional)
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="url"
            value={formData.website || ''}
            onChange={(e) => updateField('website', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="https://www.company.ae"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Business Address (Optional)
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <textarea
            value={formData.address || ''}
            onChange={(e) => updateField('address', e.target.value)}
            rows={3}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            placeholder="Street address, building, etc."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Emirate (Optional)
        </label>
        <select
          value={formData.emirate || ''}
          onChange={(e) => updateField('emirate', e.target.value)}
          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Select Emirate</option>
          {EMIRATES.map((emirate) => (
            <option key={emirate} value={emirate}>
              {emirate}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderBusinessStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          Business Description (Optional)
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          rows={4}
          maxLength={1000}
          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          placeholder="Tell us about your business..."
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formData.description?.length || 0}/1000
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Years of Experience (Optional)
        </label>
        <input
          type="number"
          min="0"
          max="100"
          value={formData.experienceYears || ''}
          onChange={(e) => updateField('experienceYears', parseInt(e.target.value) || undefined)}
          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="10"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Trade License Document (Optional)
        </label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            Upload your trade license document
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, JPG, PNG (Max 5MB)
          </p>
          <button
            type="button"
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
          >
            Choose File
          </button>
        </div>
        {formData.tradeLicenseDocumentUrl && (
          <p className="text-xs text-primary mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Document uploaded
          </p>
        )}
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-lg mb-4">Application Summary</h3>
        
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Company Name</p>
            <p className="font-medium">{formData.companyNameLegal}</p>
          </div>
          
          {formData.brandName && (
            <div>
              <p className="text-xs text-muted-foreground">Brand Name</p>
              <p className="font-medium">{formData.brandName}</p>
            </div>
          )}
          
          <div>
            <p className="text-xs text-muted-foreground">Business Type</p>
            <p className="font-medium">
              {PARTNER_TYPES.find(t => t.value === formData.partnerType)?.label}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">Trade License</p>
            <p className="font-medium">{formData.tradeLicense}</p>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">Contact Email</p>
            <p className="font-medium">{formData.email}</p>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">Contact Phone</p>
            <p className="font-medium">{formData.phone}</p>
          </div>

          {formData.emirate && (
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="font-medium">{formData.emirate}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          By submitting this application, you agree to our terms and conditions. 
          Our team will review your application within 1-2 business days.
        </p>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'company':
        return renderCompanyStep();
      case 'contact':
        return renderContactStep();
      case 'business':
        return renderBusinessStep();
      case 'review':
        return renderReviewStep();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Partner Application</h2>
        <p className="text-muted-foreground">
          Complete the form below to apply as a partner
        </p>
      </div>

      {renderStepIndicator()}

      <div className="bg-card rounded-lg border border-border p-8 mb-6">
        {renderStepContent()}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={currentStep === 'company' ? onCancel : handleBack}
          className="px-6 py-2.5 border border-border rounded-lg font-medium hover:bg-muted/50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {currentStep === 'company' ? 'Cancel' : 'Back'}
        </button>

        {currentStep !== 'review' ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit Application
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>

      {authRequired && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4">
            <h3 className="font-semibold text-lg mb-2">Sign In Required</h3>
            <p className="text-muted-foreground mb-4">{authMessage}</p>
            <button
              onClick={dismissAuth}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
