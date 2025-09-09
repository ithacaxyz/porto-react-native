import {
  bufferToBase64URL,
  toArrayBufferFromB64Url,
  toB64UrlFromArrayBuffer,
} from '#lib/crypto.ts'
import { Porto, Mode } from 'porto'
import { Platform } from 'react-native'
import * as passkey from 'react-native-passkeys'
import { base, baseSepolia } from 'porto/Chains'
import { custom, createWalletClient } from 'viem'

const rpDomain = 'xporto.up.railway.app'

export const rp = {
  id: Platform.select({
    ios: rpDomain,
    android: rpDomain,
  }),
  name: 'porto-rn',
} satisfies PublicKeyCredentialRpEntity

async function createFn(options?: any): Promise<any> {
  const publicKey = (options?.publicKey ||
    options) as PublicKeyCredentialCreationOptions

  const json = {
    rp: publicKey.rp ?? (rp?.id ? { id: rp.id, name: rp.id } : undefined),
    user: {
      ...publicKey.user,
      id: bufferToBase64URL(publicKey.user.id),
    },
    challenge: bufferToBase64URL(publicKey.challenge),
    pubKeyCredParams: publicKey.pubKeyCredParams,
    timeout: publicKey.timeout,
    excludeCredentials: publicKey.excludeCredentials?.map((d: any) => ({
      ...d,
      id: toB64UrlFromArrayBuffer(d.id),
    })),
    authenticatorSelection: publicKey.authenticatorSelection,
    attestation: publicKey.attestation,
    extensions: {
      ...publicKey.extensions,
      largeBlob: { support: 'preferred' },
    },
    signal: options?.signal,
  }

  const response = await passkey.create(json as any)
  if (!response) throw new Error('Passkey creation cancelled')

  // Adapt to a PublicKeyCredential-like shape
  const credential = {
    id: response.id,
    rawId: toArrayBufferFromB64Url(response.rawId),
    response: {
      attestationObject: toArrayBufferFromB64Url(
        response.response.attestationObject,
      ),
      clientDataJSON: toArrayBufferFromB64Url(response.response.clientDataJSON),
      getPublicKey: () => {
        throw new Error('Permission denied to access object')
      },
    },
    type: response.type,
    clientExtensionResults: response.clientExtensionResults,
    authenticatorAttachment: response.authenticatorAttachment,
  }

  return credential
}

async function getFn(options?: any): Promise<any> {
  const publicKey =
    options?.publicKey || (options as PublicKeyCredentialRequestOptions)

  const response = await passkey.get({
    rpId: publicKey.rpId,
    timeout: publicKey.timeout,
    challenge: bufferToBase64URL(publicKey.challenge),
    extensions: { largeBlob: { support: 'preferred' } },
    allowCredentials: publicKey.allowCredentials?.map((item: any) => ({
      ...item,
      id: bufferToBase64URL(item.id),
    })),
    userVerification: publicKey.userVerification,
  })
  if (!response) throw new Error('Passkey authentication cancelled')
  const credential = {
    id: response.id,
    rawId: toArrayBufferFromB64Url(response.rawId),
    response: {
      authenticatorData: toArrayBufferFromB64Url(
        response.response.authenticatorData,
      ),
      clientDataJSON: toArrayBufferFromB64Url(response.response.clientDataJSON),
      signature: toArrayBufferFromB64Url(response.response.signature),
      userHandle: response.response.userHandle
        ? toArrayBufferFromB64Url(response.response.userHandle)
        : null,
    },
    type: response.type,
    clientExtensionResults: response.clientExtensionResults,
    authenticatorAttachment: response.authenticatorAttachment,
  }

  return credential
}

export const porto = Porto.create({
  ...Platform.select({
    web: { mode: Mode.dialog() },
    default: {
      mode: Mode.relay({
        keystoreHost: rp?.id,
        webAuthn: { createFn, getFn },
      }),
    },
  }),
  chains: [base, baseSepolia],
})

export const walletClient = createWalletClient({
  chain: baseSepolia,
  transport: custom(porto.provider),
})
