import * as React from 'react'
import * as SQLite from 'expo-sqlite'
import { View, Text } from 'react-native'

export default function Tab() {
  return (
    <View className="flex-1 justify-center items-center p-14">
      <Header />
      <Text className="text-black dark:text-white">Tab [Settings]</Text>
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
    <View className="flex-1 justify-center items-center p-14 text-black dark:text-white">
      <Text className="text-[20px] font-bold text-black dark:text-white">
        SQLite version: {version}
      </Text>
    </View>
  )
}
