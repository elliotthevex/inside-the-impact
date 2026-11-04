#!/bin/sh
# Pre-deploy gate for Inside the Impact.
#
# Two layers, because one is not enough:
#   1. jscheck.py  — parses every <script>. Catches typos and bad escapes.
#   2. smoke.js    — runs in a real browser. Catches the init crashes that
#                    parse fine, which is what actually took the site down.
#
# Usage, from the repo root's parent (where inside-the-impact.html lives):
#   sh site/tools/predeploy.sh inside-the-impact.html
set -e
FILE="${1:-inside-the-impact.html}"
DIR="$(cd "$(dirname "$0")" && pwd)"

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
