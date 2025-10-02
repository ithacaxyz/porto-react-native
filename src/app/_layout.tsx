import * as React from 'react'
import { Stack } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import * as SafeAreaContext from 'react-native-safe-area-context'

export { ErrorBoundary } from 'expo-router'

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <SafeAreaContext.SafeAreaProvider>
        <React.Suspense fallback={<Text>Loading...</Text>}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </React.Suspense>
      </SafeAreaContext.SafeAreaProvider>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9f9',
  },
})
