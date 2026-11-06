#!/bin/sh
# Pre-deploy gate for Inside the Impact.
#
# Two layers, because one is not enough:
#   1. jscheck.py  — parses every script the page has, including game.js.
#                    Catches typos and bad escapes.
#   2. smoke.js    — runs in a real browser. Catches the init crashes that
#                    parse fine, which is what actually took the site down.
#
# Usage:
#   sh tools/predeploy.sh             checks this repo's index.html
#   sh tools/predeploy.sh PAGE.html   checks another copy of the page
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
FILE="${1:-$DIR/../index.html}"

echo "── 1/2  parse check ─────────────────────────────"
python3 -I "$DIR/jscheck.py" "$FILE"

echo
echo "── 2/2  runtime smoke test ──────────────────────"
echo "Not automatic: it needs a real browser."
echo "  1. open  file://$(cd "$(dirname "$FILE")" && pwd)/$(basename "$FILE")"
echo "  2. wait ~9s for the boot screen to clear"
echo "  3. paste $DIR/smoke.js into the console"
echo "  4. deploy only if it returns  pass: true"
echo
echo "A green parse check on its own is NOT enough to deploy."
