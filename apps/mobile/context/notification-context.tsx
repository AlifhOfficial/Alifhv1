/**
 * Notification Context
 * Handles push notification registration, permissions, and incoming notifications
 * 
 * NOTE: Requires expo-notifications and expo-device to be installed:
 * bunx expo install expo-notifications expo-device
 * 
 * Also requires app.json plugin configuration (see setup instructions below)
 */

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useAuth } from './auth-context';
import { API_BASE } from '@/lib/config';
import { getSession } from '@/lib/auth-api';
import { setCurrentPushToken } from '@/lib/push-token-store';

// Detect Expo Go — notifications are not supported there since SDK 53
const isExpoGo = Constants.appOwnership === 'expo';

// Conditionally import expo-notifications (crashes in Expo Go)
let Notifications: typeof import('expo-notifications') | null = null;
if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
  } catch (e) {
    console.warn('[Notifications] expo-notifications not available:', e);
  }
}

// ============================================================================
// TYPES
// ============================================================================

interface NotificationContextType {
  /** Expo push token for this device */
  expoPushToken: string | null;
  /** Whether notifications are enabled */
  notificationsEnabled: boolean;
  /** Whether we have permission to send notifications */
  hasPermission: boolean;
  /** Request notification permissions */
  requestPermissions: () => Promise<boolean>;
  /** Register push token with API */
  registerPushToken: () => Promise<void>;
  /** Unregister push token (call on logout) */
  unregisterPushToken: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// ============================================================================
// NOTIFICATION HANDLER CONFIG
// ============================================================================

// When app is in foreground, suppress push banners — user is already in the app
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: true,
      shouldShowBanner: false,
      shouldShowList: false,
    }),
  });
}

// ============================================================================
// PROVIDER
// ============================================================================

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // Register for push notifications
  const registerForPushNotifications = async (): Promise<string | null> => {
    if (!Notifications) {
      console.log('[Notifications] Not available (Expo Go). Skipping push setup.');
      return null;
    }

    if (!Device.isDevice) {
      console.log('[Notifications] Must use physical device for push notifications');
      return null;
    }

    // Check current permission status
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permission not granted');
      setHasPermission(false);
      return null;
    }

    setHasPermission(true);

    try {
      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId,
      });
      
      console.log('[Notifications] Got push token:', tokenData.data);
      return tokenData.data;
    } catch (error) {
      console.error('[Notifications] Failed to get push token:', error);
      return null;
    }
  };

  // Request permissions (called manually by user)
  const requestPermissions = async (): Promise<boolean> => {
    const token = await registerForPushNotifications();
    if (token) {
      setExpoPushToken(token);
      setCurrentPushToken(token); // Module-level for logout
      setNotificationsEnabled(true);
      return true;
    }
    return false;
  };

  // Register push token with API
  const registerPushToken = async (): Promise<void> => {
    if (!expoPushToken) {
      console.log('[Notifications] Cannot register: no token');
      return;
    }

    const { session } = await getSession();
    if (!session?.token) {
      console.log('[Notifications] Cannot register: not authenticated');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/push-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          token: expoPushToken,
          platform: Platform.OS as 'ios' | 'android',
          deviceId: Device.deviceName || undefined,
          deviceName: Device.modelName || Device.deviceName || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to register: ${response.status}`);
      }

      const result = await response.json();
      console.log('[Notifications] Token registered:', result);
    } catch (error) {
      console.error('[Notifications] Failed to register token:', error);
    }
  };

  // Unregister push token (call on logout)
  const unregisterPushToken = async (): Promise<void> => {
    if (!expoPushToken) return;

    try {
      const response = await fetch(`${API_BASE}/api/push-tokens`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: expoPushToken,
        }),
      });

      if (!response.ok) {
        console.warn('[Notifications] Failed to unregister token');
      } else {
        console.log('[Notifications] Token unregistered');
      }
    } catch (error) {
      console.error('[Notifications] Error unregistering token:', error);
    }

    setExpoPushToken(null);
    setNotificationsEnabled(false);
  };

  // Handle notification tap
  const handleNotificationResponse = (response: any) => {
    const data = response.notification.request.content.data;
    
    console.log('[Notifications] Notification tapped:', data);

    // Navigate based on notification type
    if (data?.action === 'open_chat' && data?.conversationId) {
      router.push(`/chat/${data.conversationId}`);
    } else if (data?.action === 'open_listing' && data?.listingId) {
      router.push(`/listing/${data.listingId}`);
    }
  };

  // Initialize on mount
  useEffect(() => {
    if (!Notifications) {
      console.log('[Notifications] Not available (Expo Go), skipping setup');
      return;
    }

    // Check if notifications are available
    if (!Device.isDevice) {
      console.log('[Notifications] Not a physical device, skipping setup');
      return;
    }

    // Configure Android notification channel
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('messages', {
        name: 'Messages',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }

    // Listen for incoming notifications (foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[Notifications] Received in foreground:', notification);
      }
    );

    // Listen for notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // Auto-register when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // First get push token
      registerForPushNotifications().then((token) => {
        if (token) {
          setExpoPushToken(token);
          setCurrentPushToken(token); // Sync to store for logout
          setNotificationsEnabled(true);
        }
      });
    }
  }, [isAuthenticated, user?.id]);

  // Register token with API when we have both token and auth
  useEffect(() => {
    if (expoPushToken && isAuthenticated) {
      registerPushToken();
    }
  }, [expoPushToken, isAuthenticated]);

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        notificationsEnabled,
        hasPermission,
        requestPermissions,
        registerPushToken,
        unregisterPushToken,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

// ============================================================================
// SETUP INSTRUCTIONS
// ============================================================================

/**
 * To complete push notification setup:
 * 
 * 1. Install required packages:
 *    bunx expo install expo-notifications expo-device expo-constants
 * 
 * 2. Add plugins to app.json:
 *    "plugins": [
 *      ...existing plugins,
 *      [
 *        "expo-notifications",
 *        {
 *          "icon": "./assets/images/notification-icon.png",
 *          "color": "#ffffff",
 *          "sounds": ["./assets/sounds/notification.wav"]
 *        }
 *      ]
 *    ]
 * 
 * 3. For iOS, add to app.json ios config:
 *    "ios": {
 *      ...existing config,
 *      "infoPlist": {
 *        "UIBackgroundModes": ["remote-notification"]
 *      }
 *    }
 * 
 * 4. Add EXPO_PUBLIC_PROJECT_ID to your environment:
 *    EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
 * 
 * 5. Wrap your app with NotificationProvider in _layout.tsx:
 *    <NotificationProvider>
 *      {children}
 *    </NotificationProvider>
 * 
 * 6. On logout, call unregisterPushToken() to remove the device token
 */
