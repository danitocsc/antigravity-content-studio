#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "Usage: render_carousel.sh <carousel.html> <output_dir> <num_slides>"
  exit 1
fi

HTML_PATH="$(realpath "$1")"
OUT_DIR="$2"
NUM_SLIDES="$3"

mkdir -p "$OUT_DIR"

npx agent-browser close >/dev/null 2>&1 || true
npx agent-browser set viewport 1080 1350

for i in $(seq 1 "$NUM_SLIDES"); do
  PAD=$(printf "%02d" "$i")
  npx agent-browser open "file://${HTML_PATH}?slide=${i}"
  npx agent-browser screenshot "${OUT_DIR}/slide-${PAD}.png"
done

npx agent-browser close >/dev/null 2>&1 || true
ls -lh "$OUT_DIR"
