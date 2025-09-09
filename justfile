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

deploy-server:
    cd server && railway up --detach

android-device:
    scrcpy --video-codec='h265' --max-size='1920' --max-fps='60' --no-audio --keyboard='uhid' --select-usb --record='file.mp4' --window-borderless

android-cert:
    keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
    keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA256
