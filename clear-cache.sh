#!/bin/bash

echo "�� Clearing Next.js build caches..."

# Clear web-designer cache
if [ -d "apps/web-designer/.next" ]; then
  rm -rf apps/web-designer/.next
  echo "✓ Cleared web-designer .next cache"
fi

# Clear photographer cache
if [ -d "apps/photographer/.next" ]; then
  rm -rf apps/photographer/.next
  echo "✓ Cleared photographer .next cache"
fi

# Clear core package build
if [ -d "packages/core/dist" ]; then
  rm -rf packages/core/dist
  echo "✓ Cleared core package dist"
fi

# Clear node_modules cache (optional, uncomment if needed)
# echo "Clearing node_modules/.cache..."
# find . -name ".cache" -type d -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null

echo "✨ Cache cleared! Now restart your dev server."
