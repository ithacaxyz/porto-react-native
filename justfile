set shell := ["fish", "-c"]
set dotenv-load := true
set positional-arguments := true

fmt:
    just --fmt --unstable
    biome check . --write --unsafe

test:
    echo "test"

build:
    echo "build"

clear:
    yarn expo start --clear

doctor:
    yarn expo install --fix
    bun x expo-doctor --verbose --yarn

polyglot-postinstall:
    cd ios && pod install && cd ..

android-cert:
    keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
    keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA256