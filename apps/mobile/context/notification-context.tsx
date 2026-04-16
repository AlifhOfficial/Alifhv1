import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAuth } from './auth-context';
import { API_BASE, markDataReady } from '@/lib/config';
import { getSession } from '@/lib/auth-api';
import { setCurrentPushToken } from '@/lib/push-token-store';

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

// Configure foreground notification behavior
// Don't show notifications when app is in foreground - only when closed/background
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

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
    if (!Device.isDevice) {
      console.log('[Notifications] Must use physical device for push notifications');
      return null;
    }

    // Check current permission status
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('[Notifications] Current permission status:', existingStatus);
    let finalStatus = existingStatus;

    // Request permission if not granted
    if (existingStatus !== 'granted') {
      console.log('[Notifications] Requesting permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('[Notifications] Permission request result:', status);
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permission not granted, final status:', finalStatus);
      setHasPermission(false);
      return null;
    }

    setHasPermission(true);

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      console.log('[Notifications] Getting push token with projectId:', projectId);
      
      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      
      console.log('[Notifications] Got push token:', tokenData.data);
      return tokenData.data;
    } catch (error) {
      console.error('[Notifications] Failed to get push token:', error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error('[Notifications] Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
      }
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
      markDataReady('notifications:startup');
      return;
    }

    const { session } = await getSession();
    if (!session?.token) {
      console.log('[Notifications] Cannot register: not authenticated');
      markDataReady('notifications:startup');
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
        const errorText = await response.text();
        console.error('[Notifications] Registration failed:', response.status, errorText);
        throw new Error(`Failed to register: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('[Notifications] Token registered successfully:', result);
    } catch (error) {
      console.error('[Notifications] Failed to register token:', error);
    } finally {
      markDataReady('notifications:startup');
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
    if (!Device.isDevice) {
      console.log('[Notifications] Not a physical device, skipping setup');
      markDataReady('notifications:startup');
      return;
    }

    // Configure Android notification channel
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('messages', {
        name: 'Messages',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: Colors.light.error,
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
    if (!isAuthenticated || !user?.id) {
      markDataReady('notifications:startup');
      return;
    }

    // First get push token
    registerForPushNotifications().then((token) => {
      if (token) {
        setExpoPushToken(token);
        setCurrentPushToken(token); // Sync to store for logout
        setNotificationsEnabled(true);
        return;
      }

      // Permission denied or token retrieval failed - don't block startup.
      markDataReady('notifications:startup');
    });
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
