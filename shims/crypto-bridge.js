/**
 * Combined RN crypto/Buffer installer + @noble/hashes `crypto` shim.
 * - When imported early (entrypoint), installs react-native-quick-crypto to provide
 *   `globalThis.crypto` (with `subtle`, `getRandomValues`, `randomUUID`) and `Buffer`.
 * - When resolved as "@noble/hashes/crypto", exports a lazy `crypto` getter so
 *   @noble/hashes reads the latest `globalThis.crypto` at access time.
 */

// Ensure the global `crypto` object exists as early as possible, even before install.
;(function ensureGlobalCryptoStub() {
  try {
    const g = typeof globalThis !== 'undefined' ? globalThis : global
    if (typeof g.crypto !== 'object' || !g.crypto) g.crypto = {}
  } catch {}
})()

;(function installQuickCrypto() {
  try {
    // Install QuickCrypto on RN to populate global.crypto & global.Buffer.
    const mod = require('react-native-quick-crypto')
    const install = typeof mod?.install === 'function' ? mod.install : null
    if (install) install()
  } catch {
    // On web or non-RN envs, ignore if module isn't available.
  }
})()

// Export a lazy `crypto` getter for @noble/hashes to consume.
const exp = {}
Object.defineProperty(exp, 'crypto', {
  enumerable: true,
  get() {
    try {
      return typeof globalThis === 'object' && 'crypto' in globalThis
        ? globalThis.crypto
        : undefined
    } catch {
      return undefined
    }
  },
})

module.exports = exp
