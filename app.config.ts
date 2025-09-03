import type { ExpoConfig, ConfigContext } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  slug: 'porto-rn',
  name: 'porto-rn',
  version: '1.0.0',
  expo: {
    jsEngine: 'hermes',
    ios: {
      jsEngine: 'jsc',
    },
  },
})
