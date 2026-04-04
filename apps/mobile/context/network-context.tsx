/**
 * Network Context - Tracks online/offline status
 * Provides isOnline status and reconnection handling
 * Uses @react-native-community/netinfo for reliable connectivity detection
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

const OFFLINE_GRACE_MS = 2500;
const RECONNECTING_STATE_MS = 1500;

interface NetworkContextType {
  isOnline: boolean;
  isReconnecting: boolean;
  lastOnlineAt: Date | null;
  retry: () => void;
}

const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  isReconnecting: false,
  lastOnlineAt: null,
  retry: () => {},
});

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(null);
  const wasOffline = useRef(false);
  const isOnlineRef = useRef(true);
  const offlineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  const clearOfflineTimer = useCallback(() => {
    if (!offlineTimerRef.current) return;
    clearTimeout(offlineTimerRef.current);
    offlineTimerRef.current = null;
  }, []);

  const clearReconnectingTimer = useCallback(() => {
    if (!reconnectingTimerRef.current) return;
    clearTimeout(reconnectingTimerRef.current);
    reconnectingTimerRef.current = null;
  }, []);

  // Handle connectivity state change
  const handleConnectivityChange = useCallback((state: NetInfoState) => {
    const online = state.isConnected === true && state.isInternetReachable !== false;

    if (online) {
      clearOfflineTimer();

      const wasPreviouslyOffline = wasOffline.current || !isOnlineRef.current;
      setIsOnline(true);

      if (wasPreviouslyOffline) {
        clearReconnectingTimer();
        setIsReconnecting(true);
        reconnectingTimerRef.current = setTimeout(() => {
          setIsReconnecting(false);
          wasOffline.current = false;
          reconnectingTimerRef.current = null;
        }, RECONNECTING_STATE_MS);
      }

      return;
    }

    if (isOnlineRef.current) {
      // Potentially going offline - give network a short grace period
      setLastOnlineAt(new Date());
    }

    wasOffline.current = true;

    if (!offlineTimerRef.current) {
      offlineTimerRef.current = setTimeout(() => {
        setIsOnline(false);
        offlineTimerRef.current = null;
      }, OFFLINE_GRACE_MS);
    }
  }, [clearOfflineTimer, clearReconnectingTimer]);

  // Manual retry function
  const retry = useCallback(async () => {
    clearOfflineTimer();
    clearReconnectingTimer();

    setIsReconnecting(true);
    const state = await NetInfo.fetch();
    handleConnectivityChange(state);

    reconnectingTimerRef.current = setTimeout(() => {
      setIsReconnecting(false);
      reconnectingTimerRef.current = null;
    }, 1000);
  }, [clearOfflineTimer, clearReconnectingTimer, handleConnectivityChange]);

  // Subscribe to network state changes
  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then(handleConnectivityChange);

    // Subscribe to changes
    const unsubscribe = NetInfo.addEventListener(handleConnectivityChange);

    return () => {
      clearOfflineTimer();
      clearReconnectingTimer();
      unsubscribe();
    };
  }, [clearOfflineTimer, clearReconnectingTimer, handleConnectivityChange]);

  return (
    <NetworkContext.Provider value={{ isOnline, isReconnecting, lastOnlineAt, retry }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
