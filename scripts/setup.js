#!/usr/bin/env node
/* eslint-env node */

/**
 * ============================================================================
 * PROJECT SETUP SCRIPT
 * ============================================================================
 *
 * Interactive setup script to customize this boilerplate for your new project.
 *
 * Usage:
 *   node scripts/setup.js
 *   npm run setup
 *
 * This script will:
 * 1. Update app name and bundle identifiers
 * 2. Configure brand colors and theme
 * 3. Select app template and features
 * 4. Configure authentication
 * 5. Select backend mode (Convex or Expo API Routes)
 * 6. Configure Convex connection
 * 7. Configure EAS Build
 * 8. Set up credit system
 * 9. Configure onboarding flow
 * 10. Set default language
 * 11. Configure analytics (PostHog/Sentry)
 * 12. Configure RevenueCat
 * 13. Install dependencies
 * 14. Validate setup
 *
 * All steps are skippable - press Enter to use defaults or skip.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
};

// Brand color presets
const PRIMARY_COLOR_PRESETS = {
  1: { name: "Blue", hex: "#007AFF" },
  2: { name: "Purple", hex: "#5856D6" },
  3: { name: "Green", hex: "#34C759" },
  4: { name: "Orange", hex: "#FF9500" },
  5: { name: "Red", hex: "#FF3B30" },
  6: { name: "Teal", hex: "#00BCD4" },
};

const SECONDARY_COLOR_PRESETS = {
  1: { name: "Purple", hex: "#5856D6" },
  2: { name: "Blue", hex: "#007AFF" },
  3: { name: "Pink", hex: "#FF2D55" },
  4: { name: "Orange", hex: "#FF9500" },
  5: { name: "Green", hex: "#34C759" },
};

/**
 * Generate a lighter variant of a hex color
 */
