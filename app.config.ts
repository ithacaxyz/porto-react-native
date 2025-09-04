import 'tsx/cjs'
import type { ExpoConfig, ConfigContext } from 'expo/config'

const scheme = 'porto-rn'
const associatedDomains = [
  'o.bun-alewife.ts.net',
  '6ddb0ea71139.ngrok.app',
].map((hostname) => `webcredentials:${hostname}`)

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
    associatedDomains: ['webcredentials:o.bun-alewife.ts.net'],
  },
  android: {
    package: 'org.name.portorn',
  },
  web: {
    output: 'static',
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
    ['expo-dev-client', { launchMode: 'most-recent' }],
    ['expo-router'],
    [
      'expo-sqlite',
      {
        enableFTS: true,
        useSQLCipher: true,
        ios: {
          // You can also override the shared configurations for iOS
          customBuildFlags:
            '-DSQLITE_ENABLE_DBSTAT_VTAB=1 -DSQLITE_ENABLE_SNAPSHOT=1',
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
