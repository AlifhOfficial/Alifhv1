/**
 * Bookings Screen — Route
 * Route: /bookings
 *
 * Renders the My Bookings view with booking management.
 * Requires authentication — triggers auth flow if not signed in.
 */

import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useTabBar } from '@/context/tab-bar-context';
import { BookingsScreen } from '@/components/bookings/bookings-screen';

export default function BookingsRoute() {
  const { isAuthenticated, openAuthFlow } = useAuth();
  const { hideChrome, showChrome } = useTabBar();

  // Hide tab bar for immersive experience
  useEffect(() => {
    hideChrome();
    return () => {
      showChrome();
    };
  }, [hideChrome, showChrome]);

  // Gate behind auth
  useEffect(() => {
    if (!isAuthenticated) {
      openAuthFlow();
    }
  }, [isAuthenticated, openAuthFlow]);

  return <BookingsScreen />;
}
