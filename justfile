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
  bun expo start --clear

doctor:
    bun expo install --fix
    bun x expo-doctor

polyglot-postinstall:
    cd ios && pod install && cd ..
    