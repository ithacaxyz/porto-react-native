// Ensure crypto.randomUUID exists early, before app code runs.
// This runs before the main module via Metro serializer config.

// Ensure the global property exists as early as possible
;(function ensureGlobalCryptoObject() {
  try {
    const g = typeof globalThis !== 'undefined' ? globalThis : global
    if (typeof g.crypto !== 'object' || !g.crypto) {
      g.crypto = {}
    }
  } catch {}
})()

// Provides global.crypto.getRandomValues in RN (and defines the property if missing).
require('react-native-get-random-values')

const Crypto = require('expo-crypto')

;(function ensureRandomUUID() {
  try {
    const g = typeof globalThis !== 'undefined' ? globalThis : global
    if (!g.crypto) g.crypto = {}
    if (typeof g.crypto.randomUUID !== 'function') {
      // Delegate to Expo's native implementation.
      g.crypto.randomUUID = () => Crypto.randomUUID()
    }
  } catch (e) {
    // Best-effort polyfill; avoid crashing during initialization.
  }
})()

module.exports = {}
