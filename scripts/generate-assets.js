#!/usr/bin/env node
/* eslint-env node */

/**
 * ============================================================================
 * ASSET GENERATION SCRIPT
 * ============================================================================
 *
 * Generates app icons and splash screens from source images.
 *
 * Usage:
 *   node scripts/generate-assets.js
 *   npm run generate:assets
 *
 * Requirements:
 *   - sharp (npm install --save-dev sharp)
 *   - Source images in assets/source/
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Check for sharp dependency
let sharp;
try {
  sharp = require("sharp");
} catch {
  console.error("❌ sharp is not installed.");
  console.error("   Please run: npm install --save-dev sharp");
  process.exit(1);
}

// Configuration
const ASSETS_DIR = path.join(__dirname, "..", "assets");
const SOURCE_DIR = path.join(ASSETS_DIR, "source");

// Icon sizes for different platforms
const ICON_SIZES = {
  // Main app icon (used by Expo)
  icon: { size: 1024, name: "icon.png" },

  // Adaptive icon for Android
  adaptiveIcon: { size: 1024, name: "adaptive-icon.png" },

  // Favicon for web
  favicon: { size: 48, name: "favicon.png" },

  // Additional iOS sizes (optional, Expo handles most)
  ios: [
    { size: 20, name: "icon-20.png" },
    { size: 29, name: "icon-29.png" },
    { size: 40, name: "icon-40.png" },
    { size: 60, name: "icon-60.png" },
    { size: 76, name: "icon-76.png" },
    { size: 83.5, name: "icon-83.5.png" },
    { size: 1024, name: "icon-1024.png" },
  ],

  // Additional Android sizes (optional)
  android: [
    { size: 48, name: "icon-mdpi.png" },
    { size: 72, name: "icon-hdpi.png" },
    { size: 96, name: "icon-xhdpi.png" },
    { size: 144, name: "icon-xxhdpi.png" },
    { size: 192, name: "icon-xxxhdpi.png" },
  ],
};

// Splash screen configurations
const SPLASH_CONFIGS = {
  // Standard splash (Expo default)
  default: {
    width: 1284,
    height: 2778,
    name: "splash.png",
  },

  // Additional sizes for different devices
  sizes: [
    { width: 1242, height: 2688, name: "splash-iphone-max.png" },
    { width: 1125, height: 2436, name: "splash-iphone-x.png" },
    { width: 1242, height: 2208, name: "splash-iphone-plus.png" },
    { width: 750, height: 1334, name: "splash-iphone.png" },
    { width: 1080, height: 1920, name: "splash-android.png" },
  ],
};

// ============================================================================
// UTILITIES
// ============================================================================

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function question(rl, query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// ICON GENERATION
// ============================================================================

async function generateIcons(sourceImage, outputDir, options = {}) {
  console.log("\n📱 Generating app icons...\n");

  const { includeAllSizes = false } = options;

  // Generate main icon
  console.log(`   Creating ${ICON_SIZES.icon.name}...`);
  await sharp(sourceImage)
    .resize(ICON_SIZES.icon.size, ICON_SIZES.icon.size, {
      fit: "cover",
      position: "center",
    })
    .png()
    .toFile(path.join(outputDir, ICON_SIZES.icon.name));

  // Generate adaptive icon
  console.log(`   Creating ${ICON_SIZES.adaptiveIcon.name}...`);
  await sharp(sourceImage)
    .resize(ICON_SIZES.adaptiveIcon.size, ICON_SIZES.adaptiveIcon.size, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toFile(path.join(outputDir, ICON_SIZES.adaptiveIcon.name));

  // Generate favicon
  console.log(`   Creating ${ICON_SIZES.favicon.name}...`);
  await sharp(sourceImage)
    .resize(ICON_SIZES.favicon.size, ICON_SIZES.favicon.size, {
      fit: "cover",
      position: "center",
    })
    .png()
    .toFile(path.join(outputDir, ICON_SIZES.favicon.name));

  if (includeAllSizes) {
    // Generate iOS sizes
    const iosDir = path.join(outputDir, "ios");
    ensureDir(iosDir);
    console.log("\n   Generating iOS sizes...");

    for (const config of ICON_SIZES.ios) {
      const size = Math.round(config.size);
      await sharp(sourceImage)
        .resize(size, size, { fit: "cover", position: "center" })
        .png()
        .toFile(path.join(iosDir, config.name));
      console.log(`      ✓ ${config.name} (${size}x${size})`);
    }

    // Generate Android sizes
    const androidDir = path.join(outputDir, "android");
    ensureDir(androidDir);
    console.log("\n   Generating Android sizes...");

    for (const config of ICON_SIZES.android) {
      await sharp(sourceImage)
        .resize(config.size, config.size, { fit: "cover", position: "center" })
        .png()
        .toFile(path.join(androidDir, config.name));
      console.log(`      ✓ ${config.name} (${config.size}x${config.size})`);
    }
  }

  console.log("\n   ✅ Icons generated successfully!");
}

// ============================================================================
// SPLASH SCREEN GENERATION
// ============================================================================

async function generateSplashScreens(sourceImage, outputDir, options = {}) {
  console.log("\n🎨 Generating splash screens...\n");

  const {
    backgroundColor = "#FFFFFF",
    logoSize = 0.4, // Logo takes 40% of smallest dimension
    includeAllSizes = false,
  } = options;

  // Parse background color
  const bgColor = parseColor(backgroundColor);

  // Generate default splash
  const defaultConfig = SPLASH_CONFIGS.default;
  console.log(`   Creating ${defaultConfig.name}...`);
  await createSplashScreen(
    sourceImage,
    path.join(outputDir, defaultConfig.name),
    defaultConfig.width,
    defaultConfig.height,
    bgColor,
    logoSize
  );

  if (includeAllSizes) {
    const splashDir = path.join(outputDir, "splash");
    ensureDir(splashDir);
    console.log("\n   Generating additional sizes...");

    for (const config of SPLASH_CONFIGS.sizes) {
      await createSplashScreen(
        sourceImage,
        path.join(splashDir, config.name),
        config.width,
        config.height,
        bgColor,
        logoSize
      );
      console.log(`      ✓ ${config.name} (${config.width}x${config.height})`);
    }
  }

  console.log("\n   ✅ Splash screens generated successfully!");
}

async function createSplashScreen(sourceImage, outputPath, width, height, bgColor, logoSize) {
  // Calculate logo dimensions
  const minDimension = Math.min(width, height);
  const logoMaxSize = Math.round(minDimension * logoSize);

  // Get source image dimensions
  const metadata = await sharp(sourceImage).metadata();
  const sourceAspect = metadata.width / metadata.height;

  // Calculate actual logo size maintaining aspect ratio
  let logoWidth, logoHeight;
  if (sourceAspect > 1) {
    logoWidth = logoMaxSize;
    logoHeight = Math.round(logoMaxSize / sourceAspect);
  } else {
    logoHeight = logoMaxSize;
    logoWidth = Math.round(logoMaxSize * sourceAspect);
  }

  // Resize logo
  const resizedLogo = await sharp(sourceImage)
    .resize(logoWidth, logoHeight, { fit: "contain" })
    .png()
    .toBuffer();

  // Calculate position to center the logo
  const left = Math.round((width - logoWidth) / 2);
  const top = Math.round((height - logoHeight) / 2);

  // Create splash screen
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: bgColor,
    },
  })
    .composite([
      {
        input: resizedLogo,
        left,
        top,
      },
    ])
    .png()
    .toFile(outputPath);
}

function parseColor(color) {
  // Handle hex colors
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        alpha: 1,
      };
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        alpha: 1,
      };
    }
  }

  // Default to white
  return { r: 255, g: 255, b: 255, alpha: 1 };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🎨 Asset Generation Script                                  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

  const rl = createReadlineInterface();

  try {
    // Ensure source directory exists
    ensureDir(SOURCE_DIR);

    // Check for source images
    const sourceIcon = path.join(SOURCE_DIR, "icon-source.png");
    const sourceSplash = path.join(SOURCE_DIR, "splash-logo.png");

    const hasIconSource = await fileExists(sourceIcon);
    const hasSplashSource = await fileExists(sourceSplash);

    if (!hasIconSource && !hasSplashSource) {
      console.log("📁 No source images found.\n");
      console.log("Please add your source images to assets/source/:");
      console.log("   • icon-source.png   - Square image for app icon (1024x1024 recommended)");
      console.log("   • splash-logo.png   - Logo for splash screen (any size)\n");
      console.log("Then run this script again.\n");

      // Create placeholder instructions
      const instructionsPath = path.join(SOURCE_DIR, "README.md");
      if (!(await fileExists(instructionsPath))) {
        fs.writeFileSync(
          instructionsPath,
          `# Source Assets

Place your source images here:

## icon-source.png
- Square image for your app icon
- Recommended size: 1024x1024 pixels
- PNG format with transparency (optional)
- Will be used to generate all icon sizes

## splash-logo.png
- Your app logo for the splash screen
- Any size (will be scaled appropriately)
- PNG format
- Will be centered on the splash screen background

## Running the Generator

\`\`\`bash
npm run generate:assets
\`\`\`
`
        );
        console.log("Created assets/source/README.md with instructions.\n");
      }

      rl.close();
      return;
    }

    // Ask what to generate
    console.log("Available source images:");
    if (hasIconSource) console.log("   ✓ icon-source.png");
    if (hasSplashSource) console.log("   ✓ splash-logo.png");
    console.log();

    // Generate icons
    if (hasIconSource) {
      const generateIconsAnswer = await question(rl, "Generate app icons? (Y/n): ");

      if (generateIconsAnswer.toLowerCase() !== "n" && generateIconsAnswer.toLowerCase() !== "no") {
        const allSizesAnswer = await question(rl, "Include all platform-specific sizes? (y/N): ");
        const includeAllSizes =
          allSizesAnswer.toLowerCase() === "y" || allSizesAnswer.toLowerCase() === "yes";

        await generateIcons(sourceIcon, ASSETS_DIR, { includeAllSizes });
      }
    }

    // Generate splash screens
    if (hasSplashSource) {
      const generateSplashAnswer = await question(rl, "\nGenerate splash screens? (Y/n): ");

      if (
        generateSplashAnswer.toLowerCase() !== "n" &&
        generateSplashAnswer.toLowerCase() !== "no"
      ) {
        const bgColor = await question(rl, "Background color (hex, default #FFFFFF): ");
        const backgroundColor = bgColor.trim() || "#FFFFFF";

        const allSizesAnswer = await question(rl, "Include all device sizes? (y/N): ");
        const includeAllSizes =
          allSizesAnswer.toLowerCase() === "y" || allSizesAnswer.toLowerCase() === "yes";

        await generateSplashScreens(sourceSplash, ASSETS_DIR, {
          backgroundColor,
          includeAllSizes,
        });
      }
    }

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                     ✅ Generation Complete!                   ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║   Your assets have been generated in the assets/ directory.  ║
║                                                               ║
║   Next steps:                                                 ║
║   1. Review the generated images                              ║
║   2. Run 'npx expo prebuild --clean' to apply changes         ║
║   3. Test on a device or simulator                            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  generateIcons,
  generateSplashScreens,
  ICON_SIZES,
  SPLASH_CONFIGS,
};
