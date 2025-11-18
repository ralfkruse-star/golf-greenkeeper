#!/bin/bash

# Generate PWA Icons from SVG
# Requires: ImageMagick (convert command)
# Install on Ubuntu/Debian: sudo apt-get install imagemagick
# Install on macOS: brew install imagemagick

echo "🏌️ Generating PWA icons..."

cd "$(dirname "$0")/.."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Please install it:"
    echo "   Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "   macOS: brew install imagemagick"
    echo ""
    echo "Alternative: Open scripts/generate-icons.html in a browser"
    exit 1
fi

# Generate 192x192 icon
echo "📐 Generating 192x192 icon..."
convert -background none -resize 192x192 public/icon.svg public/icon-192.png

# Generate 512x512 icon
echo "📐 Generating 512x512 icon..."
convert -background none -resize 512x512 public/icon.svg public/icon-512.png

echo "✅ Icons generated successfully!"
echo "   - public/icon-192.png"
echo "   - public/icon-512.png"
