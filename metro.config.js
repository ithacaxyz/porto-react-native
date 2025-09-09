// Learn more https://docs.expo.io/guides/customizing-metro
const path = require('node:path')
const { withNativeWind } = require('nativewind/metro')
const { getDefaultConfig } = require('expo/metro-config')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

config.resolver.assetExts.push('wasm')

// COEP and COOP headers for to support SharedArrayBuffer
config.server.enhanceMiddleware = (middleware) => {
  return (request, response, next) => {
    response.setHeader('Cross-Origin-Embedder-Policy', 'credentialless')
    response.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
    middleware(request, response, next)
  }
}

config.resolver.unstable_enablePackageExports = true
config.resolver.unstable_conditionsByPlatform = true

/**
 * @type {import('expo/metro-config').MetroConfig['resolver']['resolveRequest']}
 */
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    //
    moduleName.startsWith('ox') ||
    moduleName.startsWith('@noble/hashes')
  ) {
    return {
      type: 'sourceFile',
      filePath: require.resolve(moduleName),
    }
  }

  // Prefer ESM builds for viem in RN to avoid ws/node deps from CJS.
  if (moduleName === 'viem' || moduleName.startsWith('viem/')) {
    const pkgDir = path.dirname(require.resolve('viem/package.json'))
    const subpath = moduleName === 'viem' ? '' : moduleName.slice('viem'.length)
    const file = subpath
      ? path.join(pkgDir, '_esm', subpath, 'index.js')
      : path.join(pkgDir, '_esm', 'index.js')
    return { type: 'sourceFile', filePath: file }
  }

  // Force isows to native (uses global WebSocket, no `ws` dependency).
  if (moduleName === 'isows') {
    const pkgDir = path.dirname(require.resolve('isows/package.json'))
    return {
      type: 'sourceFile',
      filePath: path.join(pkgDir, '_esm', 'native.js'),
    }
  }

  // Handle crypto module resolution for React Native (iOS/Android only)
  if (
    (moduleName === 'crypto' || moduleName === 'node:crypto') &&
    platform !== 'web'
  ) {
    // when importing crypto, resolve to react-native-quick-crypto
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
}

module.exports = withNativeWind(config, { input: './src/global.css' })
