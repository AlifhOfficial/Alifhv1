import type { ExpoConfig, ConfigContext } from 'expo/config';

type RevvupExpoConfig = ExpoConfig & {
};

/**
 * Expo App Configuration
 * 
 * Dynamic configuration that extends app.json and allows environment variables.
 * Uses EXPO_PUBLIC_ prefixed env vars which are available at build time.
 * 
 * @see https://docs.expo.dev/workflow/configuration/
 */
export default ({ config }: ConfigContext): RevvupExpoConfig => {
  // Production domain for associated domains
  const productionDomain = 'revvup.ae';

  // Build associated domains array for iOS passkeys/webcredentials
  const associatedDomains = [
    `webcredentials:${productionDomain}`,
  ];

  return {
    ...config,
    name: 'Revvup',
    slug: 'revvup',
    version: '1.0.0',
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      url: 'https://u.expo.dev/cd8cffff-33b0-46d9-b584-08eb6448e6dc',
    },
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'revvup',
    userInterfaceStyle: 'automatic',
    ios: {
      userInterfaceStyle: 'automatic',
      supportsTablet: true,
      backgroundColor: '#000000',
      bundleIdentifier: 'ae.revvup.mobile',
      associatedDomains,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      splash: {
        backgroundColor: '#000000',
        resizeMode: 'contain',
        image: './assets/images/Revvup-wordmark-white.png',
        dark: {
          backgroundColor: '#000000',
          resizeMode: 'contain',
          image: './assets/images/Revvup-wordmark-white.png',
        },
      },
    },
    android: {
      userInterfaceStyle: 'automatic',
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
      adaptiveIcon: {
        backgroundColor: '#000000',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      softwareKeyboardLayoutMode: 'resize',
      predictiveBackGestureEnabled: false,
      backgroundColor: '#000000',
      package: 'ae.revvup.mobile',
      splash: {
        backgroundColor: '#000000',
        resizeMode: 'contain',
        image: './assets/images/Revvup-wordmark-white.png',
        dark: {
          backgroundColor: '#000000',
          resizeMode: 'contain',
          image: './assets/images/Revvup-wordmark-white.png',
        },
      },
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
        'expo-splash-screen',
        {
          backgroundColor: '#000000',
          image: './assets/images/Revvup-wordmark-white.png',
          imageWidth: 250,
          resizeMode: 'contain',
          dark: {
            backgroundColor: '#000000',
            image: './assets/images/Revvup-wordmark-white.png',
            imageWidth: 250,
            resizeMode: 'contain',
          },
        },
      ],
      [
        'expo-notifications',
        {
          color: '#000000',
          defaultChannel: 'messages',
          androidMode: 'default',
        },
      ],
      'expo-audio',
      'expo-asset',
      'expo-image',
      'expo-apple-authentication',
      [
        'expo-font',
        {
          fonts: [
            './assets/fonts/Inter/Inter_400Regular.ttf',
            './assets/fonts/Inter/Inter_500Medium.ttf',
            './assets/fonts/Inter/Inter_600SemiBold.ttf',
            './assets/fonts/Inter/Inter_700Bold.ttf',
            './assets/fonts/Inter/Inter_800ExtraBold.ttf',
            './assets/fonts/Geom/static/Geom-Black.ttf',
          ],
        },
      ],
      'expo-web-browser',
      'expo-updates',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      eas: {
        projectId: 'cd8cffff-33b0-46d9-b584-08eb6448e6dc',
      },
      // Production mobile endpoints.
      apiUrl: 'https://revvup.ae',
      wsUrl: 'wss://ws.revvup.ae',
      cdnUrl: 'https://cdn.revvup.ae',
    },
  };
};
