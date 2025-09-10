// Ensure crypto.randomUUID exists early, before app code runs.
// This runs before the main module via Metro serializer config.

// Provides global.crypto with getRandomValues in RN.
require('react-native-get-random-values')

const Crypto = require('expo-crypto')

;(function ensureRandomUUID() {
  try {
    if (typeof global.crypto !== 'object' || !global.crypto) {
      global.crypto = {}
    }
    if (typeof global.crypto.randomUUID !== 'function') {
      // Delegate to Expo's native implementation.
      global.crypto.randomUUID = () => Crypto.randomUUID()
      crypto.randomUUID = () => Crypto.randomUUID()
    }
  } catch (e) {
    // Best-effort polyfill; avoid crashing during initialization.
  }
})()

module.exports = {}
