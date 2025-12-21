/**
 * Become Partner Public Form
 * 
 * Public version of partner application form
 * Users enter their email to link to their account
 * No authentication required for initial submission
 */

'use client';

import { useState, useEffect } from 'react';
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
  ArrowLeft,
  User
} from 'lucide-react';

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

interface FormData {
  userEmail: string;
  companyNameLegal: string;
  email: string;
  phone: string;
  tradeLicense: string;
  tradeLicenseExpiry: string;
  partnerType: string;
  vatNumber?: string;
  brandName?: string;
  tradeLicenseDocumentUrl?: string;
  website?: string;
  address?: string;
  emirate?: string;
  description?: string;
  experienceYears?: number;
  specialties?: string[];
}

export function BecomePartnerPublicForm() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<FormStep>('company');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState<Partial<FormData>>({
    partnerType: 'dealer',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep = (step: FormStep): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 'company') {
      if (!formData.userEmail?.trim()) {
        newErrors.userEmail = 'Your email is required to link your application';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)) {
        newErrors.userEmail = 'Invalid email address';
      }
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
        newErrors.email = 'Business email is required';
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

  const handleSubmit = async () => {
    if (!validateStep('review')) return;

    setIsSubmitting(true);

    try {
      // Note: This would need a special public API endpoint that:
      // 1. Finds or creates user by email
      // 2. Creates partner request linked to that user
      const response = await fetch('/api/partners/request/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.error('API validation errors:', data.details);
        
        // Set field-specific errors if available
        if (data.details && Array.isArray(data.details)) {
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((err: any) => {
            if (err.field) {
              fieldErrors[err.field] = err.message;
            }
          });
          setErrors(fieldErrors);
        }
        
        throw new Error(data.error || 'Failed to submit application');
      }

      setSubmitted(true);
      toast({
        title: 'Application Submitted!',
        description: 'Thank you for your interest. We will review your application and contact you soon.',
      });
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
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
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Note:</strong> Enter your Alifh account email below. If you don't have an account yet, 
          we'll create one for you and send you a verification link.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Your Email Address (Alifh Account) <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="email"
            value={formData.userEmail || ''}
            onChange={(e) => updateField('userEmail', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="your.email@example.com"
          />
        </div>
        {errors.userEmail && (
          <p className="text-xs text-destructive mt-1">{errors.userEmail}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          We'll use this email to create or link your Alifh account
        </p>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="font-semibold mb-4">Company Information</h3>

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
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={formData.tradeLicense || ''}
                onChange={(e) => updateField('tradeLicense', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="123456"
              />
            </div>
            {errors.tradeLicense && (
              <p className="text-xs text-destructive mt-1">{errors.tradeLicense}</p>
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
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-lg mb-4">Application Summary</h3>
        
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Your Email</p>
            <p className="font-medium">{formData.userEmail}</p>
          </div>
          
          <div className="border-t border-border pt-3">
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
            <p className="text-xs text-muted-foreground">Business Email</p>
            <p className="font-medium">{formData.email}</p>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">Business Phone</p>
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
          Our team will review your application within 1-2 business days and contact you via email.
        </p>
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-950/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-500" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Application Submitted!</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Thank you for your interest in becoming a partner. Our team will review your application 
          and contact you at <strong>{formData.userEmail}</strong> within 1-2 business days.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Return to Home
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

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
    <div className="max-w-3xl mx-auto">
      {renderStepIndicator()}

      <div className="bg-card rounded-lg border border-border p-8 mb-6">
        {renderStepContent()}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 'company'}
          className="px-6 py-2.5 border border-border rounded-lg font-medium hover:bg-muted/50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
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
    </div>
  );
}
