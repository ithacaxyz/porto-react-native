import { Platform } from 'react-native'
import { base64 } from '@hexagon/base64'
import { encode as btoa } from 'base-64'
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

// const rpDomain = process.env.EXPO_PUBLIC_SERVER_DOMAIN
const rpDomain = 'xporto.up.railway.app'

export const rp = {
  id: Platform.select({
    // web: undefined,
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

export const bufferToArrayBuffer = (
  input: BufferSource,
): ArrayBuffer | SharedArrayBuffer =>
  input instanceof ArrayBuffer
    ? input
    : input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength)

export const bufferToBase64URL = (input: BufferSource) => {
  const bytes =
    input instanceof ArrayBuffer
      ? new Uint8Array(input)
      : new Uint8Array(input.buffer, input.byteOffset, input.byteLength)

  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export function urlBase64ToArrayBuffer(input: string): ArrayBuffer {
  return base64.toArrayBuffer(input, true)
}
