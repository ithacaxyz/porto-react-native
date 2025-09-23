import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import * as React from 'react'
import { StatusBar } from 'expo-status-bar'
import * as SafeAreaContext from 'react-native-safe-area-context'
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui'
import { View, Text, useColorScheme, StyleSheet } from 'react-native'

export { ErrorBoundary } from 'expo-router'

export default function RootLayout() {
  const colorScheme = useColorScheme()

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.container}>
        <StatusBar style="light" />
        <SafeAreaContext.SafeAreaProvider>
          <React.Suspense fallback={<Text>Loading...</Text>}>
            <StatusBar
              style="light"
              animated={true}
              translucent={true}
              backgroundColor="#f00f"
              networkActivityIndicatorVisible={true}
            />
            <Tabs>
              <TabSlot style={styles.tabSlot} />
              <TabList>
                <TabTrigger name="home" href="/" style={styles.tabTrigger}>
                  <Text style={styles.tabTriggerText}>Home</Text>
                </TabTrigger>
                <View style={{ width: 4 }} />
                <TabTrigger name="auth" href="/auth" style={styles.tabTrigger}>
                  <Text style={styles.tabTriggerText}>Auth</Text>
                </TabTrigger>
              </TabList>
            </Tabs>
          </React.Suspense>
        </SafeAreaContext.SafeAreaProvider>
      </View>
    </ThemeProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9f9',
  },
  tabSlot: { flex: 1, backgroundColor: '#f9f9f9f9' },
  tabTrigger: {
    height: 50,
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f0f',
  },
  tabTriggerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f9f9f9f9',
  },
})
