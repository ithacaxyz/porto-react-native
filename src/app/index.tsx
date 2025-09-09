import { type Address, Hex } from 'ox'
import * as React from 'react'
import { Link } from 'expo-router'
import { WalletActions } from 'porto/viem'
import { porto, walletClient } from '#lib/porto.ts'
import {
  View,
  Text,
  Button,
  Platform,
  StyleSheet,
  TextInput,
} from 'react-native'
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
      const account = response.accounts.at(0)!
      console.info('\n[porto] wallet_connect address:', account.address, '\n')
      setAccount(account.address)
      console.info(
        '\n[porto] wallet_connect chainIds:',
        response.chainIds,
        '\n',
      )
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

      const account = response.accounts.at(0)!
      setAccount(account.address)
      console.info('\n[porto] wallet_connect address:', account.address, '\n')
      console.info(
        '\n[porto] wallet_connect chainIds:',
        response.chainIds,
        '\n',
      )
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
  return (
    <View
      style={{
        flex: 1,
        paddingTop: 42,
      }}
    >
      <Link
        href="https://porto.sh"
        style={{
          marginLeft: 12,
          textDecorationLine: 'underline',
          color: 'blue',
        }}
      >
        porto.sh
      </Link>
      <SafeAreaProvider
        style={{
          padding: 16,
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <View
          style={{
            flexDirection: 'column',
            gap: 12,
            maxWidth: 400,
          }}
        >
          <Button title="Create new account" onPress={createAccount} />
          <Button title="sign in" onPress={signIn} />
          <Button title="Disconnect" onPress={disconnect} />
          <View>
            <Button
              title="sign message"
              onPress={signMessage}
              disabled={!account}
            />

            <TextInput
              placeholder="message"
              placeholderTextColor="gray"
              // editable={!account}
              // readOnly={!account}
              style={styles.input}
              value={message ?? ''}
              onChangeText={setMessage}
            />
          </View>
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
    fontSize: 16,
    fontFamily: 'monospace',
  },
})
