import {
  View,
  Text,
  Button,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native'
import {
  rp,
  user,
  challenge,
  base64UrlToString,
  utf8StringToBuffer,
  authenticatorSelection,
  bufferToBase64URLString,
} from '#lib/crypto.ts'
import * as React from 'react'
import alert from '#lib/alert.ts'
import { getPorto } from '#lib/porto.ts'
import { WebView } from 'react-native-webview'
import * as passkey from 'react-native-passkeys'

export default function Tab() {
  const [credentialId, setCredentialId] = React.useState('')
  const [result, setResult] = React.useState<string | null>(null)
  const [portoAddress, setPortoAddress] = React.useState<string | null>(null)
  const [creationResponse, setCreationResponse] = React.useState<string | null>(
    null,
  )

  async function createPasskey() {
    try {
      const json = await passkey.create({
        challenge,
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        rp,
        user,
        authenticatorSelection,
        ...(Platform.OS !== 'android' && {
          extensions: { largeBlob: { support: 'required' } },
        }),
      })

      console.log('creation json -', json)

      if (json?.rawId) setCredentialId(json.rawId)
      if (json?.response) setCreationResponse(json.response)

      setResult(JSON.stringify(json))
    } catch (e) {
      console.error('create error', e)
    }
  }

  async function authenticatePasskey() {
    const json = await passkey.get({
      rpId: rp.id,
      challenge,
      ...(credentialId && {
        allowCredentials: [{ id: credentialId, type: 'public-key' }],
      }),
    })

    console.log('authentication json -', json)

    setResult(JSON.stringify(json))
  }

  async function connectPorto() {
    console.info('connecting to porto...')
    try {
      const { connect, porto } = await getPorto()
      const response = await porto.provider.request({
        method: 'wallet_connect',
        params: [
          {
            capabilities: {
              createAccount: {
                label: `___RN_${Date.now()}`,
              },
            },
          },
        ],
      })
      console.info('response', response)
      const account = response.accounts.at(0)!
      console.info(account)
      setPortoAddress(account.address)
      setResult(JSON.stringify(account, undefined, 2))
    } catch (error) {
      console.error('porto connect error', error)
    }
  }

  async function disconnect() {
    try {
      const { porto } = await getPorto()
      await porto.provider.request({ method: 'wallet_disconnect' })
      setPortoAddress(null)
      setResult('disconnected')
    } catch (error) {
      console.error('porto disconnect error', error)
    }
  }

  async function writeBlob() {
    console.log('user credential id -', credentialId)
    if (!credentialId) {
      alert(
        'No user credential id found - large blob requires a selected credential',
      )
      return
    }

    const json = await passkey.get({
      rpId: rp.id,
      challenge,
      extensions: {
        largeBlob: {
          write: bufferToBase64URLString(
            utf8StringToBuffer('Hey its a private key!') as any,
          ),
        },
      },
      ...(credentialId && {
        allowCredentials: [{ id: credentialId, type: 'public-key' }],
      }),
    })

    console.log('add blob json -', json)

    const written = json?.clientExtensionResults?.largeBlob?.written
    if (written) alert('This blob was written to the passkey')

    setResult(JSON.stringify(json))
  }

  async function readBlob() {
    const json = await passkey.get({
      rpId: rp.id,
      challenge,
      extensions: { largeBlob: { read: true } },
      ...(credentialId && {
        allowCredentials: [{ id: credentialId, type: 'public-key' }],
      }),
    })

    console.log('read blob json -', json)

    const blob = json?.clientExtensionResults?.largeBlob?.blob
    if (blob) alert('This passkey has blob', base64UrlToString(blob))

    setResult(JSON.stringify(json))
  }

  // biome-ignore lint/correctness/noNestedComponentDefinitions: _
  const UserCredentials = () => (
    <Text
      className={`${credentialId ? 'block' : 'hidden'} text-black dark:text-white`}
    >
      User Credential ID: {credentialId}
    </Text>
  )

  // biome-ignore lint/correctness/noNestedComponentDefinitions: _
  const RawJson = () =>
    Platform.OS === 'web' ? (
      <Text className="max-w-[80%] text-black dark:text-white text-sm font-mono overflow-auto">
        {result}
      </Text>
    ) : (
      <WebView
        originWhitelist={['*']}
        className="h-full w-full text-black dark:text-white"
        source={{ html: /* html */ `<pre>${result}</pre>` }}
      />
    )

  return (
    <View className="flex-1 w-full">
      <ScrollView contentContainerClassName="grow items-center justify-center">
        <Text className="text-black dark:text-white text-xl font-extrabold">
          Tab [Home]
        </Text>
        <Text className="text-black dark:text-white">
          Passkeys are {passkey.isSupported() ? 'supported' : 'not supported'}
        </Text>
        <UserCredentials />
        {portoAddress && (
          <Text className="max-w-[80%] text-black dark:text-white text-sm font-mono overflow-auto">
            Porto Address: {portoAddress}
          </Text>
        )}
        <View className="p-16 grid grid-cols-2 grid-rows-2 items-center gap-4 justify-evenly *:border-2 *:w-full">
          <Button title="connect" onPress={connectPorto} />
          {/* <Pressable
            onPress={connectPorto}
            className="bg-white p-10 rounded-[5px] w-[45%] items-center justify-center text-center"
          >
            <Text>connect</Text>
          </Pressable> */}
          <Button title="disconnect" onPress={disconnect} />
          <Button title="Create" onPress={createPasskey} />

          <Button title="Authenticate" onPress={authenticatePasskey} />

          <Button title="Add Blob" onPress={writeBlob} />

          <Button title="Read Blob" onPress={readBlob} />

          {creationResponse && (
            <Pressable
              className="bg-white p-10 rounded-[5px] w-[45%] items-center justify-center text-center"
              onPress={() => {
                alert('Public Key', 'Check logs')
                console.log('Public Key', result)
              }}
            >
              <Text>Get PublicKey</Text>
            </Pressable>
          )}
        </View>
        <View className="text-black dark:text-white text-center items-center max-w-full w-full">
          {result && <RawJson />}
        </View>
      </ScrollView>
    </View>
  )
}
