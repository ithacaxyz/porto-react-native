'use strict'

/**
 * export a lazy `crypto` getter so @noble/hashes
 * reads the latest `globalThis.crypto` at access time, not at module init.
 */
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
