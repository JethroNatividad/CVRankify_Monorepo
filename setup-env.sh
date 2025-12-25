#!/bin/bash

# 1. Ensure root .env exists
if [ ! -f .env ]; then
    echo "❌ Root .env file not found!"
    echo "Copying .env.example to .env..."
    cp .env.example .env
fi

# 2. Define target directories
WEB_DIR="apps/web"
AI_DIR="apps/ai-worker"
NEW_AI_DIR="apps/new-ai-worker"


# 3. Create symlinks
# -sf: 's' for symbolic, 'f' to force (overwrites existing links/files)
echo "🔗 Creating symlinks for environment variables..."

ln -sf ../../.env "$WEB_DIR/.env"
ln -sf ../../.env "$AI_DIR/.env"
ln -sf ../../.env "$NEW_AI_DIR/.env"


echo "✅ Symlinks created successfully."