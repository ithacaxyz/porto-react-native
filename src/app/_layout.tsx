import '#global.css'
import '@bacons/text-decoder/install'

if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer
}

import * as React from 'react'
import * as SQLite from 'expo-sqlite'
import { Text, View } from 'react-native'
import { DarkTheme, ThemeProvider } from '@react-navigation/native'
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs'

export { ErrorBoundary } from 'expo-router'

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <React.Suspense fallback={<Text>Loading...</Text>}>
        <SQLite.SQLiteProvider
          databaseName="porto-rn.db"
          onInit={async (_db) => console.info('onInit', _db)}
        >
          <View className="h-full w-full flex-1">
            <NativeTabs>
              <NativeTabs.Trigger name="index">
                <Label>Home</Label>
                <Icon sf="house.fill" />
              </NativeTabs.Trigger>
              <NativeTabs.Trigger name="settings">
                <Icon sf="gear" />
                <Label>Settings</Label>
              </NativeTabs.Trigger>
            </NativeTabs>
          </View>
        </SQLite.SQLiteProvider>
      </React.Suspense>
    </ThemeProvider>
  )
}
