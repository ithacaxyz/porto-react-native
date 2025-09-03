import 'tsx/cjs'
import type { ExpoConfig, ConfigContext } from 'expo/config'

/**
 * TODO:
 * 
 * Add plugins:
 *   - https://docs.expo.dev/versions/v54.0.0/sdk/router/
     - https://docs.expo.dev/versions/v54.0.0/sdk/router-ui/
 */

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  slug: 'porto-rn',
  name: 'porto-rn',
  version: '1.0.0',
  scheme: 'porto-rn',
  jsEngine: 'hermes',
  ios: {
    jsEngine: 'jsc',
    associatedDomains: [''],
  },
  web: {
    bundler: 'metro',
    output: 'server',
  },
  extra: {
    /**
     * @see https://expo.dev/accounts/o-az/projects/porto-rn
     */
    eas: {
      projectId: '2465a0e5-8758-4bbf-8641-49004b3ea709',
    },
  },

  plugins: [
    // ['android-credential-manager', { domainUrl: '' }],
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
    ['expo-dev-client', { launchMode: 'most-recent' }],
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
