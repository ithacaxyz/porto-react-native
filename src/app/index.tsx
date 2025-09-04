import { View, Text, Platform, Pressable, ScrollView } from 'react-native'
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
import * as passkey from 'react-native-passkeys'

export default function Tab() {
  const [result, setResult] = React.useState<any>(null)
  const [creationResponse, setCreationResponse] = React.useState<
    NonNullable<Awaited<ReturnType<typeof passkey.create>>>['response'] | null
  >(null)
  const [credentialId, setCredentialId] = React.useState('')

  const createPasskey = async () => {
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

  const authenticatePasskey = async () => {
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
      <ScrollView contentContainerClassName="grow items-center justify-end">
        <Text>Tab [Home]</Text>
        <Text>
          Passkeys are {passkey.isSupported() ? 'supported' : 'not supported'}
        </Text>
        <UserCredentials />
        <View className="p-24 flex-row flex-wrap items-center gap-y-4 justify-evenly">
          <Pressable
            className="bg-white p-10 rounded-[5px] w-[45%] items-center justify-center text-center"
            onPress={createPasskey}
          >
            <Text>Create</Text>
          </Pressable>
          <Pressable
            className="bg-white p-10 rounded-[5px] w-[45%] items-center justify-center text-center"
            onPress={authenticatePasskey}
          >
            <Text>Authenticate</Text>
          </Pressable>
          <Pressable
            className="bg-white p-10 rounded-[5px] w-[45%] items-center justify-center text-center"
            onPress={writeBlob}
          >
            <Text>Add Blob</Text>
          </Pressable>
          <Pressable
            className="bg-white p-10 rounded-[5px] w-[45%] items-center justify-center text-center"
            onPress={readBlob}
          >
            <Text>Read Blob</Text>
          </Pressable>
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
        {result && (
          <Text className="max-w-[80%]">
            Result {JSON.stringify(result, null, 2)}
          </Text>
        )}
      </ScrollView>
    </View>
  )
}
