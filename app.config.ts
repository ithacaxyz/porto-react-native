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
        enableDebugSuffix: true,
        versionNameSuffix: '-debug',
        jvmArgs:
          '-Xmx4096m -XX:MaxMetaspaceSize=1024m -Dfile.encoding=UTF-8 -Dkotlin.daemon.jvm.options=-Xmx2048m',
        workersMax: 2,
        disableReleaseLint: true,
      },
    ],
  ],
})
