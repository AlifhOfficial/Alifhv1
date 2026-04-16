/**
 * Seller Contact Screen Types
 */

import type { SellerInfo, SellerListingCard } from '@/lib/seller-api';
import type { Colors } from '@/constants/theme';

export interface SellerContactColors {
  colors: typeof Colors.light;
}

export interface SellerHeroProps extends SellerContactColors {
  seller: SellerInfo;
}

export interface SellerActionsProps extends SellerContactColors {
  seller: SellerInfo;
  isChatLoading: boolean;
  onChat: () => void;
  onBookViewing: () => void;
  onShowPhone: () => void;
}

export interface SellerStatsGridProps extends SellerContactColors {
  seller: SellerInfo;
}

export interface SellerTagsProps extends SellerContactColors {
  tags: string[];
  label: string;
}

export interface SellerListingsProps extends SellerContactColors {
  listings: SellerListingCard[];
  onViewListing: (id: string) => void;
  onViewAll: () => void;
}

export interface FinancingCalculatorProps extends SellerContactColors {
  price: number;
  downPaymentPercent: number;
  loanTermMonths: number;
  interestRate: number;
  onDownPaymentChange: (value: number) => void;
  onTermChange: (value: number) => void;
}

export interface SellerLocationProps extends SellerContactColors {
  seller: SellerInfo;
  onViewMap: () => void;
  onGetDirections: () => void;
  onWebsite: () => void;
}
