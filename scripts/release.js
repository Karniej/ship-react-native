#!/usr/bin/env node
/* eslint-env node */

/**
 * ============================================================================
 * RELEASE SCRIPT
 * ============================================================================
 *
 * Automates version bumping and release tagging.
 *
 * Usage:
 *   node scripts/release.js patch    # 1.0.0 -> 1.0.1
 *   node scripts/release.js minor    # 1.0.0 -> 1.1.0
 *   node scripts/release.js major    # 1.0.0 -> 2.0.0
 *   node scripts/release.js 1.2.3    # Set specific version
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// ============================================================================
// CONFIGURATION
// ============================================================================

const ROOT_DIR = path.join(__dirname, "..");
const PACKAGE_JSON = path.join(ROOT_DIR, "package.json");
const APP_JSON = path.join(ROOT_DIR, "app.json");

// ============================================================================
// UTILITIES
// ============================================================================

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function exec(command, options = {}) {
  return execSync(command, {
    stdio: options.silent ? "pipe" : "inherit",
    cwd: ROOT_DIR,
    ...options,
  });
}

function question(prompt) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) throw new Error(`Invalid version: ${version}`);
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

function formatVersion({ major, minor, patch }) {
  return `${major}.${minor}.${patch}`;
}

function bumpVersion(current, type) {
  const version = parseVersion(current);

  switch (type) {
    case "major":
      return formatVersion({ major: version.major + 1, minor: 0, patch: 0 });
    case "minor":
      return formatVersion({ ...version, minor: version.minor + 1, patch: 0 });
    case "patch":
      return formatVersion({ ...version, patch: version.patch + 1 });
    default:
      // Assume it's a specific version
      parseVersion(type); // Validate format
      return type;
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   📦 Release Script                                           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

  // Get version type from args
  const versionType = process.argv[2];

  if (!versionType) {
    console.log("Usage: node scripts/release.js <patch|minor|major|x.x.x>");
    console.log("");
    console.log("Examples:");
    console.log("  node scripts/release.js patch   # Bump patch version");
    console.log("  node scripts/release.js minor   # Bump minor version");
    console.log("  node scripts/release.js major   # Bump major version");
    console.log("  node scripts/release.js 1.2.3   # Set specific version");
    process.exit(1);
  }

  // Check for uncommitted changes
  try {
    const status = exec("git status --porcelain", { silent: true }).toString();
    if (status.trim()) {
      console.error("❌ You have uncommitted changes. Please commit or stash them first.");
      process.exit(1);
    }
  } catch {
    console.error("❌ Not a git repository or git not installed.");
    process.exit(1);
  }

  // Read current version
  const packageJson = readJSON(PACKAGE_JSON);
  const currentVersion = packageJson.version;

  console.log(`Current version: ${currentVersion}`);

  // Calculate new version
  const newVersion = bumpVersion(currentVersion, versionType);

  console.log(`New version: ${newVersion}`);
  console.log("");

  // Confirm
  const confirm = await question("Proceed with release? (y/N): ");
  if (confirm.toLowerCase() !== "y") {
    console.log("Aborted.");
    process.exit(0);
  }

  console.log("");
  console.log("📝 Updating version in package.json...");
  packageJson.version = newVersion;
  writeJSON(PACKAGE_JSON, packageJson);

  // Update app.json
  console.log("📝 Updating version in app.json...");
  const appJson = readJSON(APP_JSON);
  appJson.expo.version = newVersion;

  // Increment build numbers
  if (appJson.expo.ios) {
    const currentBuild = parseInt(appJson.expo.ios.buildNumber || "1", 10);
    appJson.expo.ios.buildNumber = String(currentBuild + 1);
  }
  if (appJson.expo.android) {
    const currentCode = appJson.expo.android.versionCode || 1;
    appJson.expo.android.versionCode = currentCode + 1;
  }
  writeJSON(APP_JSON, appJson);

  // Commit changes
  console.log("📝 Committing version changes...");
  exec(`git add package.json app.json`);
  exec(`git commit -m "chore: bump version to ${newVersion}"`);

  // Create tag
  console.log(`🏷️  Creating tag v${newVersion}...`);
  exec(`git tag -a v${newVersion} -m "Release v${newVersion}"`);

  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                     ✅ Release Created!                       ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║   Version: ${newVersion.padEnd(44)}║
║   iOS Build: ${String(appJson.expo.ios?.buildNumber || "N/A").padEnd(42)}║
║   Android Version Code: ${String(appJson.expo.android?.versionCode || "N/A").padEnd(30)}║
║                                                               ║
║   Next steps:                                                 ║
║   1. Review the changes: git log --oneline -5                 ║
║   2. Push to remote: git push && git push --tags              ║
║   3. GitHub will create a release automatically               ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});
