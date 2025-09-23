import * as React from 'react'
import Constants from 'expo-constants'
import type { Address, Hex } from 'ox'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { NitroText } from 'react-native-nitro-text'
import * as SafeAreaContext from 'react-native-safe-area-context'
import {
  Button,
  View,
  StyleSheet,
  Platform,
  Text as WebText,
} from 'react-native'

if (Platform.OS === 'web') WebBrowser.maybeCompleteAuthSession()

const Text = Platform.OS === 'web' ? WebText : NitroText

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect

const portoBaseUrl = `${process.env.EXPO_PUBLIC_PORTO_BASE_URL || 'https://id.porto.sh'}/dialog`
/**
 * @see
 * - https://docs.expo.dev/guides/authentication/#rules-for-all-authentication-providers
 * - https://docs.expo.dev/versions/latest/sdk/webbrowser/#webbrowseropenauthsessionasyncurl-redirecturl-options
 *
 * TODO:
 * - [platform:ios,android]
 *   once there's a session-based authentication, we'll use `expo-secure-store`
 *   to store the value
 */

export default function Tab() {
  const [authSessionStatus, setAuthSessionStatus] = React.useState<
    'success' | 'error' | 'idle'
  >('idle')

  const [authError, setAuthError] = React.useState<string | null>(null)
  const [address, setAddress] = React.useState<string | null>(null)
  const [publicKey, setPublicKey] = React.useState<string | null>(null)

  useIsomorphicLayoutEffect(() => {
    if (Platform.OS === 'android') WebBrowser.warmUpAsync()
    return () => {
      if (Platform.OS === 'android') WebBrowser.coolDownAsync()
    }
  }, [])

  async function handleDeepLink(event: Linking.EventType) {
    const { url } = event
    const initialUrl = await Linking.getInitialURL()
    console.info('initialUrl', initialUrl)
    const parsedUrl = Linking.parse(url)
    console.info('parsedUrl', parsedUrl)
    const queryParams = parsedUrl.queryParams as {
      success: 'true' | 'false'
      payload: string | null
    }
    if (queryParams && Object.hasOwn(queryParams, 'success')) {
      console.info('queryParams', queryParams)
      if (['web', 'ios'].includes(Platform.OS)) WebBrowser.dismissAuthSession()
    }
  }

  async function handleAuthSessionPress(options: { createAccount: boolean }) {
    const params = [
      {
        capabilities: {
          email: false,
          createAccount: options.createAccount,
        },
      },
    ]

    const redirectUri = AuthSession.makeRedirectUri({
      path: 'auth',
    })
    console.info('requestUri', redirectUri)

    const searchParams = new URLSearchParams({
      relayEnv: 'prod',
      redirectUri,
      method: 'wallet_connect',
      os: Platform.OS.toLowerCase(),
      params: encodeURIComponent(JSON.stringify(params)),
      _decoded: encodeURIComponent(JSON.stringify(params)),
    })
    const result = await WebBrowser.openAuthSessionAsync(
      `${portoBaseUrl}/wallet_connect?${searchParams.toString()}`,
      redirectUri,
      {
        showTitle: false,
        showInRecents: false,
        toolbarColor: '#0E0D0F',
        enableBarCollapsing: true,
        enableDefaultShareMenuItem: false,
        secondaryToolbarColor: 'transparent',
      },
    )

    if (!Object.hasOwn(result, 'url')) return

    const url = new URL((result as any).url)
    console.info('result.url', url)
    const error = (result as any).error
    const success = url.searchParams.get('success')
    const status = url.searchParams.get('status')
    const message = url.searchParams.get('message')
    if (status !== 'success') {
      setAuthError(`${status} - ${message}`)
      return
    }
    const payload = url.searchParams.get('payload')
    const _typedPayload = { status, payload, message } as RedirectSearchParams
    console.info('error', error)
    console.info('status', status)
    console.info('payload', payload)

    if (success === 'true' || status === 'success') {
      console.info('result.success', success)
      const parsedPayload = payload ? (JSON.parse(payload) as Payload) : null
      const address = parsedPayload?.accounts[0]?.address ?? null
      const publicKey =
        parsedPayload?.accounts[0]?.capabilities.admins[0]?.publicKey ?? null
      setAddress(address)
      setPublicKey(publicKey)
    }

    setAuthSessionStatus(result.type === 'success' ? 'success' : 'error')

    if (Platform.OS === 'web') WebBrowser.maybeCompleteAuthSession()
  }

  useIsomorphicLayoutEffect(() => {
    console.info('handleDeepLink')
    const subscription = Linking.addEventListener('url', handleDeepLink)
    return () => {
      subscription.remove()
    }
  }, [])

  return (
    <SafeAreaContext.SafeAreaView style={styles.container}>
      <View
        style={{
          gap: 10,
          maxWidth: 450,
          marginBottom: 25,
          overflowX: 'scroll',
          flexDirection: 'column',
        }}
      >
        <Text style={styles.text}>AuthSession Status: {authSessionStatus}</Text>
        {address && <Text style={styles.text}>Address: {address}</Text>}
        {publicKey && <Text style={styles.text}>Public Key: {publicKey}</Text>}
        {authError && <Text style={styles.text}>Error: {authError}</Text>}
      </View>
      <Button
        title="AuthSession (create account)"
        onPress={() => handleAuthSessionPress({ createAccount: true })}
      />
      <View style={{ height: 10 }} />
      <Button
        title="AuthSession (select account)"
        onPress={() => handleAuthSessionPress({ createAccount: false })}
      />
    </SafeAreaContext.SafeAreaView>
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
  text: {
    fontSize: 16,
    fontFamily: 'monospace',
  },
  codeBlock: {
    fontSize: 14,
    fontFamily: 'ui-monospace',
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    padding: 16,
    borderRadius: 8,
    lineHeight: 20,
  },
})

type RedirectSearchParams = {
  payload: string
  message: string
  status: 'success' | 'error' | 'cancel' | 'unknown'
}

type Payload = {
  accounts: Array<{
    address: string
    capabilities: {
      admins: Array<{
        id: Address.Address
        publicKey: Hex.Hex
        type: 'webauthn-p256'
        credentialId: string
        privateKey: { credential: { id: string } }
      }>
      permissions: Array<object>
    }
  }>
  chainIds: Array<Hex.Hex>
}
