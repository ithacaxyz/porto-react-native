import { DarkTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import * as React from 'react'
import Constants from 'expo-constants'
import { StyleSheet, Text, View } from 'react-native'
import * as SQLite from 'expo-sqlite'

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <React.Suspense fallback={<Text>Loading...</Text>}>
        <SQLite.SQLiteProvider
          databaseName="porto-rn.db"
          onInit={async (_db) => console.info('onInit', _db)}
        >
          <Stack>
            <Header />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </SQLite.SQLiteProvider>
      </React.Suspense>
    </ThemeProvider>
    // </View>
  )
}

export function Header() {
  const db = SQLite.useSQLiteContext()
  const [version, setVersion] = React.useState('')
  React.useEffect(() => {
    async function setup() {
      const result = await db.getFirstAsync<{ 'sqlite_version()': string }>(
        'SELECT sqlite_version()',
      )
      setVersion(result?.['sqlite_version()'] ?? '')
    }
    setup()
  }, [db.getFirstAsync])
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>SQLite version: {version}</Text>
    </View>
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
