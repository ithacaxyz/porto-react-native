// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

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
  if (moduleName.startsWith('ox')) {
    console.info(moduleName, platform)
    return {
      type: 'sourceFile',
      filePath: require.resolve(moduleName),
    }
  }

  return context.resolveRequest?.(context, moduleName, platform)
}

module.exports = withNativeWind(config, { input: './src/global.css' })
