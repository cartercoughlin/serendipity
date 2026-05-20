#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
ARTIFACT_DIR="$DIST_DIR/serendipity"
ZIP_PATH="$DIST_DIR/serendipity-extension.zip"
SWIFT_CACHE_DIR="/private/tmp/serendipity-swift-module-cache"

mkdir -p "$SWIFT_CACHE_DIR"
CLANG_MODULE_CACHE_PATH="$SWIFT_CACHE_DIR" swift "$ROOT_DIR/scripts/render_icon.swift" "$ROOT_DIR/icons/logo-128.png"

mkdir -p "$ARTIFACT_DIR"
mkdir -p "$ARTIFACT_DIR/icons"
rm -f "$ZIP_PATH"
find "$ARTIFACT_DIR" -mindepth 1 -maxdepth 1 ! -name icons -exec rm -rf {} +
find "$ARTIFACT_DIR/icons" -mindepth 1 -maxdepth 1 -exec rm -f {} +

cp "$ROOT_DIR/manifest.json" "$ARTIFACT_DIR/"
cp "$ROOT_DIR/background.js" "$ARTIFACT_DIR/"
cp "$ROOT_DIR/content.js" "$ARTIFACT_DIR/"
cp "$ROOT_DIR/popup.html" "$ARTIFACT_DIR/"
cp "$ROOT_DIR/popup.css" "$ARTIFACT_DIR/"
cp "$ROOT_DIR/popup.js" "$ARTIFACT_DIR/"
cp "$ROOT_DIR/options.html" "$ARTIFACT_DIR/"
cp "$ROOT_DIR/README.md" "$ARTIFACT_DIR/"
cp "$ROOT_DIR/icons/logo.svg" "$ARTIFACT_DIR/icons/"
cp "$ROOT_DIR/icons/logo-128.png" "$ARTIFACT_DIR/icons/"

(
  cd "$DIST_DIR"
  zip -rq "$ZIP_PATH" serendipity
)

printf 'Created:\n%s\n%s\n' "$ARTIFACT_DIR" "$ZIP_PATH"
