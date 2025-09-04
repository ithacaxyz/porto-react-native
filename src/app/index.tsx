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
import { porto } from '#lib/porto.ts'
import * as passkey from 'react-native-passkeys'

export default function Tab() {
  const [result, setResult] = React.useState<any>(null)
  const [creationResponse, setCreationResponse] = React.useState<
    NonNullable<Awaited<ReturnType<typeof passkey.create>>>['response'] | null
  >(null)
  const [credentialId, setCredentialId] = React.useState('')
  const [portoAddress, setPortoAddress] = React.useState<string | null>(null)

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

      setResult(json)
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

    setResult(json)
  }

  async function connectPorto() {
    console.info('connecting to porto...')
    try {
      const account = await porto.provider.request({
        method: 'wallet_connect',
      })
      console.info(account)
      setPortoAddress(account.accounts.at(0)!.address)
      setResult({ portoConnect: { addresses: account.accounts! } })
    } catch (e) {
      console.error('porto connect error', e)
    }
  }

  async function disconnect() {
    try {
      await porto.provider.request({
        method: 'wallet_disconnect',
      })
      setPortoAddress(null)
      setResult({ portoDisconnect: true })
    } catch (error) {
      console.error('porto disconnect error', error)
    }
  }

  const writeBlob = async () => {
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

    setResult(json)
  }

  const readBlob = async () => {
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

    setResult(json)
  }

  // biome-ignore lint/correctness/noNestedComponentDefinitions: _
  const UserCredentials = () => (
    <Text className={`${credentialId ? 'block' : 'hidden'}`}>
      User Credential ID: {credentialId}
    </Text>
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
        <View className="p-16 grid grid-cols-2 grid-rows-2 items-center gap-4 justify-evenly *:border-2 *:w-full">
          <Button title="connect" onPress={connectPorto} />
          <Button title="disconnect" onPress={disconnect} />
          <Button title="Create" onPress={createPasskey} />

          <Button title="Authenticate" onPress={authenticatePasskey} />

          <Button title="Add Blob" onPress={writeBlob} />

          <Button title="Read Blob" onPress={readBlob} />

          {creationResponse && (
            <Pressable
              className="bg-white p-10 rounded-[5px] w-[45%] items-center justify-center text-center"
              onPress={() => {
                alert(
                  'Public Key',
                  creationResponse?.getPublicKey() as Uint8Array as any,
                )
              }}
            >
              <Text>Get PublicKey</Text>
            </Pressable>
          )}
        </View>
        <View className="text-black dark:text-white">
          {result && (
            <Text className="max-w-[80%] text-black dark:text-white">
              Result {JSON.stringify(result, null, 2)}
            </Text>
          )}
          {portoAddress && (
            <Text className="max-w-[80%] text-black dark:text-white">
              Porto Address: {portoAddress}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
