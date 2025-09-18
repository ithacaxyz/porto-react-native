# [Porto](https://porto.sh) x React Native

A Porto React Native template.

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org) (LTS)<sup>1</sup>
- [Yarn Classic](https://classic.yarnpkg.com) (v1.22+)<sup>1</sup>
- [Expo](https://docs.expo.dev/get-started/installation)<sup>1.5</sup>
- [EAS CLI](https://docs.expo.dev/build/introduction)<sup>1.5</sup>
- iOS Requirements (skip if you're not building for iOS):
  - Xcode<sup>2</sup>
  - iOS Simulator<sup>2</sup>
  - Ruby<sup>1</sup>
  - [fastlane](https://github.com/fastlane/fastlane): `brew install fastlane`
- Android Requirements (skip if you're not building for Android):
  - Java<sup>3</sup>
  - Gradle<sup>3</sup>
  - Android Studio<sup>4</sup>
- Optional but highly recommended:
  - [Expo Orbit](https://docs.expo.dev/build/orbit)<sup>1.5</sup>

<sup>1</sup> [mise](https://mise.jdx.dev) -
<sup>1.5</sup> use `yarn` installed with `mise`

<sup>2</sup> [xcodes](https://github.com/XcodesOrg/xcodesApp)

<sup>3</sup> [sdkman](https://sdkman.io): run `sdk env install` in repo root to auto install Java and Gradle

<sup>4</sup> [JetBrains Toolbox](https://www.jetbrains.com/toolbox-app).
Once you have Android Studio installed:

- install a newer SDK Platform Tools - I use 36.1 ([demo](https://share.cleanshot.com/KJ6rYZjw))
- install a newer virtual device with Google Play Services enabled - I use Pixel 9 Pro Fold ([demo](https://share.cleanshot.com/LhdhbMlS))

____

### Clone Repository & Install Dependencies

```bash
gh repo clone ithacaxyz/porto-react-native
cd porto-react-native
yarn install
```

## Configuration

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

- **Passkey/WebAuthn**: Enables passkey authentication across web and mobile
- **Android App Links**: Verifies your app can handle Android deep links
- **iOS Universal Links**: Verifies your app can handle deep links from your domain

### Files Served

- `/.well-known/apple-app-site-association` - iOS app verification
- `/.well-known/assetlinks.json` - Android app verification

### Deploying the Server

I'm deploying to railway but you can deploy anywhere [./server/index.ts](../server/index.ts) can run.

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

Use `eas credentials` and follow [this guide](https://docs.expo.dev/linking/android-app-links/#create-assetlinksjson-file) and update `server/assetlinks.json`.

### 5. Deploy and Verify

1. Deploy your server with the updated files
2. Verify files are accessible:
   - `https://yourdomain.com/.well-known/apple-app-site-association`
   - `https://yourdomain.com/.well-known/assetlinks.json`
3. Test deep links and passkey functionality

## Development

### (0) - Clear Old Artifacts

```sh
rm -fr '$TMPDIR/haste-map-*'
rm -fr '$TMPDIR/metro-cache'

rm -rf ios
rm -rf android
```

### (1) - Prebuild

Generate native `ios`/`android` directory, apply plugins and `build-properties`

```bash
EXPO_NO_GIT_STATUS=1 yarn expo prebuild --platform='android' --clean
```

### (2) - Build with EAS CLI

```bash
EAS_BUILD_DISABLE_BUNDLE_JAVASCRIPT_STEP=1 eas build \
  --platform='android' \
  --non-interactive \
  --local
```

### (3) - Install App on Emulator/Simulator/Device

- Android:
  Your `.apk` file will have a dfferent number. Locate it in the repository root.

  ```sh
  adb install -r build-1234567890.apk
  ```

- iOS:

  ```sh
  xcrun simctl install booted build-1234567890.ipa
  ```

### (4) - Run Emulator/Android/iPhone

```sh
yarn expo start --clear --tunnel --dev-client 
```

Press:

- `a` to run on Android. If your physical device is connected, it will automatically select it,
- `shift + a` to view Android options,
- `i` for iOS. Note that passkeys are not supported on iOS Simulator so you need to use an actual device,
- `w` for Web.
s.

When you install / update dependencies, run the following to check dependencies are deduplicated:

```bash
yarn expo install --fix && npx expo-doctor --verbose --yarn
```

If Expo doesn't resolve deduplication, run: `node_modules/.bin/bun scripts/dedupe.ts`

### Available Commands (via [just](https://github.com/casey/just))

> [!IMPORTANT]
>
> You have to build at least once before you can run the app.
> You have to build any time you make changes to `app.config.ts` or to plugins or when you install new dependencies.

- `just build-ios` - Build iOS
- `just build-android` - Build Android

- `just fmt` - Format code with Biome
- `just dev` - Run the app and launch web, android or ios
- `just doctor` - Fix dependencies and run expo doctor
- `just deploy-server` - Deploy server to Railway
- `just android-device` - Mirror Android device screen
- `just android-cert` - Generate Android debug certificate

## Useful Links

- [Expo Documentation](https://docs.expo.dev/)
- [Porto Documentation](https://porto.sh)
- [Apple Associated Domains](https://developer.apple.com/documentation/xcode/supporting-associated-domains)
- [Apple Universal Links](https://developer.apple.com/ios/universal-links/)
- [Android App Links](https://developer.android.com/training/app-links)
- [WebAuthn/Passkeys Guide](https://webauthn.guide/)
