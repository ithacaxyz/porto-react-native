// Learn more https://docs.expo.io/guides/customizing-metro

/**
 * @typedef {import('expo/metro-config').MetroConfig} MetroConfig
 */
const path = require('node:path')
const { getDefaultConfig } = require('expo/metro-config')

const defaultConfiguration = getDefaultConfig(__dirname)

/** @type {MetroConfig} */
module.exports = {
  ...defaultConfiguration,
  resolver: {
    ...defaultConfiguration.resolver,
    resolveRequest: (context, moduleName, platform) => {
      // Shim noble crypto export to be lazy over globalThis.crypto
      if (moduleName.startsWith('@noble/hashes/crypto')) {
        return {
          type: 'sourceFile',
          filePath: require.resolve('./shims/noble-crypto.js'),
        }
      }
      // prefer CJS to avoid `window.*` APIs from ESM
      if (
        moduleName.startsWith('ox') ||
        moduleName.startsWith('@noble/hashes')
      ) {
        return {
          type: 'sourceFile',
          filePath: require.resolve(moduleName),
        }
      }

      // Ensure crypto polyfills are in place before Porto loads
      if (moduleName === 'porto') {
        return {
          type: 'sourceFile',
          filePath: require.resolve('./shims/porto-shim'),
        }
      }

      // Prefer ESM to avoid ws/node deps from CJS
      if (moduleName === 'viem' || moduleName.startsWith('viem/')) {
        const pkgDir = path.dirname(require.resolve('viem/package.json'))
        const subpath =
          moduleName === 'viem' ? '' : moduleName.slice('viem'.length)
        const file = subpath
          ? path.join(pkgDir, '_esm', subpath, 'index.js')
          : path.join(pkgDir, '_esm', 'index.js')
        return { type: 'sourceFile', filePath: file }
      }

      if (
        (moduleName === 'crypto' || moduleName === 'node:crypto') &&
        platform !== 'web'
      ) {
        return context.resolveRequest(
          context,
          'react-native-quick-crypto',
          platform,
        )
      }

      if (moduleName === 'stream' || moduleName === 'node:stream') {
        return context.resolveRequest(context, 'readable-stream', platform)
      }

      if (moduleName === 'buffer' || moduleName === 'node:buffer') {
        return context.resolveRequest(
          context,
          '@craftzdog/react-native-buffer',
          platform,
        )
      }

      return context.resolveRequest(context, moduleName, platform)
    },
  },
  serializer: {
    ...defaultConfiguration.serializer,
    getModulesRunBeforeMainModule: () => [
      require.resolve('./polyfills/setup-crypto.js'),
      ...(defaultConfiguration.serializer?.getModulesRunBeforeMainModule?.() ??
        []),
    ],
  },
}
