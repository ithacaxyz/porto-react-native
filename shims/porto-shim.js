// Run crypto polyfill before loading Porto internals.
require('../polyfills/setup-crypto.js')

// Re-export Porto package after polyfill.
module.exports = require('porto/_dist/index.js')
