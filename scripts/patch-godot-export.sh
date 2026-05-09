#!/usr/bin/env bash
# Run this after every Godot web export to inject the ODIN config variables.
# Usage: ./scripts/patch-godot-export.sh
#
# The Godot engine reads window.ODIN_API_URL, window.ODIN_USER_ID, and
# window.ODIN_JWT_TOKEN via JavaScriptBridge.eval() in api_client.gd:_ready().
# This script inserts a <script> block at the top of <head> that populates
# those variables from window.parent.__ODIN_GAME_CONFIG (set by the React host).

set -euo pipefail

TARGET="$(dirname "$0")/../public/godot/index.html"

if [ ! -f "$TARGET" ]; then
  echo "ERROR: $TARGET not found. Export the Godot project for Web first." >&2
  exit 1
fi

MARKER="__ODIN_GAME_CONFIG"

if grep -q "$MARKER" "$TARGET"; then
  echo "Patch already applied — skipping."
  exit 0
fi

INJECTION='  <script>\n    try {\n      var c = window.parent.__ODIN_GAME_CONFIG || {};\n      window.ODIN_API_URL   = c.apiUrl || '"'"'http://localhost:5000'"'"';\n      window.ODIN_USER_ID   = c.userId || '"'"''"'"';\n      window.ODIN_JWT_TOKEN = c.token  || '"'"''"'"';\n    } catch (e) {\n      window.ODIN_API_URL   = '"'"'http://localhost:5000'"'"';\n      window.ODIN_USER_ID   = '"'"''"'"';\n      window.ODIN_JWT_TOKEN = '"'"''"'"';\n    }\n  <\/script>'

# Insert after the opening <head> tag
sed -i "s|<head>|<head>\n${INJECTION}|" "$TARGET"

echo "Patch applied to $TARGET"
