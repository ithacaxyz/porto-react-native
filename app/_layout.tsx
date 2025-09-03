import * as React from 'react'
import * as SQLite from 'expo-sqlite'
import Constants from 'expo-constants'
import { StyleSheet, Text } from 'react-native'
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
          <NativeTabs {...{ blurEffect: 'prominent' }} tintColor="white">
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
  },
  headerContainer: {
    paddingTop: Constants.statusBarHeight,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
})
