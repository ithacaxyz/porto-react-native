import 'tsx/cjs'
import type { ExpoConfig, ConfigContext } from 'expo/config'

const scheme = 'porto-rn'

export default (context: ConfigContext): ExpoConfig => ({
  ...context.config,
  slug: scheme,
  name: scheme,
  scheme: scheme,
  version: '1.0.0',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    appleTeamId: 'Q7767Q7TRJ',
    bundleIdentifier: 'org.name.portorn',
    associatedDomains: ['webcredentials:xporto.up.railway.app'],
  },
  android: {
    package: 'org.name.portorn',
  },
  web: {
    output: 'single',
    bundler: 'metro',
  },
  extra: {
    /**
     * @see https://expo.dev/accounts/o-az/projects/porto-rn
     */
    eas: {
      projectId: '2465a0e5-8758-4bbf-8641-49004b3ea709',
    },
  },
  experiments: {
    typedRoutes: true,
  },
  plugins: [
    ['patch-project'],
    ['expo-router'],
    ['expo-dev-client', { launchMode: 'most-recent' }],
    [
      'expo-build-properties',
      {
        android: {
          packagingOptions: {
            pickFirst: ['**/libcrypto.so'],
          },
        },
      },
    ],
    [
      /**
       * @see https://docs.expo.dev/versions/v54.0.0/sdk/webbrowser/
       */
      'expo-web-browser',
      { experimentalLauncherActivity: true },
    ],
    [
      /**
       * @see https://docs.expo.dev/versions/latest/sdk/local-authentication/
       */
      'expo-local-authentication',
      { faceIDPermission: 'Allow $(PRODUCT_NAME) to use Face ID.' },
    ],
    [
      'expo-secure-store',
      {
        configureAndroidBackup: true,
        faceIDPermission:
          'Allow $(PRODUCT_NAME) to access your Face ID biometric data.',
      },
    ],
  ],
})
