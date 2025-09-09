/** @type {import('@babel/core').ConfigFunction} */
module.exports = (api) => {
  api.cache(true)
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          unstable_transformImportMeta: true,
          jsxImportSource: 'nativewind',
          reanimated: false,
        },
      ],
      'nativewind/babel',
    ],
    plugins: [
      'babel-plugin-transform-import-meta',
      'react-native-worklets/plugin',
    ],
  }
}
