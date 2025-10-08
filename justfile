set shell := ["fish", "-c"]
set dotenv-load := true
set positional-arguments := true

fmt:
    just --fmt --unstable
    biome check . --write --unsafe

lint:
    biome lint . --write --unsafe

dev:
    bun expo start --clear --tunnel --dev-client

doctor:
    bun expo install --fix && bun x expo-doctor --verbose --bun
    bun x expo config --full

# clean metro cache and expo cache
clean-metro:
    watchman watch-del-all
    rm -fr '$TMPDIR/haste-map-*'
    rm -fr '$TMPDIR/metro-cache'

clean-ios:
    rm -rf ios
    rm -fr portorn.app

clean-android:
    rm -rf android

clean-all: clean-metro clean-ios clean-android

# regenerate native ./ios from `app.config.ts` and apply plugins + build-properties
generate-ios-native:
    EXPO_NO_GIT_STATUS=1 bun expo prebuild --platform='ios' --clean

# regenerate native ./android from `app.config.ts` and apply plugins + build-properties
generate-android-native:
    EXPO_NO_GIT_STATUS=1 bun expo prebuild --platform='android' --clean

# build iOS locally with EAS
build-eas-ios-local:
    EAS_BUILD_DISABLE_BUNDLE_JAVASCRIPT_STEP=1 eas build \
        --platform='ios' \
         --profile='development' \
         --local \
         --non-interactive

# build Android locally with EAS
build-eas-android-local:
    ANDROID_HOME="/Users/o/Library/Android/sdk" EAS_BUILD_DISABLE_BUNDLE_JAVASCRIPT_STEP=1 eas build \
        --platform='android' \
        --profile='development' \
        --local \
        --non-interactive

# build android
build-android: clean-android clean-metro generate-android-native build-eas-android-local

# build iOS
build-ios: clean-ios clean-metro generate-ios-native build-eas-ios-local

polyglot-postinstall:
    cd ios && pod install && cd ..

deploy-server:
    cd server && railway up --detach

android-device:
    scrcpy --video-codec='h265' --max-size='1920' --max-fps='60' --no-audio --keyboard='uhid' --select-usb --record='file.mp4' --window-borderless

android-cert:
    keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
    keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA256
