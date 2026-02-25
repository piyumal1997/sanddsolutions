#!/usr/bin/env bash

set -euo pipefail

echo "============================================================="
echo " Moving frontend files into client/ subdirectory"
echo "============================================================="
echo ""

# ────────────────────────────────────────────────
# 1. Safety checks
# ────────────────────────────────────────────────

if [ ! -f "vite.config.js" ] && [ ! -f "vite.config.ts" ]; then
    echo "ERROR: vite.config.js/ts not found in current directory."
    echo "       Are you sure you are in the project root?"
    exit 1
fi

if [ -d "client" ]; then
    echo "ERROR: folder 'client/' already exists."
    echo "       Remove or rename it first if this is intentional."
    exit 1
fi

# ────────────────────────────────────────────────
# 2. Create client/ structure
# ────────────────────────────────────────────────

mkdir -p client

echo "→ Created client/ folder"

# ────────────────────────────────────────────────
# 3. Move main frontend files & folders
# ────────────────────────────────────────────────

echo "→ Moving core frontend files..."

# Standard Vite project files
mv src          client/src          2>/dev/null || true
mv public       client/public       2>/dev/null || true
mv index.html   client/index.html   2>/dev/null || true
mv vite.config* client/             2>/dev/null || true   # .js or .ts
mv .eslintrc*   client/             2>/dev/null || true
mv .prettierrc* client/             2>/dev/null || true
mv tsconfig*    client/             2>/dev/null || true
mv env.d.ts     client/             2>/dev/null || true

# Package files (we'll handle them specially below)
if [ -f "package.json" ]; then
    mv package.json client/package.json
fi

if [ -f "package-lock.json" ]; then
    mv package-lock.json client/package-lock.json
fi

if [ -f "yarn.lock" ]; then
    mv yarn.lock client/yarn.lock
fi

# ────────────────────────────────────────────────
# 4. Move .github/workflows (keep it in root!)
#    → we do NOT move deploy.yml — it should stay in root
# ────────────────────────────────────────────────

echo "→ Keeping .github/workflows/deploy.yml in root (correct choice)"

# ────────────────────────────────────────────────
# 5. Create/update root package.json (monorepo style – optional but recommended)
# ────────────────────────────────────────────────

cat > package.json << 'EOF'
{
  "name": "sndsolutions-monorepo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "client:dev": "cd client && npm run dev",
    "client:build": "cd client && npm run build",
    "client:preview": "cd client && npm run preview"
  },
  "devDependencies": {}
}
EOF

echo "→ Created minimal root package.json for easier commands"

# ────────────────────────────────────────────────
# 6. Update paths in client/vite.config.js (important!)
# ────────────────────────────────────────────────

if [ -f "client/vite.config.js" ] || [ -f "client/vite.config.ts" ]; then
    echo "→ Updating vite.config base path (recommended for GitHub Pages)"
    # Simple sed replacement – adjust if your config looks different
    sed -i 's|base: .*/\? *|base: "/sndsolutions/"|' client/vite.config.* 2>/dev/null || true
    # If you use TypeScript config
    sed -i 's|base: .*/\? *|base: "/sndsolutions/"|' client/vite.config.* 2>/dev/null || true
fi

# ────────────────────────────────────────────────
# 7. Update GitHub Pages workflow to build from client/
# ────────────────────────────────────────────────

echo "→ Updating .github/workflows/deploy.yml to build from client/"

cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: write
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install client dependencies
        working-directory: ./client
        run: npm ci

      - name: Build client
        working-directory: ./client
        run: npm run build

      - name: Fix SPA routing (copy index.html → 404.html)
        run: cp client/dist/index.html client/dist/404.html

      - name: Deploy to gh-pages branch
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./client/dist
EOF

echo "→ Updated deploy.yml to point to client/dist"

# ────────────────────────────────────────────────
# 8. Final touches
# ────────────────────────────────────────────────

echo ""
echo "Done!"
echo ""
echo "Next steps:"
echo "  1. cd client && npm install          # install frontend deps"
echo "  2. git add ."
echo "  3. git commit -m \"Move frontend into client/ subdirectory\""
echo "  4. git push"
echo ""
echo "You can now:"
echo "  - Develop frontend:   npm run client:dev"
echo "  - Build frontend:     npm run client:build"
echo ""
echo "The GitHub Pages workflow is updated and should now work correctly."
echo "============================================================="