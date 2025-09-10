import { Porto, Mode } from 'porto'
import { Platform } from 'react-native'
import { baseSepolia } from 'porto/Chains'
import { custom, createWalletClient } from 'viem'
import { rp, createFn, getFn } from '#lib/passkeys.ts'

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
  chains: [baseSepolia],
})

export const walletClient = createWalletClient({
  chain: baseSepolia,
  transport: custom(porto.provider),
})
