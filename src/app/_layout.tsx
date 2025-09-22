import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import { View, Text, useColorScheme } from 'react-native'
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui'

export { ErrorBoundary } from 'expo-router'

export default function RootLayout() {
  const colorScheme = useColorScheme()

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Tabs>
        <TabSlot style={{ flex: 1, backgroundColor: '#f9f9f9f9' }} />
        <TabList>
          <TabTrigger
            name="home"
            href="/"
            style={{
              height: 50,
              width: '50%',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'darkgray',
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Home</Text>
          </TabTrigger>
          <View style={{ height: 50, width: 6 }} />
          <TabTrigger
            name="web"
            href="/web"
            style={{
              height: 50,
              width: '50%',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'darkgray',
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Web</Text>
          </TabTrigger>
        </TabList>
      </Tabs>
    </ThemeProvider>
  )
}
