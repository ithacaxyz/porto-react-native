import 'react-native-get-random-values'

try {
  if (!global.crypto || typeof global.crypto.getRandomValues !== 'function') {
    const QuickCrypto = require('react-native-quick-crypto')
    if (QuickCrypto?.install) QuickCrypto.install()
  }
} catch {}

import 'expo-router/entry'
