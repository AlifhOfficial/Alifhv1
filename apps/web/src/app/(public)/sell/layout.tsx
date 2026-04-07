import { Metadata } from 'next';
import { REVVUP_META_DESCRIPTION } from '@/lib/brand-messaging';

export const metadata: Metadata = {
  title: 'Sell Your Car in Dubai — Free Forever | Revvup',
  description: REVVUP_META_DESCRIPTION,
  keywords: 'sell my car dubai, sell car uae, list car free dubai, post car ad free dubai, sell car dubai free, best place to sell car dubai, how to sell car dubai, free car listing uae, sell car online dubai, where to sell my car dubai, dubizzle cars, dubicars sell, yallmotors alternative, cars24 alternative, shoofi cars, ayeshi alternative, free car classifieds uae',
  openGraph: {
    title: 'Sell Your Car in Dubai — Free Forever | Revvup',
    description: REVVUP_META_DESCRIPTION,
    type: 'website',
    url: 'https://revvup.ae/sell',
  },
  alternates: {
    canonical: 'https://revvup.ae/sell',
  },
};

export default function SellLayout({ children }: { children: React.ReactNode }) {
  return children;
}
