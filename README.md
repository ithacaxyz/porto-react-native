# Porto x React Native

A React Native application built with Expo and Porto for Web3 authentication and passkey integration.

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [Yarn Classic](https://classic.yarnpkg.com/) (v1.22+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- For iOS development: Xcode and iOS Simulator
- For Android development: Android Studio and Android SDK

### Installation

1. Clone and install dependencies:
   ```bash
   git clone <your-fork-url>
   cd porto-rn
   yarn install
   ```

2. Install iOS dependencies (macOS only):
   ```bash
   cd ios && pod install && cd ..
   ```

## Development

### Running the App

- Start development server: `yarn dev` or `yarn expo start`
- Start with dev client: `yarn start`
- Run on iOS: `yarn ios`
- Run on Android: `yarn android` 
- Run on Web: `yarn web`
- Clear cache and restart: `just clear`

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
  slug: 'your-app-slug',
  name: 'Your App Name',
  scheme: 'your-app-scheme',
  
  ios: {
    appleTeamId: 'YOUR_TEAM_ID',
    bundleIdentifier: 'com.yourcompany.yourapp',
    associatedDomains: ['webcredentials:your-domain.com'],
  },
  android: {
    package: 'com.yourcompany.yourapp',
  },
  extra: {
    eas: {
      projectId: 'your-expo-project-id',
    },
  },
})
```

### Getting Your Values

1. **Apple Team ID**: Found in [Apple Developer Account](https://developer.apple.com/account) → Membership
2. **Bundle Identifier**: Use reverse domain notation (e.g., `com.yourcompany.yourapp`)
3. **EAS Project ID**: Create project at [expo.dev](https://expo.dev) and copy the project ID
4. **Associated Domain**: Your server domain where you'll host the app verification files

## Server Directory

The `./server` directory contains a Bun server that serves app verification files required for:

- iOS Universal Links: Verifies your app can handle deep links from your domain
- Android App Links: Verifies your app can handle Android deep links
- Passkey/WebAuthn: Enables passkey authentication across web and mobile

### Files Served
- `/.well-known/apple-app-site-association` - iOS app verification
- `/.well-known/assetlinks.json` - Android app verification

### Deploying the Server
```bash
just deploy-server  # Deploys to Railway
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
- [Porto Documentation](https://context7.com/ithacaxyz/porto/llms.txt)
- [Apple Universal Links](https://developer.apple.com/ios/universal-links/)
- [Android App Links](https://developer.android.com/training/app-links)
- [WebAuthn/Passkeys Guide](https://webauthn.guide/)
