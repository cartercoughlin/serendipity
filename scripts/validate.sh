#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SWIFT_CACHE_DIR="/private/tmp/serendipity-swift-module-cache"

cd "$ROOT_DIR"

mkdir -p "$SWIFT_CACHE_DIR"
CLANG_MODULE_CACHE_PATH="$SWIFT_CACHE_DIR" swift "$ROOT_DIR/scripts/render_icon.swift" "$ROOT_DIR/icons/logo-128.png"
node --check background.js
node --check content.js
node --check popup.js
ruby -rjson -e 'JSON.parse(File.read("manifest.json"))'

printf 'Validation passed.\n'
