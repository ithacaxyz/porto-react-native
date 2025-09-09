import '@bacons/text-decoder/install'

if (typeof Buffer === 'undefined') global.Buffer = require('buffer').Buffer

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context'

import * as React from 'react'
import { Text, View, useColorScheme } from 'react-native'

import { Slot } from 'expo-router'

export { ErrorBoundary } from 'expo-router'

export default function RootLayout() {
  const colorScheme = useColorScheme()

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <React.Suspense fallback={<Text>Loading...</Text>}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <View style={{ flex: 1, backgroundColor: '#f9f9f9f9' }}>
            <Slot />
          </View>
        </SafeAreaProvider>
      </React.Suspense>
    </ThemeProvider>
  )
}
