/**
 * Public Pricing Page - Under Construction
 */

import { Construction } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
          <Construction className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Pricing Coming Soon</h1>
        <p className="text-muted-foreground">
          We&apos;re finalizing our partner subscription plans. Check back soon for pricing details.
        </p>
      </div>
    </div>
  );
}
