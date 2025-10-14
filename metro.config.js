// Learn more https://docs.expo.io/guides/customizing-metro
/**
 * @typedef {import('expo/metro-config').MetroConfig} MetroConfig
 */
const { getDefaultConfig } = require('expo/metro-config')

const defaultConfiguration = getDefaultConfig(__dirname)

/** @type {MetroConfig} */
module.exports = {
  ...defaultConfiguration,
  transformer: {
    ...defaultConfiguration.transformer,
  },
  resolver: {
    ...defaultConfiguration.resolver,
    unstable_enablePackageExports: true,
    unstable_conditionNames: [
      ...(defaultConfiguration.resolver?.unstable_conditionNames || []),
      'import',
    ],
    resolveRequest: (context, moduleName, platform) => {
      /**
       * if `node:crypto`, replace it with `expo-crypto`
       */
      if (moduleName.startsWith('node:crypto'))
        return {
          type: 'sourceFile',
          filePath: require.resolve('expo-crypto'),
        }

      /**
       * Prefer CJS for `ox` or `@noble/hashes` to avoid `window.*` usage in ESM builds
       * TODO: fix this in `ox`
       */
      if (moduleName.startsWith('ox'))
        return {
          type: 'sourceFile',
          filePath: require.resolve(moduleName),
        }

      return context.resolveRequest(context, moduleName, platform)
    },
  },
}
