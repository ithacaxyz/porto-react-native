// ensure required polyfills are in place before routing loads
import './polyfills/setup-crypto.js'
import '@bacons/text-decoder/install'

if (typeof Buffer === 'undefined') global.Buffer = require('buffer').Buffer

import 'expo-router/entry'
