/**
 * Company Identity Section Component
 */

"use client";

interface CompanyIdentitySectionProps {
  companyNameLegal: string;
  brandName: string;
  website: string;
  foundedYear: number;
  experienceYears: number;
  description: string;
  isEditing: boolean;
  onBrandNameChange: (value: string) => void;
  onWebsiteChange: (value: string) => void;
  onExperienceYearsChange: (value: number) => void;
  onDescriptionChange: (value: string) => void;
}

export function CompanyIdentitySection({
  companyNameLegal,
  brandName,
  website,
  foundedYear,
  experienceYears,
  description,
  isEditing,
  onBrandNameChange,
  onWebsiteChange,
  onExperienceYearsChange,
  onDescriptionChange,
}: CompanyIdentitySectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Legal Company Name
          </label>
          <p className="h-10 px-3 flex items-center text-sm text-foreground">
            {companyNameLegal || '—'}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Brand Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={brandName}
              onChange={(e) => onBrandNameChange(e.target.value)}
              placeholder="Luxury Motors"
              className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          ) : (
            <p className="h-10 px-3 flex items-center text-sm text-foreground">
              {brandName || '—'}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Website
        </label>
        {isEditing ? (
          <input
            type="url"
            value={website}
            onChange={(e) => onWebsiteChange(e.target.value)}
            placeholder="https://luxurymotors.ae"
            className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        ) : (
          <p className="h-10 px-3 flex items-center text-sm text-foreground">
            {website || '—'}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Description
        </label>
        {isEditing ? (
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Tell us about your business..."
            rows={3}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        ) : (
          <p className="px-3 py-2 text-sm text-foreground leading-relaxed">
            {description || '—'}
          </p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Founded Year
          </label>
          <p className="h-10 px-3 flex items-center text-sm text-foreground">
            {foundedYear || '—'}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Years of Experience
          </label>
          {isEditing ? (
            <input
              type="number"
              value={experienceYears}
              onChange={(e) => onExperienceYearsChange(parseInt(e.target.value) || 0)}
              placeholder="10"
              min="0"
              max="100"
              className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          ) : (
            <p className="h-10 px-3 flex items-center text-sm text-foreground">
              {experienceYears > 0 ? `${experienceYears} years` : '—'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
