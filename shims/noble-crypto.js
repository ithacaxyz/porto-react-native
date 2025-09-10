// Metro shim to replace @noble/hashes/crypto export with a lazy getter.
// Avoids capturing undefined `globalThis.crypto` during module init on RN.

// biome-ignore lint/suspicious/noRedundantUseStrict: _
'use strict'

const exp = {}
Object.defineProperty(exp, 'crypto', {
  enumerable: true,
  get() {
    return typeof globalThis === 'object' && 'crypto' in globalThis
      ? globalThis.crypto
      : undefined
  },
})

module.exports = exp
