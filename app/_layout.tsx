import * as React from 'react'
import { Text } from 'react-native'
import * as SQLite from 'expo-sqlite'
import { DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs'

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <React.Suspense fallback={<Text>Loading...</Text>}>
        <SQLite.SQLiteProvider
          databaseName="porto-rn.db"
          onInit={async (_db) => console.info('onInit', _db)}
        >
          <NativeTabs>
            <NativeTabs.Trigger name="index">
              <Label>Home</Label>
              <Icon sf="house.fill" drawable="custom_android_drawable" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="settings">
              <Icon sf="gear" drawable="custom_settings_drawable" />
              <Label>Settings</Label>
            </NativeTabs.Trigger>
          </NativeTabs>
        </SQLite.SQLiteProvider>
      </React.Suspense>
    </ThemeProvider>
  )
}
