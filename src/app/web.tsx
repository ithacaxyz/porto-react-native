import * as React from 'react'
import { porto } from '#lib/porto.ts'
import Constants from 'expo-constants'
import * as WebBrowser from 'expo-web-browser'
import { Button, Text, View, StyleSheet, Platform } from 'react-native'

/**
 * @see https://docs.expo.dev/versions/latest/sdk/webbrowser/#webbrowseropenauthsessionasyncurl-redirecturl-options
 */

function Events() {
  const [responses, setResponses] = React.useState<Record<string, unknown[]>>(
    {},
  )
  React.useEffect(() => {
    const handleResponse = (event: string) => (response: unknown) =>
      setResponses((responses) => ({
        ...responses,
        [event]: [...(responses[event] ?? []), response],
      }))

    const handleAccountsChanged = handleResponse('accountsChanged')
    const handleChainChanged = handleResponse('chainChanged')
    const handleConnect = handleResponse('connect')
    const handleDisconnect = handleResponse('disconnect')
    const handleMessage = handleResponse('message')

    porto.provider.on('accountsChanged', handleAccountsChanged)
    porto.provider.on('chainChanged', handleChainChanged)
    porto.provider.on('connect', handleConnect)
    porto.provider.on('disconnect', handleDisconnect)
    porto.provider.on('message', handleMessage)
    return () => {
      porto.provider.removeListener('accountsChanged', handleAccountsChanged)
      porto.provider.removeListener('chainChanged', handleChainChanged)
      porto.provider.removeListener('connect', handleConnect)
      porto.provider.removeListener('disconnect', handleDisconnect)
      porto.provider.removeListener('message', handleMessage)
    }
  }, [])

  return (
    <View>
      <Text>Events</Text>
      <Text>{JSON.stringify(responses, null, 2)}</Text>
    </View>
  )
}

export default function Tab() {
  const [authSessionResult, setAuthSessionResult] =
    React.useState<WebBrowser.WebBrowserAuthSessionResult | null>(null)

  React.useEffect(() => {
    if (Platform.OS !== 'web') WebBrowser.warmUpAsync()
    return () => {
      if (Platform.OS !== 'web') WebBrowser.coolDownAsync()
    }
  }, [])

  const handleAuthSessionPressAsync = async () => {
    const result = await WebBrowser.openAuthSessionAsync(
      'https://id.porto.sh/dialog/wallet_connect?relayEnv=prod&_decoded={"method"%3A"wallet_connect"%2C"params"%3A[{"capabilities"%3A{"createAccount"%3Atrue%2C"email"%3Atrue}}]}&id=1&method=wallet_connect&params=[{"capabilities"%3A{"createAccount"%3Atrue%2C"email"%3Atrue}}]&jsonrpc=2.0',
      'porto-rn://',
      {
        showTitle: false,
        showInRecents: false,
        toolbarColor: '#0E0D0F',
        enableBarCollapsing: true,
        enableDefaultShareMenuItem: false,
        secondaryToolbarColor: 'transparent',
      },
    )
    setAuthSessionResult(result)
  }
  return (
    <View style={styles.container}>
      <Button title="Open AuthSession" onPress={handleAuthSessionPressAsync} />
      <Text>{authSessionResult && JSON.stringify(authSessionResult)}</Text>
      <Events />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    paddingTop: Constants.statusBarHeight,
  },
})
