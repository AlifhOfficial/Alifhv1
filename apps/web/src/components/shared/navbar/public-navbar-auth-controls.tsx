'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AuthManager, type AuthModalType, type AuthUser } from '@/components/auth';
import { NavbarFavorites } from './navbar-favorites';
import { NavbarMessaging } from './navbar-messaging';
import { ProfileMenu } from './user-dropdown';
import { useUser } from '@/hooks/auth/use-auth';
import { handleSignOut } from '@/lib/auth/sign-out';
import type { NavItem } from '@/lib/navigation';

interface PublicNavbarAuthControlsProps {
  navItems: NavItem[];
}

export function PublicNavbarAuthControls({ navItems }: PublicNavbarAuthControlsProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentAuthModal, setCurrentAuthModal] = useState<AuthModalType>(null);
  const hasHandledAuthParamRef = useRef(false);
  const pendingRedirectRef = useRef<string | null>(null);

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isSignedIn: isAuthenticated, setSessionUser } = useUser();

  useEffect(() => {
    if (!showProfileMenu) {
      return;
    }

    const handleClick = () => setShowProfileMenu(false);
    setTimeout(() => document.addEventListener('click', handleClick), 0);
    return () => document.removeEventListener('click', handleClick);
  }, [showProfileMenu]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    const closableModals: AuthModalType[] = [
      'signin',
      'signup',
      'forgot-password',
      'magic-link',
      'email-sent',
      'feedback',
    ];

    if (!isAuthenticated || !currentAuthModal || !closableModals.includes(currentAuthModal)) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      setCurrentAuthModal(null);

      if (pendingRedirectRef.current) {
        const redirectTo = pendingRedirectRef.current;
        pendingRedirectRef.current = null;
        router.push(redirectTo);
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [isAuthenticated, currentAuthModal, router]);

  useEffect(() => {
    if (!searchParams) {
      return;
    }

    const authParam = searchParams.get('auth');
    const redirectParam = searchParams.get('redirect');

    if ((authParam === 'signin' || authParam === 'signup') && !hasHandledAuthParamRef.current) {
      hasHandledAuthParamRef.current = true;

      const params = new URLSearchParams(searchParams.toString());
      params.delete('auth');
      params.delete('redirect');
      const queryString = params.toString();

      if (isAuthenticated && redirectParam) {
        queueMicrotask(() => {
          router.replace(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
          requestAnimationFrame(() => {
            router.push(redirectParam);
          });
        });
        return;
      }

      if (redirectParam) {
        pendingRedirectRef.current = redirectParam;
      }

      queueMicrotask(() => {
        router.replace(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
        requestAnimationFrame(() => {
          setCurrentAuthModal(authParam);
        });
      });
    } else if (!authParam) {
      hasHandledAuthParamRef.current = false;
    }
  }, [searchParams, pathname, router, isAuthenticated]);

  const onSignOut = useCallback(async () => {
    setShowProfileMenu(false);
    await handleSignOut();
  }, []);

  return (
    <>
      {isAuthenticated && user?.id ? <NavbarMessaging userId={user.id} /> : null}
      {isAuthenticated && user?.id ? <NavbarFavorites userId={user.id} /> : null}

      <ProfileMenu
        user={user}
        showMenu={showProfileMenu}
        onToggleMenu={(event) => {
          event?.stopPropagation();
          setShowProfileMenu((current) => !current);
        }}
        onSignIn={() => {
          setShowProfileMenu(false);
          setCurrentAuthModal('signin');
        }}
        onSignUp={() => {
          setShowProfileMenu(false);
          setCurrentAuthModal('signup');
        }}
        onSignOut={onSignOut}
        onProfile={() => {
          setShowProfileMenu(false);
          router.push('/profile');
        }}
        navItems={navItems}
        pathname={pathname}
        onNavigate={() => setShowProfileMenu(false)}
      />

      <AuthManager
        currentModal={currentAuthModal}
        onModalChange={setCurrentAuthModal}
        onSuccess={(authUser?: AuthUser) => {
          if (authUser) {
            setSessionUser(authUser as typeof user);
          }
          router.refresh();
        }}
      />
    </>
  );
}
