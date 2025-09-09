/** @type {import('@babel/core').ConfigFunction} */
module.exports = (api) => {
  api.cache(true)
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: [
      'babel-plugin-transform-import-meta',
      [
        'module-resolver',
        {
          alias: {
            stream: 'readable-stream',
            crypto: 'react-native-quick-crypto',
            buffer: '@craftzdog/react-native-buffer',
          },
        },
      ],
    ],
  }
}
