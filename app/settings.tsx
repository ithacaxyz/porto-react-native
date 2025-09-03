import * as React from 'react'
import * as SQLite from 'expo-sqlite'
import { View, Text, StyleSheet } from 'react-native'

export default function Tab() {
  return (
    <View style={styles.container}>
      <Header />
      <Text>Tab [Settings]</Text>
    </View>
  )
}

function Header() {
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  headerContainer: {},
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
})
