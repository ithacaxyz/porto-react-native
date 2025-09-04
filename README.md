# [Porto](https://porto.sh) x React Native

- Passkeys work across Web, iOS, and Android via `react-native-passkeys`.
- Porto is wired for Web (iframe dialog) and Native (relay + WebAuthn bridge).

Quick start (Bun)
- iOS associated domains: ensure `ios.associatedDomains` includes a `webcredentials:` entry that you control. This repo uses `xporto.up.railway.app` for demo.
- Install deps: `bun install`
- Run dev: `bun run dev` (or `bun run ios` / `bun run android` / `bun run web`).
- In the app:
  - Create/Authenticate/Blob: exercises passkey APIs directly.
  - Porto Connect: loads your Porto account using passkeys (native) or iframe (web).
  - Porto Assets: fetches assets for the connected account.

Implementation notes
- `src/lib/porto.ts`: bridges WebAuthn to React Native by adapting `navigator.credentials.create/get` to `react-native-passkeys` (JSON) and passes `keystoreHost` (RP ID) from Expo config.
- `src/app/index.tsx`: adds Porto Connect + Assets buttons and shows results.
