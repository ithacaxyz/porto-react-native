# [Porto](https://porto.sh) x React Native

A React Native application built with Expo v54 and [Porto](https://porto.sh) for Web3 authentication and passkey integration.

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [Yarn Classic](https://classic.yarnpkg.com/) (v1.22+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- For iOS development: XCode and iOS Simulator
- For Android development: Android Studio and Android SDK
- For EAS Builds: EAS CLI (for running EAS Build locally)

### Installation

1. **Clone and install dependencies:**

   ```bash
   gh repo clone o-az/porto-react-native
   cd porto-react-native
   yarn install
   ```

2. **Install iOS dependencies (macOS only):**

   ```bash
   cd ios && pod install && cd ..
   ```

## Development

### Running the App

```sh
yarn expo start --clear --tunnel --no-build-cache --dev-client
```

Press:

- `a` to run on Android. If your physical device is connected, it will automatically select it,
- `shift + a` to view Android options,
- `i` for iOS. Note that passkeys are not supported on iOS Simulator so you need to use an actual device,
- `w` for Web.

### Crypto/Buffer setup (React Native)

We install `react-native-quick-crypto` at startup (see `shims/crypto-bridge.js`).
It provides `globalThis.crypto` (including `subtle`) and `Buffer`, so no custom Metro aliases or
extra shims are needed for `crypto`, `buffer`, or `@noble/hashes`.

Metro is configured to prefer ESM (e.g., for `viem`) via package exports, avoiding Node-only CJS deps.

### Available Commands (via [just](https://github.com/casey/just))

- `just fmt` - Format code with Biome
- `just test` - Run tests
- `just build` - Build the project
- `just doctor` - Fix dependencies and run expo doctor
- `just deploy-server` - Deploy server to Railway
- `just android-device` - Mirror Android device screen
- `just android-cert` - Generate Android debug certificate

## Configuration for Forks

When forking this project, update the following fields in `app.config.ts`:

### Required Changes

```typescript
export default (context: ConfigContext): ExpoConfig => ({
  // Update these fields:
  slug: 'your-app-slug',           // Line 8
  name: 'Your App Name',           // Line 9
  scheme: 'your-app-scheme',       // Line 10
  
  ios: {
    appleTeamId: 'YOUR_TEAM_ID',                    // Line 16
    bundleIdentifier: 'com.yourcompany.yourapp',    // Line 17
    associatedDomains: ['webcredentials:your-domain.com'], // Line 18
  },
  android: {
    package: 'com.yourcompany.yourapp',             // Line 21
  },
  extra: {
    eas: {
      projectId: 'your-expo-project-id',            // Line 32
    },
  },
})
```

### Getting Your Values

1. **Apple Team ID**: Found in [Apple Developer Account](https://developer.apple.com/account) → Membership
2. **Bundle Identifier**: Use reverse domain notation (e.g., `com.yourcompany.yourapp`)
3. **EAS Project ID**: Create project at [expo.dev](https://expo.dev) and copy the project ID
4. **Associated Domain**: Your server domain where you'll host the app verification files

## Server Directory (`./server`)

The `./server` directory contains a [Bun](https://bun.sh) server that serves **App Verification Files** required for:

### Purpose

- **iOS Universal Links**: Verifies your app can handle deep links from your domain
- **Android App Links**: Verifies your app can handle Android deep links
- **Passkey/WebAuthn**: Enables passkey authentication across web and mobile

### Files Served

- `/.well-known/apple-app-site-association` - iOS app verification
- `/.well-known/assetlinks.json` - Android app verification

### Deploying the Server

I'm deploy to railway but you can deploy anywhere [./server/index.ts](./server/index.ts) can run.

```bash
just deploy-server
```

## Apple Associated Domains Setup

To enable Universal Links and passkey authentication:

### 1. Update App Configuration

In `app.config.ts`, set your domain:

```typescript
ios: {
  associatedDomains: ['webcredentials:yourdomain.com'],
}
```

### 2. Configure Apple App Site Association

Update `server/apple-app-site-association`:

```json
{
  "webcredentials": {
    "apps": [
      "YOUR_TEAM_ID.your.bundle.identifier"
    ]
  }
}
```

### 3. Configure Android Asset Links

Update `server/assetlinks.json`:

```json
[
  {
    "relation": [
      "delegate_permission/common.handle_all_urls",
      "delegate_permission/common.get_login_creds"
    ],
    "target": {
      "namespace": "android_app",
      "package_name": "your.android.package",
      "sha256_cert_fingerprints": [
        "YOUR_RELEASE_KEY_SHA256",
        "YOUR_DEBUG_KEY_SHA256"
      ]
    }
  }
]
```

### 4. Get Android Certificate Fingerprints

```bash
# Generate debug certificate
just android-cert

# For release builds, get the SHA256 from your release keystore:
keytool -list -v -keystore your-release-key.keystore -alias your-alias
```

### 5. Deploy and Verify

1. Deploy your server with the updated files
2. Verify files are accessible:
   - `https://yourdomain.com/.well-known/apple-app-site-association`
   - `https://yourdomain.com/.well-known/assetlinks.json`
3. Test deep links and passkey functionality

## Useful Links

- [Expo Documentation](https://docs.expo.dev/)
- [Porto Documentation](https://porto.sh)
- [Apple Universal Links](https://developer.apple.com/ios/universal-links/)
- [Android App Links](https://developer.android.com/training/app-links)
- [WebAuthn/Passkeys Guide](https://webauthn.guide/)
