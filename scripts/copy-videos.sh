#!/usr/bin/env bash
set -euo pipefail

DEST="${1:-$HOME/Downloads/cap-videos}"
mkdir -p "$DEST"
mc cp --recursive cap/cap/ "$DEST/"
open "$DEST"
