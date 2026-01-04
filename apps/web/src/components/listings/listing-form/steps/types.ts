'use client';

import type { ListingFormData } from '../types';

export interface StepProps {
  data: Partial<ListingFormData>;
  updateField: <K extends keyof ListingFormData>(field: K, value: ListingFormData[K]) => void;
  errors: Record<string, string>;
  excludeListingId?: string;
}
