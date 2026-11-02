#!/usr/bin/env bash
# Builds bundle-kit-lingua/bundle.zip from linguadrop/ and linguadash/ (plus README.md and LICENSE.md),
# without node_modules, dist or .env files, then checks for leftover placeholders.
#   bash bundle-kit-lingua/scripts/make-zip.sh
set -euo pipefail

KIT="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$(cd "$KIT/.." && pwd)"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

for product in linguadrop linguadash; do
  mkdir -p "$STAGE/$product"
  (cd "$ROOT/$product" && find . -type f \
      -not -path './node_modules/*' \
      -not -path './dist/*' \
      -not -name '.env' -not -name '.env.local' -not -name '.DS_Store' -not -name '*.tsbuildinfo' \
      -print0 | xargs -0 -I{} cp --parents {} "$STAGE/$product/")
done

# Buyer-facing README: drop the seller-only section between the kit-only markers.
sed '/<!-- kit-only:start -->/,/<!-- kit-only:end -->/d' "$KIT/README.md" > "$STAGE/README.md"
cp "$KIT/LICENSE.md" "$STAGE/LICENSE.md"
cp "$KIT/AUDIT.md" "$STAGE/AUDIT.md"

rm -f "$KIT/bundle.zip"
(cd "$STAGE" && zip -qr -X "$KIT/bundle.zip" README.md LICENSE.md AUDIT.md linguadrop linguadash)

FILES=$(unzip -Z1 "$KIT/bundle.zip" | grep -vc '/$')
echo "Created $KIT/bundle.zip ($(du -h "$KIT/bundle.zip" | cut -f1), $FILES files)"

# Safety checks: nothing heavy or private slipped in.
if unzip -Z1 "$KIT/bundle.zip" | grep -E '(^|/)(node_modules|dist)/|(^|/)\.env$' >/dev/null; then
  echo "ERROR: node_modules, dist or .env found in the ZIP" >&2
  exit 1
fi

# Placeholders that must be filled before selling: {{LIKE_THIS}}, TODO, FIXME, lorem ipsum.
LEFT=$(grep -rnoE '\{\{[A-Z_]+\}\}|\bTODO\b|\bFIXME\b|[Ll]orem ipsum' "$STAGE" --exclude-dir=node_modules || true)
if [ -n "$LEFT" ]; then
  echo
  echo "WARNING: placeholders still in the ZIP. Fill them in before uploading:"
  echo "$LEFT" | sed "s|$STAGE/|  |"
  exit 2
else
  echo "Placeholder check: none found ({{...}}, TODO, FIXME, lorem ipsum)."
fi
