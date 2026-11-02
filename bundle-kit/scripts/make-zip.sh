#!/usr/bin/env bash
# Builds bundle-kit/bundle.zip from the current saasdrop/ and dashdrop/ folders.
# Leaves out node_modules, dist and .env files. Run from anywhere: bash bundle-kit/scripts/make-zip.sh
set -euo pipefail

KIT="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$(cd "$KIT/.." && pwd)"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

for product in saasdrop dashdrop; do
  mkdir -p "$STAGE/$product"
  (cd "$ROOT/$product" && find . -type f \
      -not -path './node_modules/*' \
      -not -path './dist/*' \
      -not -name '.env' -not -name '.env.local' -not -name '.DS_Store' \
      -print0 | xargs -0 -I{} cp --parents {} "$STAGE/$product/")
done
cp "$KIT/bundle/README.md" "$KIT/bundle/LICENSE.md" "$STAGE/"

rm -f "$KIT/bundle.zip"
(cd "$STAGE" && zip -qr -X "$KIT/bundle.zip" README.md LICENSE.md saasdrop dashdrop)

echo "Created $KIT/bundle.zip ($(du -h "$KIT/bundle.zip" | cut -f1), $(unzip -Z1 "$KIT/bundle.zip" | grep -vc '/$') files)"

LEFT=$(grep -rhoE '\{\{[A-Z_]+\}\}' "$STAGE" | sort | uniq -c || true)
if [ -n "$LEFT" ]; then
  echo
  echo "WARNING: placeholders still in the ZIP. Fill them in before uploading:"
  echo "$LEFT"
  grep -rlE '\{\{[A-Z_]+\}\}' "$STAGE" | sed "s|$STAGE/|  in |"
fi
