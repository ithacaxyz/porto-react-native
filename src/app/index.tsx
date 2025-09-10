import {
  View,
  Text,
  Button,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native'
import * as React from 'react'
import { Link } from 'expo-router'
import { type Address, Hex } from 'ox'
import { WalletActions } from 'porto/viem'
import { porto, walletClient } from '#lib/porto.ts'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export default function Tab() {
  const [error, setError] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<string | null>(null)
  const [account, setAccount] = React.useState<Address.Address | undefined>(
    undefined,
  )
  const [message, setMessage] = React.useState<string | undefined>(undefined)
  const [signature, setSignature] = React.useState<string | undefined>(
    undefined,
  )

  async function createAccount() {
    console.info('connecting to porto...')
    try {
      const response = await WalletActions.connect(walletClient, {
        createAccount: {
          label:
            Platform.OS === 'web' ? undefined : `___Porto_RN_${Date.now()}`,
        },
      })
      const [account] = response.accounts
      console.info('\n[porto] wallet_connect address:', account?.address, '\n')
      setAccount(account?.address)
      setResult(JSON.stringify(account, undefined, 2))
    } catch (error) {
      console.error('porto connect error', error)
      setError(error instanceof Error ? error.message : JSON.stringify(error))
    }
  }

  async function signIn() {
    try {
      const response = await WalletActions.connect(walletClient, {
        selectAccount: true,
      })

      const [account] = response.accounts
      setAccount(account?.address)
      console.info('\n[porto] wallet_connect address:', account?.address, '\n')
      setResult(JSON.stringify(account, undefined, 2))
    } catch (error) {
      console.error('porto connect error', error)
      setError(error instanceof Error ? error.message : JSON.stringify(error))
    }
  }

  async function disconnect() {
    try {
      await WalletActions.disconnect(walletClient)
      setResult('disconnected')
    } catch (error) {
      console.error('porto disconnect error', error)
      setError(error instanceof Error ? error.message : JSON.stringify(error))
    }
  }

  async function signMessage() {
    try {
      if (!account) return
      const response = await porto.provider.request({
        method: 'personal_sign',
        params: [Hex.fromString(message ?? 'Hello, world!'), account],
      })

      console.log('sign message response', response)
      setSignature(response)
    } catch (error) {
      console.error('porto sign message error', error)
      setError(error instanceof Error ? error.message : JSON.stringify(error))
    }
  }

  console.info('account', account)
  return (
    <View style={styles.outerView}>
      <Link href="https://porto.sh/sdk/guides/react-native" style={styles.link}>
        porto.sh/sdk/guides/react-native
      </Link>
      <Text style={styles.accountText}>{account}</Text>
      <SafeAreaProvider style={styles.safeAreaProvider}>
        <View style={styles.innerView}>
          <Button title="Create new account" onPress={createAccount} />
          <Button title="sign in" onPress={signIn} />
          <Button title="Disconnect" onPress={disconnect} />

          <TouchableOpacity
            onPress={signMessage}
            disabled={!account}
            style={[
              styles.customButton,
              !account && styles.customButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.customButtonText,
                !account && styles.customButtonTextDisabled,
              ]}
            >
              sign message
            </Text>
          </TouchableOpacity>

          <TextInput
            inputMode="text"
            readOnly={!account}
            editable={!!account}
            style={styles.input}
            placeholder="message"
            value={message ?? ''}
            onChangeText={setMessage}
            placeholderTextColor="gray"
          />
        </View>

        {result ? <Text>{result}</Text> : null}
        {signature ? <Text>{signature}</Text> : null}
        {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      </SafeAreaProvider>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 42,
    textTransform: 'uppercase',
  },
  outerView: {
    flex: 1,
    paddingTop: 42,
  },
  safeAreaProvider: {
    gap: 12,
    padding: 16,
    flexDirection: 'column',
  },
  innerView: {
    gap: 12,
    maxWidth: 400,
    flexDirection: 'column',
  },
  button: {
    textTransform: 'uppercase',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'monospace',
    borderColor: '#000',
    borderWidth: 1.5,
    color: '#000',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderColor: '#000',
    borderWidth: 1.5,
    color: '#000',
    padding: 8,
    outlineStyle: 'solid',
    fontSize: 16,
    fontFamily: 'monospace',
  },
  link: {
    color: '#ffffff',
    backgroundColor: 'rgba(255, 115, 255, 0.64)',
    width: 405,
    padding: 5,
    fontSize: 16,
    marginLeft: 12,
    marginTop: 12,
    fontWeight: 'light',
    fontFamily: 'monospace',
    textDecorationLine: 'underline',
  },
  customButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    alignItems: 'center',
  },
  customButtonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.6,
  },
  customButtonText: {
    color: 'white',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  customButtonTextDisabled: {
    color: '#666666',
  },
  accountText: {
    fontSize: 14,
    marginLeft: 12,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
})
