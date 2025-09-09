// IMPORTANT: This must be imported before any crypto-dependent libraries
import 'react-native-get-random-values'

// Ensure crypto is available
if (typeof globalThis.crypto === 'undefined') {
  console.warn('crypto not available, attempting to polyfill...')
  require('react-native-get-random-values')
}

import {
  rp as rnRp,
  toArrayBufferFromB64Url,
  toB64UrlFromArrayBuffer,
} from '#lib/crypto.ts'
import * as Hex from 'ox/Hex'
// import { Porto, Mode } from 'porto'
import { Platform } from 'react-native'
import * as passkey from 'react-native-passkeys'
import { base, baseSepolia } from 'porto/Chains'
import { custom, createWalletClient } from 'viem'

// Note: The native passkey implementations handle crypto operations internally.
// The Web Crypto API's importKey function is not available in React Native,
// so Porto must rely on the native libraries to handle key generation and signing.

async function createFn(options: any): Promise<any> {
  const publicKey = options?.publicKey || options

  const json = {
    rp: publicKey.rp ?? (rnRp?.id ? { id: rnRp.id, name: rnRp.id } : undefined),
    user: {
      ...publicKey.user,
      id: toB64UrlFromArrayBuffer(publicKey.user.id),
    },
    challenge: toB64UrlFromArrayBuffer(publicKey.challenge),
    pubKeyCredParams: publicKey.pubKeyCredParams,
    timeout: publicKey.timeout,
    excludeCredentials: publicKey.excludeCredentials?.map((d: any) => ({
      ...d,
      id: toB64UrlFromArrayBuffer(d.id),
    })),
    authenticatorSelection: publicKey.authenticatorSelection,
    attestation: publicKey.attestation,
    extensions: publicKey.extensions,
    signal: options?.signal,
  }

  const res = await passkey.create(json as any)
  if (!res) throw new Error('Passkey creation cancelled')

  // Adapt to a PublicKeyCredential-like shape
  const credential = {
    id: res.id,
    rawId: toArrayBufferFromB64Url(res.rawId),
    response: {
      attestationObject: toArrayBufferFromB64Url(
        res.response.attestationObject,
      ),
      clientDataJSON: toArrayBufferFromB64Url(res.response.clientDataJSON),
      // Force OX to use attestationObject fallback for public key extraction.
      // OX calls response.getPublicKey() first and then uses WebCrypto.importKey("spki", ...).
      // React Native does not have WebCrypto, and the native library returns raw x||y, not SPKI.
      // Throw the expected error so OX falls back to parsing attestationObject.
      getPublicKey: () => {
        throw new Error('Permission denied to access object')
      },
    },
    type: res.type,
    clientExtensionResults: res.clientExtensionResults,
    authenticatorAttachment: res.authenticatorAttachment,
  }

  return credential
}

async function getFn(options: any): Promise<any> {
  const publicKey = options?.publicKey || options

  const json = {
    challenge: toB64UrlFromArrayBuffer(publicKey.challenge),
    timeout: publicKey.timeout,
    rpId: publicKey.rpId ?? rnRp?.id,
    allowCredentials: publicKey.allowCredentials?.map((d: any) => ({
      ...d,
      id: toB64UrlFromArrayBuffer(d.id),
    })),
    userVerification: publicKey.userVerification,
    extensions: publicKey.extensions,
  }

  const res = await passkey.get(json as any)
  if (!res) throw new Error('Passkey authentication cancelled')

  const credential = {
    id: res.id,
    rawId: toArrayBufferFromB64Url(res.rawId),
    response: {
      authenticatorData: toArrayBufferFromB64Url(
        res.response.authenticatorData,
      ),
      clientDataJSON: toArrayBufferFromB64Url(res.response.clientDataJSON),
      signature: toArrayBufferFromB64Url(res.response.signature),
      userHandle: res.response.userHandle
        ? toArrayBufferFromB64Url(res.response.userHandle)
        : null,
    },
    type: res.type,
    clientExtensionResults: res.clientExtensionResults,
    authenticatorAttachment: res.authenticatorAttachment,
  }

  return credential
}

export async function getPorto() {
  const { Porto, Mode } = await import('porto')
  const porto = Porto.create({
    mode:
      Platform.OS === 'web'
        ? Mode.dialog()
        : Mode.relay({
            keystoreHost: rnRp?.id,
            webAuthn: { createFn, getFn },
          }),
    chains: [base, baseSepolia],
    // storage:
    //   Platform.OS === 'web'
    //     ? Storage.localStorage()
    //     : Storage.combine(Storage.cookie(), Storage.memory()),
  })

  const walletClient = createWalletClient({
    chain: baseSepolia,

    transport: custom(porto.provider),
  })

  /**
   * Minimal in-memory cache for selectAccount to skip WebAuthn discovery.
   * Persisting across restarts can be added later (e.g. SecureStore/SQLite).
   */
  let selectAccountCache: {
    address: `0x${string}`
    credentialId?: string
    publicKey: `0x${string}`
  } | null = null

  function updateSelectAccountCache(response: any) {
    try {
      const account = response?.accounts?.[0]
      if (!account) return
      const address = account.address as `0x${string}`
      const adminKey = account.capabilities?.admins?.find(
        (k: any) => k?.type === 'webauthn-p256',
      )
      if (!adminKey) return
      const publicKey = adminKey.publicKey as `0x${string}`
      const credentialId = adminKey.credentialId as string | undefined
      if (Hex.validate(publicKey))
        selectAccountCache = { address, credentialId, publicKey }
    } catch {}
  }

  async function connect(parameters?: { capabilities?: any }) {
    console.log('connect', parameters)
    const caps = { ...(parameters?.capabilities ?? {}) }
    if (selectAccountCache) {
      caps.selectAccount = {
        address: selectAccountCache.address,
        key: {
          credentialId: selectAccountCache.credentialId,
          publicKey: selectAccountCache.publicKey,
        },
      }
    }

    const response = await porto.provider.request({
      method: 'wallet_connect',
      params: [
        {
          capabilities: caps,
        },
      ],
    })
    console.info('response', response)
    updateSelectAccountCache(response)
    return response
  }

  return { porto, walletClient, connect }
}
