import 'tsx/cjs'
import type { ExpoConfig, ConfigContext } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  slug: 'porto-rn',
  name: 'porto-rn',
  version: '1.0.0',
  jsEngine: 'hermes',
  ios: {
    jsEngine: 'jsc',
  },
  extra: {
    /**
     * @see https://expo.dev/accounts/o-az/projects/porto-rn
     */
    eas: {
      projectId: '2465a0e5-8758-4bbf-8641-49004b3ea709',
    },
  },
})
