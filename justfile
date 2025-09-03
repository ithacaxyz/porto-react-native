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

doctor:
    bun expo install --fix
    bun expo-doctor
