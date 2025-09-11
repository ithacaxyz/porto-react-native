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
    // Prefer ESM when available for packages that ship both builds.
    unstable_conditionNames: [
      ...(defaultConfiguration.resolver.unstable_conditionNames || []),
      'import',
    ],
    resolverMainFields: ['react-native', 'browser', 'module', 'main'],
    resolveRequest: (context, moduleName, platform) => {
      // Ensure @noble/hashes reads crypto from globalThis at access time
      if (
        moduleName === '@noble/hashes/crypto' ||
        moduleName === '@noble/hashes/crypto.js'
      ) {
        return {
          type: 'sourceFile',
          filePath: require.resolve('./shims/crypto-bridge.js'),
        }
      }

      // Prefer CJS for ox & @noble/hashes to avoid `window.*` usage in ESM builds
      if (
        moduleName.startsWith('ox') ||
        moduleName.startsWith('@noble/hashes')
      ) {
        return {
          type: 'sourceFile',
          filePath: require.resolve(moduleName),
        }
      }

      // Force CJS build for punycode to interop with CJS consumers (e.g., whatwg-url)
      if (moduleName === 'punycode' || moduleName.startsWith('punycode/')) {
        const filePath = require.resolve('punycode/punycode.js')
        return { type: 'sourceFile', filePath }
      }

      // Prefer ESM for viem to avoid ws/node deps from CJS.
      if (moduleName === 'viem' || moduleName.startsWith('viem/')) {
        const pkgDir = path.dirname(require.resolve('viem/package.json'))
        const subpath =
          moduleName === 'viem' ? '' : moduleName.slice('viem'.length)
        const file = subpath
          ? path.join(pkgDir, '_esm', subpath, 'index.js')
          : path.join(pkgDir, '_esm', 'index.js')
        return { type: 'sourceFile', filePath: file }
      }

      // Map Node builtins to RN shims when needed
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
}
