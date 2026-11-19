#!/bin/sh
# Copy the worktree (without .git) to the scratch folder the preview server serves.
# The preview server cannot read ~/Desktop, so every browser check runs on this copy.
# Usage: sh story/dev/sync-preview.sh   (then reload the preview tab)
set -e
SRC="$(cd "$(dirname "$0")/../.." && pwd)"
DST="/private/tmp/claude-501/-Users-elliot-jeong--claude-spares-spare-QSGlbD/ca804261-1003-4979-b90e-1f8fbae65bec/scratchpad/serve-story"
mkdir -p "$DST"
rsync -a --delete --exclude .git --exclude 'story/design/ref-*.pdf' "$SRC/" "$DST/"
echo "synced $SRC -> $DST"
