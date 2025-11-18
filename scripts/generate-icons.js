#!/usr/bin/env node

/**
 * Generate PWA Icons from SVG
 *
 * Converts public/icon.svg to icon-192.png and icon-512.png
 *
 * Usage:
 *   node scripts/generate-icons.js
 */

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const svgPath = path.join(__dirname, '../public/icon.svg')
const sizes = [192, 512]

async function generateIcons() {
  console.log('🏌️ Generating PWA icons...\n')

  if (!fs.existsSync(svgPath)) {
    console.error(`❌ SVG file not found: ${svgPath}`)
    process.exit(1)
  }

  for (const size of sizes) {
    const outputPath = path.join(__dirname, `../public/icon-${size}.png`)

    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath)

      console.log(`✅ Generated ${size}x${size} icon: public/icon-${size}.png`)
    } catch (error) {
      console.error(`❌ Failed to generate ${size}x${size} icon:`, error.message)
      process.exit(1)
    }
  }

  console.log('\n✨ All icons generated successfully!')
}

generateIcons()
