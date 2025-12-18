/**
 * Example usage of PartnerProfilePreviewButton
 * This shows how to use the preview button in different contexts
 */

'use client';

import { PartnerProfilePreviewButton } from '@/components/partner';

export default function PartnerPreviewExample() {
  // Example partner IDs from your database
  const examplePartnerId = "partner_example_id";

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Partner Profile Preview Examples</h1>
          <p className="text-muted-foreground">
            Click any button to preview the partner profile modal
          </p>
        </div>

        {/* Default variant */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Outline Variant (Default)</h2>
          <div className="flex gap-3">
            <PartnerProfilePreviewButton 
              partnerId={examplePartnerId}
              variant="outline"
              size="sm"
            />
            <PartnerProfilePreviewButton 
              partnerId={examplePartnerId}
              variant="outline"
              size="md"
            />
            <PartnerProfilePreviewButton 
              partnerId={examplePartnerId}
              variant="outline"
              size="lg"
            />
          </div>
        </div>

        {/* Primary variant */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Primary Variant</h2>
          <div className="flex gap-3">
            <PartnerProfilePreviewButton 
              partnerId={examplePartnerId}
              variant="default"
              size="sm"
            />
            <PartnerProfilePreviewButton 
              partnerId={examplePartnerId}
              variant="default"
              size="md"
            />
            <PartnerProfilePreviewButton 
              partnerId={examplePartnerId}
              variant="default"
              size="lg"
            />
          </div>
        </div>

        {/* Ghost variant */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Ghost Variant</h2>
          <div className="flex gap-3">
            <PartnerProfilePreviewButton 
              partnerId={examplePartnerId}
              variant="ghost"
              size="sm"
            />
            <PartnerProfilePreviewButton 
              partnerId={examplePartnerId}
              variant="ghost"
              size="md"
            />
            <PartnerProfilePreviewButton 
              partnerId={examplePartnerId}
              variant="ghost"
              size="lg"
            />
          </div>
        </div>

        {/* Custom text */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Custom Button Text</h2>
          <div className="flex gap-3">
            <PartnerProfilePreviewButton 
              partnerId={examplePartnerId}
              variant="outline"
              size="md"
            >
              View Dealer Profile
            </PartnerProfilePreviewButton>
            <PartnerProfilePreviewButton 
              partnerId={examplePartnerId}
              variant="default"
              size="md"
            >
              See Full Profile
            </PartnerProfilePreviewButton>
          </div>
        </div>

        {/* Usage in card */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">In a Card Context</h2>
          <div className="p-6 rounded-xl border border-border/40 bg-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">Premium Auto Trading</h3>
                <p className="text-sm text-muted-foreground">Dubai, UAE</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-sm font-bold">PA</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Specializing in luxury vehicles with over 20 years of experience
            </p>
            <PartnerProfilePreviewButton 
              partnerId={examplePartnerId}
              variant="outline"
              size="md"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
