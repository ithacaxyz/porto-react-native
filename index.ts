import 'react-native-get-random-values'
// Ensure global.crypto exists very early for libs that snapshot it at import time.
try {
  if (!global.crypto || typeof global.crypto.getRandomValues !== 'function') {
    const QuickCrypto = require('react-native-quick-crypto')
    if (QuickCrypto?.install) QuickCrypto.install()
  }
} catch {}

// Register app entry through Expo Router
import 'expo-router/entry'