function lightenColor(hex, percent = 20) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + Math.round(255 * (percent / 100)));
  const g = Math.min(255, ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100)));
  const b = Math.min(255, (num & 0x0000ff) + Math.round(255 * (percent / 100)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0").toUpperCase()}`;
}

/**
 * Generate a darker variant of a hex color
 */
function darkenColor(hex, percent = 20) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * (percent / 100)));
  const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(255 * (percent / 100)));
  const b = Math.max(0, (num & 0x0000ff) - Math.round(255 * (percent / 100)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0").toUpperCase()}`;
}

/**
 * Validate hex color format
 */
function isValidHex(hex) {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

/**
 * Validate URL format
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Execute command safely
 */
function execCommand(command, options = {}) {
  try {
    execSync(command, { stdio: "inherit", ...options });
    return true;
  } catch (error) {
    return false;
  }
}

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
  skip: (msg) => console.log(`${colors.dim}↷ Skipped: ${msg}${colors.reset}`),
};

// Track what was configured for final summary
const setupSummary = {
  appName: "ShipReactNative",
  bundleId: "com.company.boilerplate",
  primaryColor: "#007AFF",
  secondaryColor: "#5856D6",
  theme: "system",
  template: "full-suite",
  auth: "optional",
  convex: false,
  eas: false,
  credits: { initial: 10 },
  onboarding: "full",
  language: "en",
  posthog: false,
  sentry: false,
  revenuecat: false,
  backendMode: "convex",
  deploymentPlatform: null,
};

async function main() {
  console.log(`
${colors.bright}${colors.cyan}
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚀 Ship React Native - Project Setup                        ║
║                                                               ║
║   Let's customize this boilerplate for your new project!      ║
║                                                               ║
║   ${colors.dim}All steps are optional - press Enter to skip${colors.cyan}              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
${colors.reset}`);

  const rootDir = path.join(__dirname, "..");
  const srcDir = path.join(rootDir, "src");
  const appJsonPath = path.join(rootDir, "app.json");
  const packageJsonPath = path.join(rootDir, "package.json");
  const featuresPath = path.join(srcDir, "constants", "features.ts");
  const brandPath = path.join(srcDir, "constants", "brand.ts");
  const generationsPath = path.join(srcDir, "constants", "generations.ts");
  const generalStorePath = path.join(srcDir, "store", "useGeneralStore.ts");
  const localesIndexPath = path.join(srcDir, "locales", "index.ts");
  const envExamplePath = path.join(rootDir, ".env.example");
  const envPath = path.join(rootDir, ".env");

  // Load existing files
  let appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  try {
    // =========================================================================
    // AUTO-FIX: Apply v2 boilerplate defaults (no prompt)
    // =========================================================================
    // These align the boilerplate with patterns proven by Fishify and ReWordly.
    log.title("⚙️  Applying v2 defaults");

    // 1. runtimeVersion: hardcoded "1.0.0" (NOT { policy: "appVersion" })
    if (typeof appJson.expo.runtimeVersion !== "string") {
      appJson.expo.runtimeVersion = "1.0.0";
      log.success("runtimeVersion set to '1.0.0'");
    }
    // 2. ios.supportsTablet: false
    if (appJson.expo.ios && appJson.expo.ios.supportsTablet !== false) {
      appJson.expo.ios.supportsTablet = false;
      log.success("ios.supportsTablet = false");
    }
    // 3. web.output: "server" (so API routes get bundled & deployed)
    if (appJson.expo.web && appJson.expo.web.output !== "server") {
      appJson.expo.web.output = "server";
      log.success("web.output = 'server'");
    }
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

    // 4. Expo SDK package versions are managed by package.json and `expo install`.
    //    Do not pin individual Expo packages during setup.
    log.success("Expo SDK package versions left unchanged");

    // 5. Remove obsolete patch-podspec script if it exists
    const obsoletePatch = path.join(rootDir, "scripts", "patch-expo-constants-podspec.js");
    if (fs.existsSync(obsoletePatch)) {
      fs.unlinkSync(obsoletePatch);
      log.success("Removed obsolete patch-expo-constants-podspec.js");
    }

    // 6. Create .easignore if missing
    const easignorePath = path.join(rootDir, ".easignore");
    if (!fs.existsSync(easignorePath)) {
      fs.writeFileSync(
        easignorePath,
        `# Heavy folders not needed for the build
node_modules/
.git/
.expo/
ios/Pods/
ios/build/
android/build/
android/app/build/
android/.gradle/
dist/

# Working files
assets/source/
assets/images/icon_*.png

# Docs (not needed in build)
docs/
docs.md
DOCUMENTATION.md
README.md
CHANGELOG.md
pdf-content/

# Misc
.agents/
__tests__/
.husky/
.github/
convex/
`
      );
      log.success("Created .easignore");
    }

    // 7. Create .env with placeholders if missing
    if (!fs.existsSync(envPath)) {
      if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
      } else {
        fs.writeFileSync(
          envPath,
          `# Server-side secrets (used by Expo API routes — set in EAS env vars for production)
OPENAI_API_KEY=

# Client-side public keys (must start with EXPO_PUBLIC_)
EXPO_PUBLIC_REVENUECAT_IOS_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=
EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_POSTHOG_API_KEY=
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_CONVEX_URL=
`
        );
      }
      log.success("Created .env with placeholders");
    }

    // =========================================================================
    // STEP 1: Project Information
    // =========================================================================
    log.title("📝 Step 1/13: Project Information");
    console.log(
      `${colors.dim}Configure your app's name and identifiers (Enter to skip)${colors.reset}\n`
    );

    const appName = await question("App name (e.g., 'My AI App'): ");

    if (appName.trim()) {
      setupSummary.appName = appName.trim();

      const suggestedSlug = appName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      const appSlug = await question(`App slug [${suggestedSlug}]: `);
      const finalSlug = appSlug.trim() || suggestedSlug;

      const suggestedBundleId = `com.example.${finalSlug.replace(/-/g, "")}`;
      const bundleId = await question(`Bundle identifier [${suggestedBundleId}]: `);
      const finalBundleId = bundleId.trim() || suggestedBundleId;
      setupSummary.bundleId = finalBundleId;

      const description = await question("App description (one line): ");
      const authorName = await question("Author name: ");
      const authorEmail = await question("Author email: ");

      // Update app.json
      appJson.expo.name = setupSummary.appName;
      appJson.expo.slug = finalSlug;
      if (description.trim()) appJson.expo.description = description.trim();
      appJson.expo.ios.bundleIdentifier = finalBundleId;
      appJson.expo.android.package = finalBundleId;
      appJson.expo.scheme = finalSlug.replace(/-/g, "");

      fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

      // Update package.json
      packageJson.name = finalSlug;
      if (description.trim()) packageJson.description = description.trim();
      if (authorName.trim() || authorEmail.trim()) {
        packageJson.author = authorEmail.trim()
          ? `${authorName.trim()} <${authorEmail.trim()}>`
          : authorName.trim();
      }
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

      log.success(`Project configured: ${setupSummary.appName}`);
    } else {
      log.skip("Project information (using defaults)");
    }

    // =========================================================================
    // STEP 2: Brand Colors
    // =========================================================================
    log.title("🎨 Step 2/13: Brand Colors");
    console.log(`${colors.dim}Choose your app's color scheme (Enter to skip)${colors.reset}\n`);

    const configureColors = await question("Configure brand colors? (y/N): ");

    if (configureColors.toLowerCase() === "y") {
      console.log(`
Choose your app's ${colors.bright}PRIMARY${colors.reset} color:

  ${colors.cyan}1.${colors.reset} Blue (Default)     ${colors.blue}#007AFF${colors.reset}
  ${colors.cyan}2.${colors.reset} Purple             #5856D6
  ${colors.cyan}3.${colors.reset} Green              ${colors.green}#34C759${colors.reset}
  ${colors.cyan}4.${colors.reset} Orange             #FF9500
  ${colors.cyan}5.${colors.reset} Red                ${colors.red}#FF3B30${colors.reset}
  ${colors.cyan}6.${colors.reset} Teal               #00BCD4
  ${colors.cyan}7.${colors.reset} Custom             Enter hex code
`);

      let primaryColor = "#007AFF";
      const primaryChoice = await question("Select option (1-7) [1]: ");

      if (primaryChoice === "7") {
        let customPrimary = await question("Enter hex code (e.g., #FF5733): ");
        if (!customPrimary.startsWith("#")) customPrimary = "#" + customPrimary;
        if (isValidHex(customPrimary)) {
          primaryColor = customPrimary.toUpperCase();
        } else {
          log.warn("Invalid hex code, using default Blue (#007AFF)");
        }
      } else if (PRIMARY_COLOR_PRESETS[primaryChoice]) {
        primaryColor = PRIMARY_COLOR_PRESETS[primaryChoice].hex;
      }

      console.log(`
Choose your app's ${colors.bright}SECONDARY${colors.reset} color (for gradients):

  ${colors.cyan}1.${colors.reset} Purple (Default)   #5856D6
  ${colors.cyan}2.${colors.reset} Blue               ${colors.blue}#007AFF${colors.reset}
  ${colors.cyan}3.${colors.reset} Pink               #FF2D55
  ${colors.cyan}4.${colors.reset} Orange             #FF9500
  ${colors.cyan}5.${colors.reset} Green              ${colors.green}#34C759${colors.reset}
  ${colors.cyan}6.${colors.reset} Custom             Enter hex code
`);

      let secondaryColor = "#5856D6";
      const secondaryChoice = await question("Select option (1-6) [1]: ");

      if (secondaryChoice === "6") {
        let customSecondary = await question("Enter hex code (e.g., #FF5733): ");
        if (!customSecondary.startsWith("#")) customSecondary = "#" + customSecondary;
        if (isValidHex(customSecondary)) {
          secondaryColor = customSecondary.toUpperCase();
        } else {
          log.warn("Invalid hex code, using default Purple (#5856D6)");
        }
      } else if (SECONDARY_COLOR_PRESETS[secondaryChoice]) {
        secondaryColor = SECONDARY_COLOR_PRESETS[secondaryChoice].hex;
      }

      setupSummary.primaryColor = primaryColor;
      setupSummary.secondaryColor = secondaryColor;

      // Generate light/dark variants
      const primaryLight = lightenColor(primaryColor);
      const primaryDark = darkenColor(primaryColor);

      // Update brand.ts
      let brandContent = fs.readFileSync(brandPath, "utf8");
      brandContent = brandContent.replace(
        /primary: "#[0-9A-Fa-f]{6}"/,
        `primary: "${primaryColor}"`
      );
      brandContent = brandContent.replace(
        /primaryLight: "#[0-9A-Fa-f]{6}"/,
        `primaryLight: "${primaryLight}"`
      );
      brandContent = brandContent.replace(
        /primaryDark: "#[0-9A-Fa-f]{6}"/,
        `primaryDark: "${primaryDark}"`
      );
      brandContent = brandContent.replace(
        /secondary: "#[0-9A-Fa-f]{6}"/,
        `secondary: "${secondaryColor}"`
      );
      brandContent = brandContent.replace(
        /primary: \["#[0-9A-Fa-f]{6}", "#[0-9A-Fa-f]{6}"\]/,
        `primary: ["${primaryColor}", "${secondaryColor}"]`
      );
      fs.writeFileSync(brandPath, brandContent);

      log.success(`Brand colors: Primary ${primaryColor}, Secondary ${secondaryColor}`);
    } else {
      log.skip("Brand colors (using defaults)");
    }

    // =========================================================================
    // STEP 2b: Font Selection
    // =========================================================================
    log.title("🔤 Font");
    console.log(
      `${colors.dim}Choose your app's primary font (Enter to keep Inter)${colors.reset}\n`
    );

    const FONT_OPTIONS = {
      1: { name: "Inter", family: "Inter" },
      2: { name: "Montserrat", family: "Montserrat" },
      3: { name: "Poppins", family: "Poppins" },
      4: { name: "DM Sans", family: "DMSans" },
      5: { name: "Outfit", family: "Outfit" },
      6: { name: "Space Grotesk", family: "SpaceGrotesk" },
    };

    console.log(`
  ${colors.cyan}1.${colors.reset} Inter (Default)
  ${colors.cyan}2.${colors.reset} Montserrat
  ${colors.cyan}3.${colors.reset} Poppins
  ${colors.cyan}4.${colors.reset} DM Sans
  ${colors.cyan}5.${colors.reset} Outfit
  ${colors.cyan}6.${colors.reset} Space Grotesk
`);

    const fontChoice = await question("Select font (1-6) [1]: ");
    const selectedFont = FONT_OPTIONS[fontChoice] || FONT_OPTIONS[1];

    if (fontChoice && fontChoice !== "1" && FONT_OPTIONS[fontChoice]) {
      // Replace all `Inter_XXX` font family references in src/ files
      const newFamily = selectedFont.family;
      const replaceFontInFile = (filePath) => {
        if (!fs.existsSync(filePath)) return;
        let content = fs.readFileSync(filePath, "utf8");
        const before = content;
        content = content.replace(/Inter_(\d{3}[A-Za-z]+)/g, `${newFamily}_$1`);
        if (content !== before) fs.writeFileSync(filePath, content);
      };

      const walk = (dir) => {
        if (!fs.existsSync(dir)) return;
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
            walk(full);
          } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
            replaceFontInFile(full);
          }
        }
      };
      walk(srcDir);
      log.success(`Font: ${selectedFont.name} (replaced font family references in src/)`);
    } else {
      log.skip("Font (using Inter)");
    }

    // =========================================================================
    // STEP 2c: Video Paywall
    // =========================================================================
    log.title("🎬 Video Paywall");
    console.log(
      `${colors.dim}Cycling background videos make paywalls feel premium (Enter to skip)${colors.reset}\n`
    );

    const wantVideoPaywall = await question("Use video background on paywall? (y/N): ");
    if (wantVideoPaywall.toLowerCase() === "y") {
      const videosDir = path.join(rootDir, "assets", "videos");
      if (!fs.existsSync(videosDir)) {
        fs.mkdirSync(videosDir, { recursive: true });
      }
      log.info(
        `Drop your videos into ${colors.cyan}assets/videos/${colors.reset} as paywall-1.mp4, paywall-2.mp4, ...`
      );
      log.info(
        `Then add their require()s to the paywallVideos array in ${colors.cyan}src/app/(app)/premium.tsx${colors.reset}`
      );
      log.info("(The same array can be used by src/app/onboarding.tsx for consistency)");
    } else {
      log.skip("Video paywall (using plain dark background)");
    }

    // =========================================================================
    // STEP 3: Default Theme
    // =========================================================================
    log.title("🌙 Step 3/13: Default Theme");
    console.log(`${colors.dim}Choose the default appearance (Enter to skip)${colors.reset}\n`);

    console.log(`
  ${colors.cyan}1.${colors.reset} System (Default) - Follows device setting
  ${colors.cyan}2.${colors.reset} Light - Always light mode
  ${colors.cyan}3.${colors.reset} Dark - Always dark mode
`);

    const themeChoice = await question("Select option (1-3) [1]: ");
    const themeOptions = { 1: "system", 2: "light", 3: "dark" };
    const defaultTheme = themeOptions[themeChoice] || "system";
    setupSummary.theme = defaultTheme;

    if (themeChoice && themeOptions[themeChoice]) {
      let generalStoreContent = fs.readFileSync(generalStorePath, "utf8");
      generalStoreContent = generalStoreContent.replace(
        /theme: "(system|light|dark)"/,
        `theme: "${defaultTheme}"`
      );
      fs.writeFileSync(generalStorePath, generalStoreContent);
      log.success(`Default theme: ${defaultTheme}`);
    } else {
      log.skip("Theme (using system default)");
    }

    // =========================================================================
    // STEP 4: App Template Selection
    // =========================================================================
    log.title("🎛️  Step 4/13: App Template");
    console.log(`${colors.dim}Choose which AI features to enable (Enter to skip)${colors.reset}\n`);

    console.log(`
  ${colors.cyan}1.${colors.reset} Image Generation App     - AI art, avatars, design
  ${colors.cyan}2.${colors.reset} Video Generation App     - AI video creation
  ${colors.cyan}3.${colors.reset} Visual Content (Img+Vid) - Full visual creation
  ${colors.cyan}4.${colors.reset} Audio Generation App     - Text-to-speech, voiceovers
  ${colors.cyan}5.${colors.reset} Audio Transcription App  - Speech-to-text
  ${colors.cyan}6.${colors.reset} Full Audio App           - TTS + Transcription
  ${colors.cyan}7.${colors.reset} Full Suite (Default)     - All AI features
  ${colors.cyan}8.${colors.reset} Custom                   - Choose individually
`);

    const templateChoice = await question("Select template (1-8) [7]: ");

    const templates = {
      1: "image-generation",
      2: "video-generation",
      3: "image-video",
      4: "audio-generation",
      5: "audio-transcription",
      6: "audio-full",
      7: "full-suite",
      8: "custom",
    };

    const templateFeatures = {
      "image-generation": {
        imageGeneration: true,
        videoGeneration: false,
        textToSpeech: false,
        transcription: false,
        imageIdentification: true,
        aiChat: false,
      },
      "video-generation": {
        imageGeneration: false,
        videoGeneration: true,
        textToSpeech: false,
        transcription: false,
        imageIdentification: false,
        aiChat: false,
      },
      "image-video": {
        imageGeneration: true,
        videoGeneration: true,
        textToSpeech: false,
        transcription: false,
        imageIdentification: true,
        aiChat: false,
      },
      "audio-generation": {
        imageGeneration: false,
        videoGeneration: false,
        textToSpeech: true,
        transcription: false,
        imageIdentification: false,
        aiChat: false,
      },
      "audio-transcription": {
        imageGeneration: false,
        videoGeneration: false,
        textToSpeech: false,
        transcription: true,
        imageIdentification: false,
        aiChat: false,
      },
      "audio-full": {
        imageGeneration: false,
        videoGeneration: false,
        textToSpeech: true,
        transcription: true,
        imageIdentification: false,
        aiChat: false,
      },
      "full-suite": {
        imageGeneration: true,
        videoGeneration: true,
        textToSpeech: true,
        transcription: true,
        imageIdentification: true,
        aiChat: true,
      },
    };

    const selectedTemplate = templates[templateChoice] || "full-suite";
    let features;
    const templateName = selectedTemplate;
    setupSummary.template = templateName;

    if (selectedTemplate === "custom") {
      console.log("\nWhich AI features do you want to enable? (y/N)\n");
      features = {
        imageGeneration:
          (await question("  Image Generation (DALL-E, Flux)? (y/N): ")).toLowerCase() === "y",
        videoGeneration:
          (await question("  Video Generation (Runway, Pika)? (y/N): ")).toLowerCase() === "y",
        textToSpeech:
          (await question("  Text to Speech (ElevenLabs)? (y/N): ")).toLowerCase() === "y",
        transcription:
          (await question("  Audio Transcription (Whisper)? (y/N): ")).toLowerCase() === "y",
        imageIdentification:
          (await question("  Image Identification (GPT-4 Vision)? (y/N): ")).toLowerCase() === "y",
        aiChat: (await question("  AI Chat (GPT-4)? (y/N): ")).toLowerCase() === "y",
      };
    } else {
      features = templateFeatures[selectedTemplate];
    }

    // Update features.ts
    let featuresContent = fs.readFileSync(featuresPath, "utf8");
    featuresContent = featuresContent.replace(
      /export const CURRENT_TEMPLATE: AppTemplate = "[^"]+"/,
      `export const CURRENT_TEMPLATE: AppTemplate = "${templateName}"`
    );

    Object.entries(features).forEach(([feature, enabled]) => {
      const regex = new RegExp(`(${feature}:\\s*{[^}]*enabled:\\s*)(?:true|false)`, "g");
      featuresContent = featuresContent.replace(regex, `$1${enabled}`);
    });

    fs.writeFileSync(featuresPath, featuresContent);
    log.success(`Template: ${templateName}`);

    // =========================================================================
    // STEP 5: Authentication Configuration
    // =========================================================================
    log.title("🔐 Step 5/13: Authentication");
    console.log(`${colors.dim}Configure sign-in options (Enter to skip)${colors.reset}\n`);

    console.log(`
  ${colors.cyan}1.${colors.reset} Social Auth (optional) - Google/Apple + skip option
  ${colors.cyan}2.${colors.reset} Social Auth (required) - Must sign in to use app
  ${colors.cyan}3.${colors.reset} Anonymous Auth         - No sign-up required
`);

    const authChoice = await question("Select option (1-3) [1]: ");

    const authConfig = {
      enabled: true,
      googleEnabled: true,
      appleEnabled: true,
      required: false,
    };

    if (authChoice === "3") {
      authConfig.enabled = false;
      authConfig.googleEnabled = false;
      authConfig.appleEnabled = false;
      setupSummary.auth = "anonymous";
    } else if (authChoice === "2") {
      authConfig.required = true;
      setupSummary.auth = "required";
    } else {
      setupSummary.auth = "optional";
    }

    // Update features.ts with auth config
    let updatedFeaturesContent = fs.readFileSync(featuresPath, "utf8");
    updatedFeaturesContent = updatedFeaturesContent.replace(
      /(socialAuth:\s*{[\s\S]*?enabled:\s*)(?:true|false)/,
      `$1${authConfig.enabled}`
    );
    updatedFeaturesContent = updatedFeaturesContent.replace(
      /(socialAuth:\s*{[\s\S]*?googleEnabled:\s*)(?:true|false)/,
      `$1${authConfig.googleEnabled}`
    );
    updatedFeaturesContent = updatedFeaturesContent.replace(
      /(socialAuth:\s*{[\s\S]*?appleEnabled:\s*)(?:true|false)/,
      `$1${authConfig.appleEnabled}`
    );
    updatedFeaturesContent = updatedFeaturesContent.replace(
      /(socialAuth:\s*{[\s\S]*?required:\s*)(?:true|false)/,
      `$1${authConfig.required}`
    );
    fs.writeFileSync(featuresPath, updatedFeaturesContent);

    log.success(`Authentication: ${setupSummary.auth}`);

    // =========================================================================
    // STEP 6: Backend Mode
    // =========================================================================
    log.title("🔌 Step 6/13: Backend Mode");
    console.log(`${colors.dim}Choose how your app communicates with AI services${colors.reset}\n`);

    console.log(`
  ${colors.cyan}1.${colors.reset} Convex (Recommended)
     Full backend with auth, database, rate limiting, credits, and real-time updates.
     Best for apps with user accounts, usage tracking, monetization.

  ${colors.cyan}2.${colors.reset} Expo API Routes (Simple Proxy)
     Lightweight server-side proxy that just hides API keys.
     Premium features gated by RevenueCat subscription on client.
     Best for simple apps, quick prototypes, RevenueCat-only monetization.
`);

    const backendChoice = await question("Select option (1-2) [1]: ");
    const backendMode = backendChoice === "2" ? "expo-api-routes" : "convex";
    setupSummary.backendMode = backendMode;

    // Update src/constants/api.ts
    const apiConfigPath = path.join(srcDir, "constants", "api.ts");
    if (fs.existsSync(apiConfigPath)) {
      let apiContent = fs.readFileSync(apiConfigPath, "utf8");
      apiContent = apiContent.replace(
        /export const API_MODE(?:\s*:\s*ApiMode)?\s*=\s*"[^"]+"(?:\s+as\s+ApiMode)?/,
        `export const API_MODE = "${backendMode}" as ApiMode`
      );
      fs.writeFileSync(apiConfigPath, apiContent);
    }

    log.success(`Backend mode: ${backendMode}`);

    // If Expo API Routes selected, ask about deployment platform
    if (backendMode === "expo-api-routes") {
      console.log(`
Where will you deploy your API routes?

  ${colors.cyan}1.${colors.reset} EAS Hosting (Recommended for Expo apps)
  ${colors.cyan}2.${colors.reset} Vercel
  ${colors.cyan}3.${colors.reset} Netlify
  ${colors.cyan}4.${colors.reset} Other / Decide later
`);

      const deployChoice = await question("Select option (1-4) [1]: ");
      const deploymentPlatforms = { 1: "eas", 2: "vercel", 3: "netlify", 4: "other" };
      setupSummary.deploymentPlatform = deploymentPlatforms[deployChoice] || "eas";
      log.info(`Deployment target: ${setupSummary.deploymentPlatform}`);
    }

    // =========================================================================
    // STEP 7: Convex Configuration
    // =========================================================================
    log.title("🗄️  Step 7/13: Convex Configuration");

    // Create .env file if it doesn't exist
    if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      log.info("Created .env file from template");
    }

    if (setupSummary.backendMode === "convex") {
      console.log(`${colors.dim}Connect to your Convex project (Enter to skip)${colors.reset}\n`);

      const hasConvexProject = await question("Have you created a Convex project? (y/N): ");

      if (hasConvexProject.toLowerCase() === "y") {
        console.log(`
${colors.dim}Get your deployment URL from: https://dashboard.convex.dev
Or run 'npx convex dev' to start and get the URL${colors.reset}
`);

        const convexUrl = await question("Convex Deployment URL: ");

        if (convexUrl.trim()) {
          let envContent = fs.readFileSync(envPath, "utf8");
          envContent = envContent.replace(
            /EXPO_PUBLIC_CONVEX_URL=.*/,
            `EXPO_PUBLIC_CONVEX_URL=${convexUrl.trim()}`
          );
          fs.writeFileSync(envPath, envContent);
          setupSummary.convex = true;
          log.success("Convex URL saved to .env");

          console.log(`
${colors.cyan}Next, add your API keys to Convex Dashboard:${colors.reset}
  Settings → Environment Variables

  Required:
  - OPENAI_API_KEY
  - REPLICATE_API_TOKEN (for image/video generation)
  - ELEVENLABS_API_KEY (for text-to-speech)

  Optional (for OAuth):
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
  - APPLE_CLIENT_ID
  - APPLE_CLIENT_SECRET
`);
        } else {
          log.warn("No URL provided - remember to add EXPO_PUBLIC_CONVEX_URL to .env");
        }
      } else {
        console.log(`
${colors.yellow}To set up Convex:${colors.reset}

  1. Run: npx convex dev
  2. Follow the prompts to create a project
  3. Copy the deployment URL to your .env file:
     EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

  4. Add API keys to Convex Dashboard:
     Settings → Environment Variables
`);
        log.skip("Convex configuration (run 'npx convex dev' to set up)");
      }
    } else {
      log.skip("Convex configuration (using Expo API Routes)");
    }

    // =========================================================================
    // STEP 8: EAS Build Configuration
    // =========================================================================
    log.title("📦 Step 8/13: EAS Build Configuration");
    console.log(`${colors.dim}Set up Expo Application Services (Enter to skip)${colors.reset}\n`);

    console.log(`
  ${colors.cyan}1.${colors.reset} Initialize new EAS project (runs 'eas init')
  ${colors.cyan}2.${colors.reset} Enter existing project ID
  ${colors.cyan}3.${colors.reset} Skip for now
`);

    const easChoice = await question("Select option (1-3) [3]: ");

    if (easChoice === "1") {
      console.log("\n");
      log.info("Running: eas init");
      const success = execCommand("npx eas-cli init");
      if (success) {
        setupSummary.eas = true;
        log.success("EAS project initialized");
      } else {
        log.warn("EAS init failed - run manually: npx eas-cli init");
      }
    } else if (easChoice === "2") {
      const projectId = await question("Enter your EAS project ID: ");
      if (projectId.trim()) {
        appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
        appJson.expo.extra.eas.projectId = projectId.trim();
        appJson.expo.updates.url = `https://u.expo.dev/${projectId.trim()}`;
        fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
        setupSummary.eas = true;
        log.success(`EAS project ID configured: ${projectId.trim()}`);
      }
    } else {
      log.skip("EAS configuration");
    }

    // =========================================================================
    // STEP 9: Credit System Configuration
    // =========================================================================
    log.title("💰 Step 9/13: Credit System");
    console.log(`${colors.dim}Configure your monetization model (Enter to skip)${colors.reset}\n`);

    const configureCredits = await question("Configure credit system? (y/N): ");

    if (configureCredits.toLowerCase() === "y") {
      const initialCredits = await question("Initial free credits for new users [10]: ");
      const finalInitialCredits = parseInt(initialCredits) || 10;
      setupSummary.credits.initial = finalInitialCredits;

      console.log(`
${colors.dim}Credit costs per generation (Enter for defaults):${colors.reset}
`);
      const imageCost = await question("  Image generation cost [1]: ");
      const videoCost = await question("  Video generation cost [4]: ");
      const speechCost = await question("  Text-to-speech cost [1]: ");
      const transcriptionCost = await question("  Transcription cost [1]: ");
      const visionCost = await question("  Image analysis cost [1]: ");

      // Update generations.ts
      let generationsContent = fs.readFileSync(generationsPath, "utf8");

      generationsContent = generationsContent.replace(
        /initialCredits: \d+/,
        `initialCredits: ${finalInitialCredits}`
      );

      if (imageCost.trim()) {
        generationsContent = generationsContent.replace(
          /(image:\s*{[^}]*default:\s*)\d+/,
          `$1${parseInt(imageCost) || 1}`
        );
      }
      if (videoCost.trim()) {
        generationsContent = generationsContent.replace(
          /(video:\s*{[^}]*default:\s*)\d+/,
          `$1${parseInt(videoCost) || 4}`
        );
      }
      if (speechCost.trim()) {
        generationsContent = generationsContent.replace(
          /(speech:\s*{[^}]*default:\s*)\d+/,
          `$1${parseInt(speechCost) || 1}`
        );
      }
      if (transcriptionCost.trim()) {
        generationsContent = generationsContent.replace(
          /(transcription:\s*{[^}]*default:\s*)\d+/,
          `$1${parseInt(transcriptionCost) || 1}`
        );
      }
      if (visionCost.trim()) {
        generationsContent = generationsContent.replace(
          /(vision:\s*{[^}]*default:\s*)\d+/,
          `$1${parseInt(visionCost) || 1}`
        );
      }

      fs.writeFileSync(generationsPath, generationsContent);
      log.success(`Credit system: ${finalInitialCredits} initial credits`);
    } else {
      log.skip("Credit system (using defaults)");
    }

    // =========================================================================
    // STEP 10: Onboarding Configuration
    // =========================================================================
    log.title("👋 Step 10/13: Onboarding Flow");
    console.log(
      `${colors.dim}Configure first-time user experience (Enter to skip)${colors.reset}\n`
    );

    console.log(`
  ${colors.cyan}1.${colors.reset} Full onboarding     - Welcome → Features → Permissions → Premium
  ${colors.cyan}2.${colors.reset} Minimal onboarding  - Welcome → Premium
  ${colors.cyan}3.${colors.reset} No onboarding       - Go straight to app
`);

    const onboardingChoice = await question("Select option (1-3) [1]: ");

    if (onboardingChoice === "2" || onboardingChoice === "3") {
      let featuresContent2 = fs.readFileSync(featuresPath, "utf8");

      if (onboardingChoice === "3") {
        featuresContent2 = featuresContent2.replace(
          /(onboarding:\s*{[^}]*enabled:\s*)(?:true|false)/,
          `$1false`
        );
        setupSummary.onboarding = "disabled";
      } else {
        setupSummary.onboarding = "minimal";
      }

      fs.writeFileSync(featuresPath, featuresContent2);
      log.success(`Onboarding: ${setupSummary.onboarding}`);
    } else {
      setupSummary.onboarding = "full";
      log.skip("Onboarding (using full flow)");
    }

    const showPremiumScreen = await question("Show premium screen after onboarding? (Y/n): ");
    if (showPremiumScreen.toLowerCase() === "n") {
      let featuresContent3 = fs.readFileSync(featuresPath, "utf8");
      featuresContent3 = featuresContent3.replace(
        /(premium:\s*{[^}]*showOnLaunch:\s*)(?:true|false)/,
        `$1false`
      );
      fs.writeFileSync(featuresPath, featuresContent3);
      log.info("Premium screen disabled on launch");
    }

    // =========================================================================
    // STEP 11: Default Language
    // =========================================================================
    log.title("🌍 Step 11/13: Default Language");
    console.log(`${colors.dim}Set the default app language (Enter to skip)${colors.reset}\n`);

    console.log(`
  ${colors.cyan}1.${colors.reset} English (Default)
  ${colors.cyan}2.${colors.reset} Spanish (Español)
  ${colors.cyan}3.${colors.reset} French (Français)
  ${colors.cyan}4.${colors.reset} German (Deutsch)
  ${colors.cyan}5.${colors.reset} Italian (Italiano)
`);

    const langChoice = await question("Select option (1-5) [1]: ");
    const languages = { 1: "en", 2: "es", 3: "fr", 4: "de", 5: "it" };
    const defaultLanguage = languages[langChoice] || "en";
    setupSummary.language = defaultLanguage;

    if (langChoice && languages[langChoice] && langChoice !== "1") {
      let localesContent = fs.readFileSync(localesIndexPath, "utf8");
      localesContent = localesContent.replace(
        /const DEFAULT_LOCALE = "[^"]+"/,
        `const DEFAULT_LOCALE = "${defaultLanguage}"`
      );
      fs.writeFileSync(localesIndexPath, localesContent);
      log.success(`Default language: ${defaultLanguage}`);
    } else {
      log.skip("Language (using English)");
    }

    // =========================================================================
    // STEP 12: Analytics Configuration
    // =========================================================================
    log.title("📊 Step 12/13: Analytics & Monitoring");
    console.log(`${colors.dim}Configure analytics services (Enter to skip)${colors.reset}\n`);

    const configureAnalytics = await question("Configure analytics? (y/N): ");

    if (configureAnalytics.toLowerCase() === "y") {
      let envContent = fs.readFileSync(envPath, "utf8");

      const posthogKey = await question("PostHog API Key (Enter to skip): ");
      if (posthogKey.trim()) {
        envContent = envContent.replace(
          /EXPO_PUBLIC_POSTHOG_API_KEY=.*/,
          `EXPO_PUBLIC_POSTHOG_API_KEY=${posthogKey.trim()}`
        );
        setupSummary.posthog = true;
        log.success("PostHog configured");
      }

      const sentryDsn = await question("Sentry DSN (Enter to skip): ");
      if (sentryDsn.trim()) {
        envContent = envContent.replace(
          /EXPO_PUBLIC_SENTRY_DSN=.*/,
          `EXPO_PUBLIC_SENTRY_DSN=${sentryDsn.trim()}`
        );
        setupSummary.sentry = true;
        log.success("Sentry configured");
      }

      fs.writeFileSync(envPath, envContent);

      if (!posthogKey.trim() && !sentryDsn.trim()) {
        log.skip("Analytics (no keys provided)");
      }
    } else {
      log.skip("Analytics configuration");
    }

    // =========================================================================
    // STEP 13: RevenueCat Configuration
    // =========================================================================
    log.title("💳 Step 13/13: RevenueCat (In-App Purchases)");
    console.log(`${colors.dim}Configure subscription payments (Enter to skip)${colors.reset}\n`);

    const configureRevenuecat = await question("Configure RevenueCat? (y/N): ");

    if (configureRevenuecat.toLowerCase() === "y") {
      let envContent = fs.readFileSync(envPath, "utf8");

      const rcIosKey = await question("RevenueCat iOS API Key (Enter to skip): ");
      if (rcIosKey.trim()) {
        envContent = envContent.replace(
          /EXPO_PUBLIC_REVENUECAT_IOS_KEY=.*/,
          `EXPO_PUBLIC_REVENUECAT_IOS_KEY=${rcIosKey.trim()}`
        );
      }

      const rcAndroidKey = await question("RevenueCat Android API Key (Enter to skip): ");
      if (rcAndroidKey.trim()) {
        envContent = envContent.replace(
          /EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=.*/,
          `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=${rcAndroidKey.trim()}`
        );
      }

      fs.writeFileSync(envPath, envContent);

      if (rcIosKey.trim() || rcAndroidKey.trim()) {
        setupSummary.revenuecat = true;
        log.success("RevenueCat configured");
      } else {
        log.skip("RevenueCat (no keys provided)");
      }
    } else {
      log.skip("RevenueCat configuration");
    }

    // =========================================================================
    // POST-SETUP: Install Dependencies
    // =========================================================================
    log.title("📦 Installing Dependencies");

    const installDeps = await question("Run npm install? (Y/n): ");
    if (installDeps.toLowerCase() !== "n") {
      console.log("\n");
      log.info("Installing dependencies...");
      const success = execCommand("npm install");
      if (success) {
        log.success("Dependencies installed");
      } else {
        log.warn("Install failed - run manually: npm install");
      }
    } else {
      log.skip("Dependency installation");
    }

    // =========================================================================
    // POST-SETUP: Validation
    // =========================================================================
    log.title("✅ Validating Setup");

    const validations = [
      {
        name: "app.json configured",
        check: () => {
          const aj = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
          return aj.expo.name !== "ShipReactNative";
        },
      },
      {
        name: "package.json configured",
        check: () => {
          const pj = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
          return pj.name !== "ship-react-native";
        },
      },
      {
        name: ".env file exists",
        check: () => fs.existsSync(envPath),
      },
      {
        name: "Convex configured",
        check: () => {
          if (setupSummary.backendMode !== "convex") return true; // Skip if not using Convex
          if (!fs.existsSync(envPath)) return false;
          const env = fs.readFileSync(envPath, "utf8");
          return !env.includes("EXPO_PUBLIC_CONVEX_URL=https://your-deployment");
        },
      },
    ];

    let allPassed = true;
    validations.forEach(({ name, check }) => {
      try {
        if (check()) {
          log.success(name);
        } else {
          log.warn(`${name} - using defaults`);
          allPassed = false;
        }
      } catch {
        log.warn(`${name} - could not verify`);
        allPassed = false;
      }
    });

    // =========================================================================
    // FINAL SUMMARY
    // =========================================================================
    log.title("🎉 Setup Complete!");

    console.log(`
${colors.bright}Your project "${setupSummary.appName}" is ready!${colors.reset}

${colors.cyan}Configuration Summary:${colors.reset}
  App Name:       ${setupSummary.appName}
  Bundle ID:      ${setupSummary.bundleId}
  Template:       ${setupSummary.template}
  Theme:          ${setupSummary.theme}
  Auth:           ${setupSummary.auth}
  Language:       ${setupSummary.language}
  Backend:        ${setupSummary.backendMode === "convex" ? "Convex" : "Expo API Routes"}${setupSummary.backendMode === "expo-api-routes" ? ` (deploy to ${setupSummary.deploymentPlatform})` : ""}
  Initial Credits: ${setupSummary.credits.initial}

${colors.cyan}Services:${colors.reset}
  Convex:      ${setupSummary.convex ? colors.green + "✓ Configured" : colors.yellow + "○ Not configured"}${colors.reset}
  EAS Build:   ${setupSummary.eas ? colors.green + "✓ Configured" : colors.yellow + "○ Not configured"}${colors.reset}
  PostHog:     ${setupSummary.posthog ? colors.green + "✓ Configured" : colors.yellow + "○ Not configured"}${colors.reset}
  Sentry:      ${setupSummary.sentry ? colors.green + "✓ Configured" : colors.yellow + "○ Not configured"}${colors.reset}
  RevenueCat:  ${setupSummary.revenuecat ? colors.green + "✓ Configured" : colors.yellow + "○ Not configured"}${colors.reset}

${colors.cyan}Brand:${colors.reset}
  Primary:    ${setupSummary.primaryColor}
  Secondary:  ${setupSummary.secondaryColor}

${colors.bright}Next Steps:${colors.reset}

  1. ${colors.cyan}Add API keys to .env${colors.reset}
     - OPENAI_API_KEY (server secret — used by /src/app/api/* routes)
     - EXPO_PUBLIC_REVENUECAT_IOS_KEY
     - EXPO_PUBLIC_REVENUECAT_ANDROID_KEY (optional)

  2. ${colors.cyan}Initialize EAS${colors.reset}
     npx eas-cli init

  3. ${colors.cyan}Deploy API routes to EAS Hosting${colors.reset}
     npx eas-cli deploy --prod
     Then set EXPO_PUBLIC_API_URL to the deployed URL via:
     npx eas-cli env:create --environment production

  4. ${colors.cyan}Run a development build${colors.reset}
     npx expo run:ios

  5. ${colors.cyan}Configure third-party services${colors.reset}
     - PostHog: https://posthog.com
     - Sentry: https://sentry.io
     - RevenueCat: https://revenuecat.com

${colors.bright}Documentation:${colors.reset}
  docs/CONVEX_SETUP.md    - Backend setup guide
  docs/CUSTOMIZATION.md   - Branding guide
  docs/SECURITY.md        - Security best practices
`);

    // Show deployment instructions for Expo API Routes mode
    if (setupSummary.backendMode === "expo-api-routes") {
      const deployInstructions = {
        eas: `
${colors.cyan}Deployment: EAS Hosting${colors.reset}

  1. Install EAS CLI (if not already):
     npm install -g eas-cli

  2. Deploy your API routes:
     npx eas deploy

  3. Set environment variables in EAS dashboard:
     - OPENAI_API_KEY
     - REPLICATE_API_TOKEN (if using video/image gen)
     - ELEVENLABS_API_KEY (if using TTS)

  Docs: https://docs.expo.dev/eas/hosting/
`,
        vercel: `
${colors.cyan}Deployment: Vercel${colors.reset}

  1. Install Vercel CLI:
     npm install -g vercel

  2. Deploy:
     vercel

  3. Set environment variables:
     vercel env add OPENAI_API_KEY
     vercel env add REPLICATE_API_TOKEN
     vercel env add ELEVENLABS_API_KEY

  Docs: https://vercel.com/docs
`,
        netlify: `
${colors.cyan}Deployment: Netlify${colors.reset}

  1. Install Netlify CLI:
     npm install -g netlify-cli

  2. Deploy:
     netlify deploy --prod

  3. Set environment variables in Netlify dashboard:
     Site settings → Environment variables

  Docs: https://docs.netlify.com
`,
        other: `
${colors.cyan}Deployment: Custom${colors.reset}

  Set these environment variables on your server:
  - OPENAI_API_KEY
  - REPLICATE_API_TOKEN (if using video/image gen)
  - ELEVENLABS_API_KEY (if using TTS)

  Then deploy using your preferred method.
`,
      };

      console.log(deployInstructions[setupSummary.deploymentPlatform] || deployInstructions.other);
    }

    // Show Convex-specific instructions
    if (setupSummary.backendMode === "convex") {
      console.log(`
${colors.cyan}Convex Quick Start:${colors.reset}

  1. Start the Convex dev server:
     npx convex dev

  2. Add environment variables in Convex Dashboard:
     Settings → Environment Variables
     - OPENAI_API_KEY
     - REPLICATE_API_TOKEN
     - ELEVENLABS_API_KEY

  3. (Optional) Configure OAuth providers:
     - GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
     - APPLE_CLIENT_ID / APPLE_CLIENT_SECRET

  Docs: https://docs.convex.dev
`);
    }

    console.log(`Happy coding! 🚀
`);
  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
