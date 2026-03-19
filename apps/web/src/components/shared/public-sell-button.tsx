'use client';

import { useRouter } from 'next/navigation';
import { useAuthRequired } from '@/hooks/use-auth-required';
import { AuthRequiredModal } from '@/components/auth/auth-required-modal';

interface PublicSellButtonProps {
  className?: string;
  children: React.ReactNode;
  variant?: 'button' | 'link';
}

export function PublicSellButton({
  className,
  children,
  variant = 'button',
}: PublicSellButtonProps) {
  const router = useRouter();
  const { isAuthenticated, showModal, openModal, closeModal } = useAuthRequired({
    feature: 'create listings',
    redirectTo: '/user-dashboard/listings/new',
  });

  const handleClick = (event?: React.MouseEvent) => {
    event?.preventDefault();

    if (isAuthenticated) {
      router.push('/user-dashboard/listings/new');
      return;
    }

    openModal();
  };

  return (
    <>
      {variant === 'link' ? (
        <a href="/user-dashboard/listings/new" onClick={handleClick} className={className}>
          {children}
        </a>
      ) : (
        <button onClick={handleClick} className={className}>
          {children}
        </button>
      )}
      <AuthRequiredModal
        open={showModal}
        onClose={closeModal}
        feature="create listings"
        redirectTo="/user-dashboard/listings/new"
      />
    </>
  );
}
