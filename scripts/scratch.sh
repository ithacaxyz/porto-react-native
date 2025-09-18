#!/usr/bin/env bash

# Fresh Android build for Expo/React Native
# - Uninstalls existing app (debug + release) from the target device
# - Clears Expo/Metro caches and Android build outputs
# - Reinstalls node modules
# - Gradle clean
# - Builds and runs a fresh debug app via Expo
#
# Usage:
#   scripts/scratch.sh [--device <adbId>] [--deep]
#
# Options:
#   --device <adbId>  Explicit ADB device/emulator id (from `adb devices`).
#   --deep            Also clear global Gradle caches (~/.gradle/caches, daemon).
#
# Notes:
# - Requires: Java 17, Android SDK (platform-tools, build-tools 35, platform 35), adb, yarn/npm.
# - Package IDs: org.name.portorn (release), org.name.portorn.debug (debug).

set -euo pipefail

APP_ID="org.name.portorn"
APP_ID_DEBUG="org.name.portorn.debug"

DEVICE=""
DEEP=0

usage() {
  sed -n '1,35p' "$0" | sed 's/^# \{0,1\}//'
}

log() { echo "==> $*"; }
warn() { echo "[warn] $*" >&2; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --device)
      [[ $# -ge 2 ]] || { warn "--device requires an argument"; exit 2; }
      DEVICE="$2"; shift 2;;
    --deep)
      DEEP=1; shift;;
    -h|--help)
      usage; exit 0;;
    *)
      warn "Unknown argument: $1"; usage; exit 2;;
  esac
done

# Environment sanity checks (non-fatal; prints hints)
if ! command -v java >/dev/null 2>&1; then
  warn "Java not found. Install JDK 17 and set JAVA_HOME."
else
  if ! java -version 2>&1 | grep -Eq '"?17(\.|$)'; then
    warn "Detected non-17 Java. Use JDK 17 for RN/AGP compatibility."
  fi
fi

if ! command -v adb >/dev/null 2>&1; then
  warn "adb not found. Install Android SDK platform-tools and add to PATH."
fi

# Resolve target device
if [[ -z "${DEVICE}" ]]; then
  if [[ -n "${ADB_SERIAL:-}" ]]; then
    DEVICE="$ADB_SERIAL"
  elif command -v adb >/dev/null 2>&1; then
    DEVICE=$(adb devices | awk 'NR>1 && $2=="device" {print $1; exit}') || true
  fi
fi

if [[ -n "$DEVICE" ]]; then
  log "Using device: $DEVICE"
else
  warn "No connected device/emulator detected. You can pass --device <id>."
fi

# Uninstall existing app(s) to avoid signature clashes
if [[ -n "$DEVICE" ]]; then
  log "Uninstalling $APP_ID from $DEVICE (if present)"
  adb -s "$DEVICE" uninstall "$APP_ID" >/dev/null 2>&1 || true
  log "Uninstalling $APP_ID_DEBUG from $DEVICE (if present)"
  adb -s "$DEVICE" uninstall "$APP_ID_DEBUG" >/dev/null 2>&1 || true
else
  warn "Skipping uninstall because no device id is set."
fi

# Clear project caches and build outputs
log "Clearing Expo/Metro caches"
rm -rf .expo .expo-shared || true

log "Removing Android build outputs"
rm -rf android/app/build android/.gradle android/build || true

if [[ $DEEP -eq 1 ]]; then
  log "Deep clean: removing global Gradle caches (~/.gradle/caches, daemon)"
  rm -rf "$HOME/.gradle/caches" "$HOME/.gradle/daemon" || true
fi

# Reinstall JS deps
if command -v yarn >/dev/null 2>&1; then
  log "Installing JS dependencies with yarn"
  rm -rf node_modules || true
  yarn install --frozen-lockfile || yarn install
else
  log "Installing JS dependencies with npm"
  rm -rf node_modules package-lock.json || true
  npm ci || npm install
fi

# Gradle clean
if [[ -x android/gradlew ]]; then
  log "Gradle clean"
  (cd android && ./gradlew clean)
fi

# Build & run via Expo
log "Building and running debug app via Expo"
if [[ -n "$DEVICE" ]]; then
  npx --yes expo run:android --device "$DEVICE"
else
  npx --yes expo run:android
fi

log "Done."

