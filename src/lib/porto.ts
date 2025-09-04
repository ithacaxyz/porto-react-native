import {
  rp as rnRp,
  toArrayBufferFromB64Url,
  toB64UrlFromArrayBuffer,
} from '#lib/crypto.ts'
import { Platform } from 'react-native'
import * as passkey from 'react-native-passkeys'
import { base, baseSepolia } from 'porto/Chains'
import { custom, createWalletClient } from 'viem'
import { Porto, Mode, Storage } from 'porto'

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
  return {
    id: res.id,
    rawId: toArrayBufferFromB64Url(res.rawId),
    response: {
      attestationObject: toArrayBufferFromB64Url(
        res.response.attestationObject,
      ),
      clientDataJSON: toArrayBufferFromB64Url(res.response.clientDataJSON),
      // react-native-passkeys adds getPublicKey
      getPublicKey: res.response.getPublicKey,
    },
    type: res.type,
    clientExtensionResults: res.clientExtensionResults,
  }
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

  return {
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
  }
}

const portoMode =
  // Platform.OS === 'web'
  //   ? Mode.dialog({ renderer: Dialog.popup() })
  //   :
  Mode.relay({
    keystoreHost: rnRp?.id,
    webAuthn: { createFn, getFn },
  })

// export const porto = Porto.create({
//   mode: portoMode,
//   chains: [base, baseSepolia],
//   storage:
//     Platform.OS === 'web'
//       ? Storage.localStorage()
//       : Storage.combine(Storage.cookie(), Storage.memory()),
// })

export function getPorto() {
  const porto = Porto.create({
    mode: portoMode,
    chains: [base, baseSepolia],
    storage:
      Platform.OS === 'web'
        ? Storage.localStorage()
        : Storage.combine(Storage.cookie(), Storage.memory()),
  })

  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: custom(porto.provider),
  })

  return { porto, walletClient }
}
