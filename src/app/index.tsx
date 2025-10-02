import { View, Text, Button, StyleSheet } from 'react-native'
import * as React from 'react'
import { Link } from 'expo-router'
import { Checkbox } from 'expo-checkbox'
import { Hex, Json } from 'ox'
import { permissions, porto } from '#lib/porto.ts'
// import { verifyHash, verifyMessage } from 'viem/actions'
import { SafeAreaProvider } from 'react-native-safe-area-context'
// import { hashTypedData, isAddress, isHex, maxUint256 } from 'viem'

export default function Page() {
  return (
    <SafeAreaProvider style={styles.safeAreaProvider}>
      <Link
        href="https://porto.sh/sdk/api/mode#modereactnative"
        style={styles.link}
      >
        Porto React Native API Reference
      </Link>
      <View>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginVertical: 5 }}>
          Account Management
        </Text>
        <Connect />
        <Login />
      </View>
    </SafeAreaProvider>
  )
}

function Divider() {
  return (
    <View style={{ height: 1, backgroundColor: '#ccc', marginVertical: 12 }} />
  )
}

function Pre(props: { text: ReadonlyArray<string> | null }) {
  if (!props.text) return null
  return (
    <View style={{ padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8 }}>
      <Text style={{ fontSize: 14, color: '#666', fontFamily: 'monospace' }}>
        {Json.stringify(props.text, null, 2)}
      </Text>
    </View>
  )
}

function Connect() {
  const [email, setEmail] = React.useState<boolean>(true)
  const [grantPermissions, setGrantPermissions] = React.useState<boolean>(false)
  const [result, setResult] = React.useState<unknown | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  return (
    <View style={{ flex: 1, gap: 16 }}>
      <Text>wallet_connect</Text>
      <View>
        <Button
          onPress={async () => {
            const payload = {
              capabilities: {
                createAccount: false,
                email,
                grantPermissions: grantPermissions ? permissions() : undefined,
              },
            } as const
            return porto.provider
              .request({
                method: 'wallet_connect',
                params: [payload],
              })
              .then(setResult)
              .catch((error) => {
                console.info(payload)
                console.error(error)
                setError(
                  Json.stringify({ error: error.message, payload }, null, 2),
                )
              })
          }}
          title="Login"
        />
        <Divider />
        <Button
          title="Register"
          onPress={async () => {
            const payload = {
              capabilities: {
                createAccount: true,
                email,
                grantPermissions: grantPermissions ? permissions() : undefined,
              },
            } as const
            return porto.provider
              .request({
                method: 'wallet_connect',
                params: [payload],
              })
              .then(setResult)
              .catch((error) => {
                console.info(payload)
                console.error(error)
                setError(
                  Json.stringify({ error: error.message, payload }, null, 2),
                )
              })
          }}
        />
      </View>

      <View style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
          <Checkbox value={email} onValueChange={() => setEmail((x) => !x)} />
          <Text>Email</Text>
        </View>

        <View style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
          <Checkbox
            value={grantPermissions}
            onValueChange={() => setGrantPermissions((x) => !x)}
          />
          <Text>Grant Permissions</Text>
        </View>
      </View>
      {/*<Text style={{ fontFamily: 'monospace' }}>
        {Json.stringify(result, null, 2)}
      </Text>
      <Text style={{ fontFamily: 'monospace' }}>
        {Json.stringify(error, null, 2)}
      </Text>*/}
      <Pre>{result}</Pre>
      <Pre>{error}</Pre>
    </View>
  )
}

function Login() {
  const [result, setResult] = React.useState<readonly string[] | null>(null)

  return (
    <View>
      <Text>eth_requestAccounts</Text>
      <Button
        onPress={() =>
          porto.provider
            .request({ method: 'eth_requestAccounts' })
            .then(setResult)
        }
        title="Login"
      />
      <Pre text={result} />
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
