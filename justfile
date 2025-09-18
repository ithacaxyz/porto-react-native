set shell := ["fish", "-c"]
set dotenv-load := true
set positional-arguments := true

fmt:
    just --fmt --unstable
    biome check . --write --unsafe

lint:
    biome lint . --write --unsafe
    yarn expo lint

dev:
    yarn expo start --clear --tunnel --dev-client

doctor:
    yarn expo install --fix
    bun x expo-doctor --verbose --yarn

# clean metro cache and expo cache
clean-metro:
    watchman watch-del-all
    rm -fr '$TMPDIR/haste-map-*'
    rm -fr '$TMPDIR/metro-cache'

clean-android:
    rm -rf android

# regenerate native from `app.config.ts` and apply plugins + build-properties
generate-android-native:
    yarn expo prebuild --platform='android' --clean --no-install

# build Android locally with EAS
build-eas-android-local:
    ANDROID_HOME="~/Library/Android/sdk" EAS_BUILD_DISABLE_BUNDLE_JAVASCRIPT_STEP=1 eas build --platform android --local

# build android
build-android: clean-android clean-metro generate-android-native build-eas-android-local

clean-ios:
    rm -rf ios

polyglot-postinstall:
    cd ios && pod install && cd ..

deploy-server:
    cd server && railway up --detach

android-device:
    scrcpy --video-codec='h265' --max-size='1920' --max-fps='60' --no-audio --keyboard='uhid' --select-usb --record='file.mp4' --window-borderless

android-cert:
    keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
    keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA256
