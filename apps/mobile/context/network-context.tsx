/**
 * Network Context - Tracks online/offline status
 * Provides isOnline status and reconnection handling
 * Uses @react-native-community/netinfo for reliable connectivity detection
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

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

  // Handle connectivity state change
  const handleConnectivityChange = useCallback((state: NetInfoState) => {
    const online = state.isConnected === true && state.isInternetReachable !== false;
    
    if (!online && isOnline) {
      // Going offline
      wasOffline.current = true;
      setLastOnlineAt(new Date());
    } else if (online && wasOffline.current) {
      // Coming back online after being offline
      setIsReconnecting(true);
      setTimeout(() => {
        setIsReconnecting(false);
        wasOffline.current = false;
      }, 1500);
    }
    
    setIsOnline(online);
  }, [isOnline]);

  // Manual retry function
  const retry = useCallback(async () => {
    setIsReconnecting(true);
    const state = await NetInfo.fetch();
    handleConnectivityChange(state);
    setTimeout(() => setIsReconnecting(false), 1000);
  }, [handleConnectivityChange]);

  // Subscribe to network state changes
  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then(handleConnectivityChange);

    // Subscribe to changes
    const unsubscribe = NetInfo.addEventListener(handleConnectivityChange);

    return () => {
      unsubscribe();
    };
  }, [handleConnectivityChange]);

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
