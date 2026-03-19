import { PublicSellButton } from '@/components/shared/public-sell-button';

export function FooterSellLink({ className }: { className?: string }) {
  return (
    <PublicSellButton
      variant="link"
      className={className}
    >
      Sell
    </PublicSellButton>
  );
}
