import { Platform } from 'react-native'
import { base64 } from '@hexagon/base64'
import { encode as btoa } from 'base-64'

import Constants from 'expo-constants'
import * as Application from 'expo-application'

export function bufferToBase64URLString(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  let result = ''

  for (const characterCode of bytes)
    result += String.fromCharCode(characterCode)

  return btoa(result).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export function utf8StringToBuffer(value: string) {
  return new TextEncoder().encode(value)
}

export function base64UrlToString(base64urlString: Base64URLString) {
  return base64.toString(base64urlString, true)
}

export const bundleId = Application.applicationId
  ?.split('.')
  .reverse()
  .join('.')

// Derive the Relying Party ID (domain) from the Expo iOS associated domains
// Prefer the `webcredentials:` entry to keep native passkeys aligned
const associatedDomains: string[] | undefined = (Constants.expoConfig as any)
  ?.ios?.associatedDomains
const webcredentialsEntry = associatedDomains?.find((d) =>
  d.startsWith('webcredentials:'),
)
// Strip the prefix and any query string (e.g. `?mode=developer`)
const rpDomain = webcredentialsEntry
  ?.replace('webcredentials:', '')
  ?.split('?')
  .at(0)

export const rp = {
  id: Platform.select({
    web: undefined,
    // For native (iOS/Android), RP ID must be a domain you control
    ios: rpDomain,
    android: rpDomain,
  }),
  name: 'porto-rn',
} satisfies PublicKeyCredentialRpEntity

// Don't do this in production!
export const challenge = bufferToBase64URLString(
  utf8StringToBuffer('fizz') as any,
)

export const user = {
  id: bufferToBase64URLString(utf8StringToBuffer('290283490') as any),
  displayName: 'username',
  name: 'username',
} satisfies PublicKeyCredentialUserEntityJSON

export const authenticatorSelection = {
  userVerification: 'required',
  residentKey: 'required',
} satisfies AuthenticatorSelectionCriteria

export function toArrayBufferFromB64Url(input: string) {
  return base64.toArrayBuffer(input, true)
}

export function toB64UrlFromArrayBuffer(input: ArrayBuffer) {
  return bufferToBase64URLString(input)
}
