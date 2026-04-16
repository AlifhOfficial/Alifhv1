'use client';

interface AuthenticatedAppProvidersProps {
  children: React.ReactNode;
}

export function AuthenticatedAppProviders({ children }: AuthenticatedAppProvidersProps) {
  return <>{children}</>;
}
