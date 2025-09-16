import {
  http,
  serialize,
  deserialize,
  createConfig,
  WagmiProvider,
} from 'wagmi'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context'
import { Json } from 'ox'
import { Slot } from 'expo-router'
import { baseSepolia } from 'porto/Chains'
import { View, useColorScheme } from 'react-native'
import { porto as portoConnector } from 'porto/wagmi'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { QueryCache, QueryClient, MutationCache } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'

const config = createConfig({
  chains: [baseSepolia],
  connectors: [portoConnector()],
  transports: {
    [baseSepolia.id]: http(),
  },
})

const client: QueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1_000 * 60 * 60 * 24, // 24 hours
      queryKeyHashFn: Json.stringify,
      refetchOnReconnect: () => !client.isMutating(),
      retry: 0,
    },
  },
  mutationCache: new MutationCache({
    onError: (error) => {
      if (process.env.NODE_ENV !== 'development') return
      console.error(error)
    },
  }),
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (process.env.NODE_ENV !== 'development') return
      if (query.state.data !== undefined) console.error(error)
    },
  }),
})

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  serialize,
  deserialize,
})

export { ErrorBoundary } from 'expo-router'

export default function RootLayout() {
  const colorScheme = useColorScheme()

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <WagmiProvider config={config}>
          <PersistQueryClientProvider
            client={client}
            persistOptions={{ persister }}
          >
            <View style={{ flex: 1, backgroundColor: '#f9f9f9f9' }}>
              <Slot />
            </View>
          </PersistQueryClientProvider>
        </WagmiProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  )
}

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
