// ensure required polyfills are in place before routing loads
import './shims/crypto-bridge.js'
import '@bacons/text-decoder/install'

import 'expo-router/entry'
