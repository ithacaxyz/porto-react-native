import 'tsx/cjs'
import type { ExpoConfig, ConfigContext } from 'expo/config'

const scheme = 'porto-rn'

const dev =
  process.env.NODE_ENV === 'development' ||
  process.env.ENVIRONMENT === 'development'

const ngrokDomain = `${process.env.EXPO_TUNNEL_SUBDOMAIN}.ngrok.io`

export default (context: ConfigContext): ExpoConfig => ({
  ...context.config,
  slug: scheme,
  name: scheme,
  scheme: scheme,
  version: '1.0.0',
  newArchEnabled: true,
  userInterfaceStyle: 'automatic',
  platforms: ['android', 'ios', 'web'],
  ios: {
    config: {
      usesNonExemptEncryption: false,
    },
    supportsTablet: true,
    appleTeamId: 'Q7767Q7TRJ',
    bundleIdentifier: 'org.name.portorn',
    associatedDomains: [
      `applinks:${ngrokDomain}`,
      `webcredentials:${ngrokDomain}`,
      `activitycontinuation:${ngrokDomain}`,

      `applinks:${process.env.EXPO_PUBLIC_SERVER_DOMAIN}`,
      `webcredentials:${process.env.EXPO_PUBLIC_SERVER_DOMAIN}`,
      `activitycontinuation:${process.env.EXPO_PUBLIC_SERVER_DOMAIN}`,
    ],
  },
  android: {
    newArchEnabled: true,
    edgeToEdgeEnabled: true,
    package: 'org.name.portorn',
  },
  web: {
    output: 'single',
    bundler: 'metro',
  },
  experiments: {
    typedRoutes: true,
    turboModules: true,
  },
  extra: {
    eas: {
      projectId: '2465a0e5-8758-4bbf-8641-49004b3ea709',
    },
  },
  plugins: [
    [
      'expo-router',
      {
        origin: `https://${ngrokDomain}`,
        headOrigin: dev
          ? `https://${ngrokDomain}`
          : `https://${process.env.EXPO_PUBLIC_SERVER_DOMAIN}`,
      },
    ],
    ['patch-project'],
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
    ['expo-web-browser', { experimentalLauncherActivity: true }],
    [
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
    [
      './plugins/android.ts',
      {
        workersMax: 2,
        enableDebugSuffix: false,
        disableReleaseLint: true,
        versionNameSuffix: '-debug',
        jvmArgs: [
          '-Xmx4096m',
          '-XX:MaxMetaspaceSize=1024m',
          '-Dfile.encoding=UTF-8',
          '-Dkotlin.daemon.jvm.options=-Xmx2048m',
        ].join(' '),
      },
    ],
    [
      './plugins/ios.ts',
      { enableDebugSuffix: false, bundleIdSuffix: '.debug' },
    ],
  ],
})
