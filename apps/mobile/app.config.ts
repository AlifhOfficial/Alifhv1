import type { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Expo App Configuration
 * 
 * Dynamic configuration that extends app.json and allows environment variables.
 * Uses EXPO_PUBLIC_ prefixed env vars which are available at build time.
 * 
 * @see https://docs.expo.dev/workflow/configuration/
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  // Production domain for associated domains
  const productionDomain = 'revvup.ae';
  
  // Dev domains for local testing (parsed from env or defaults)
  // Format: comma-separated list of host:port
  const devDomains = process.env.EXPO_PUBLIC_DEV_DOMAINS?.split(',').map(d => d.trim()) || [];
  
  // Build associated domains array for iOS passkeys/webcredentials
  const associatedDomains = [
    `webcredentials:${productionDomain}`,
    ...devDomains.map(domain => `webcredentials:${domain}`),
  ];

  return {
    ...config,
    name: 'Revvup',
    slug: 'revvup',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'revvup',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      userInterfaceStyle: 'automatic',
      supportsTablet: true,
      backgroundColor: '#000000',
      bundleIdentifier: 'ae.revvup.mobile',
      associatedDomains,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      userInterfaceStyle: 'automatic',
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      softwareKeyboardLayoutMode: 'resize',
      predictiveBackGestureEnabled: false,
      backgroundColor: '#000000',
      package: 'ae.revvup.mobile',
    },
    androidNavigationBar: {
      enforceContrast: false,
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-font',
        {
          fonts: ['./assets/fonts/Geom/static/Geom-Black.ttf'],
        },
      ],
      [
        'expo-splash-screen',
        {
          backgroundColor: '#FAFAFA',
          dark: {
            backgroundColor: '#0D0D0D',
          },
        },
      ],
      [
        'expo-notifications',
        {
          color: '#000000',
          defaultChannel: 'messages',
        },
      ],
      'expo-audio',
      'expo-asset',
      'expo-apple-authentication',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      eas: {
        projectId: 'cd8cffff-33b0-46d9-b584-08eb6448e6dc',
      },
      // Expose API URLs to the app via Constants.expoConfig.extra
      // Default to production URLs (use EXPO_PUBLIC_USE_LOCAL_DEV=true for local dev)
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://revvup.ae',
      wsUrl: process.env.EXPO_PUBLIC_WS_URL || 'wss://ws.revvup.ae',
      cdnUrl: process.env.EXPO_PUBLIC_CDN_URL || 'https://cdn.revvup.ae',
    },
  };
};
