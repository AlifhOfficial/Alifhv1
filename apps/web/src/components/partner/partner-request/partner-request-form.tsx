/**
 * Partner Request Form - Simplified (7 Required Fields)
 * 
 * Single-page form for authenticated users to apply as partners
 * Required fields only:
 * - companyNameLegal, tradeLicense, tradeLicenseExpiry
 * - tradeLicenseDocumentUrl, vatNumber, partnerType, companySize
 */

'use client';

import { useState } from 'react';
import { usePartnerRequestSubmit, type CreatePartnerRequestInput } from '@/hooks/partner';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  FileText, 
  Upload,
  CheckCircle2,
  Loader2,
  Calendar,
} from 'lucide-react';

const PARTNER_TYPES = [
  { value: 'car_dealer', label: 'Car Dealer', description: 'Independent car dealership' },
  { value: 'showroom', label: 'Showroom', description: 'Physical showroom location' },
] as const;

const COMPANY_SIZES = [
  { value: 'small', label: 'Small', description: '1-10 employees' },
  { value: 'medium', label: 'Medium', description: '11-50 employees' },
  { value: 'large', label: 'Large', description: '51-200 employees' },
  { value: 'enterprise', label: 'Enterprise', description: '200+ employees' },
] as const;

interface PartnerRequestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PartnerRequestForm({ onSuccess, onCancel }: PartnerRequestFormProps) {
  const { submit, isSubmitting, error, success } = usePartnerRequestSubmit();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<CreatePartnerRequestInput>>({
    partnerType: 'car_dealer',
    companySize: 'small',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof CreatePartnerRequestInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyNameLegal?.trim()) {
      newErrors.companyNameLegal = 'Company name is required';
    }
    if (!formData.tradeLicense?.trim()) {
      newErrors.tradeLicense = 'Trade license number is required';
    }
    if (!formData.tradeLicenseExpiry) {
      newErrors.tradeLicenseExpiry = 'Expiry date is required';
    } else {
      const expiry = new Date(formData.tradeLicenseExpiry);
      if (expiry <= new Date()) {
        newErrors.tradeLicenseExpiry = 'Trade license must be valid';
      }
    }
    if (!formData.tradeLicenseDocumentUrl?.trim()) {
      newErrors.tradeLicenseDocumentUrl = 'Document URL is required';
    }
    if (!formData.vatNumber?.trim()) {
      newErrors.vatNumber = 'VAT number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields correctly',
        variant: 'destructive',
      });
      return;
    }

    await submit(formData as CreatePartnerRequestInput);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-950/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-500" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Application Submitted!</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Thank you for your interest in becoming a partner. We will review your application and contact you soon.
        </p>
        <button
          onClick={onSuccess}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
      {/* Company Information */}
      <section className="bg-card rounded-lg border border-border p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">Company Information</h2>
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Company Legal Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={formData.companyNameLegal || ''}
            onChange={(e) => updateField('companyNameLegal', e.target.value)}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Company LLC"
            required
          />
          {errors.companyNameLegal && (
            <p className="text-xs text-destructive mt-1">{errors.companyNameLegal}</p>
          )}
        </div>

        {/* Partner Type */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Business Type <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {PARTNER_TYPES.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => updateField('partnerType', type.value)}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  formData.partnerType === type.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-border/60'
                }`}
              >
                <p className="font-medium">{type.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Company Size */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Company Size <span className="text-destructive">*</span>
          </label>
          <select
            value={formData.companySize || 'small'}
            onChange={(e) => updateField('companySize', e.target.value)}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          >
            {COMPANY_SIZES.map(size => (
              <option key={size.value} value={size.value}>
                {size.label} - {size.description}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Legal Documents */}
      <section className="bg-card rounded-lg border border-border p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">Legal Documents</h2>
        </div>

        {/* Trade License */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Trade License Number <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={formData.tradeLicense || ''}
            onChange={(e) => updateField('tradeLicense', e.target.value)}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="TL-123456"
            required
          />
          {errors.tradeLicense && (
            <p className="text-xs text-destructive mt-1">{errors.tradeLicense}</p>
          )}
        </div>

        {/* Trade License Expiry */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Trade License Expiry Date <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="date"
              value={formData.tradeLicenseExpiry || ''}
              onChange={(e) => updateField('tradeLicenseExpiry', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          {errors.tradeLicenseExpiry && (
            <p className="text-xs text-destructive mt-1">{errors.tradeLicenseExpiry}</p>
          )}
        </div>

        {/* Trade License Document */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Trade License Document URL <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="url"
              value={formData.tradeLicenseDocumentUrl || ''}
              onChange={(e) => updateField('tradeLicenseDocumentUrl', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="https://..."
              required
            />
          </div>
          {errors.tradeLicenseDocumentUrl && (
            <p className="text-xs text-destructive mt-1">{errors.tradeLicenseDocumentUrl}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Upload your document to cloud storage and paste the URL here
          </p>
        </div>

        {/* VAT Number */}
        <div>
          <label className="block text-sm font-medium mb-2">
            VAT Registration Number <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={formData.vatNumber || ''}
            onChange={(e) => updateField('vatNumber', e.target.value)}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="100123456789003"
            required
          />
          {errors.vatNumber && (
            <p className="text-xs text-destructive mt-1">{errors.vatNumber}</p>
          )}
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2.5 border border-border rounded-lg font-medium hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm text-destructive">{error.message}</p>
        </div>
      )}
    </form>
  );
}
