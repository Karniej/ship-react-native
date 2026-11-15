#!/usr/bin/env node
/**
 * Ship React Native — Doctor
 *
 * Verifies the project is correctly configured and ready to run.
 * Safe to run at any time; makes no changes. Designed to be run by
 * humans AND coding agents (see AGENTS.md) — every failure prints
 * the exact fix.
 *
 * Usage:
 *   npm run doctor            # all checks (network check is warn-only)
 *   npm run doctor -- --json  # machine-readable output
 *
 * Exit code: 0 = no failures (warnings allowed), 1 = at least one failure.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const jsonMode = process.argv.includes("--json");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
  bright: "\x1b[1m",
};

const results = [];

function record(status, name, detail, fix) {
  results.push({ status, name, detail, fix });
  if (jsonMode) return;
  const icon =
    status === "pass"
      ? `${colors.green}✓${colors.reset}`
      : status === "warn"
        ? `${colors.yellow}⚠${colors.reset}`
        : `${colors.red}✗${colors.reset}`;
  console.log(`${icon} ${name}${detail ? ` ${colors.dim}— ${detail}${colors.reset}` : ""}`);
  if (fix && status !== "pass") {
    console.log(`  ${colors.cyan}fix:${colors.reset} ${fix}`);
  }
}

const pass = (name, detail) => record("pass", name, detail);
const warn = (name, detail, fix) => record("warn", name, detail, fix);
const fail = (name, detail, fix) => record("fail", name, detail, fix);

function readFileSafe(rel) {
  try {
    return fs.readFileSync(path.join(ROOT, rel), "utf8");
  } catch {
    return null;
  }
}

// Values from .env.example that mean "not configured yet"
const PLACEHOLDER_PATTERNS = [
  "your-deployment",
  "your_key_here",
  "your_ios_key",
  "your_android_key",
  "your-dsn",
  "project-id",
];

function isPlaceholder(value) {
  if (!value) return true;
  const v = value.trim();
  if (v === "") return true;
  return PLACEHOLDER_PATTERNS.some((p) => v.includes(p));
}

function parseEnv(content) {
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

async function main() {
  if (!jsonMode) {
    console.log(`\n${colors.bright}${colors.cyan}Ship React Native — Doctor${colors.reset}\n`);
  }

  // --- 1. Node version vs .nvmrc -------------------------------------------
  const nvmrc = (readFileSafe(".nvmrc") || "").trim();
  const wantedMajor = parseInt(nvmrc, 10);
  const currentMajor = parseInt(process.versions.node.split(".")[0], 10);
  if (!Number.isNaN(wantedMajor) && currentMajor >= wantedMajor) {
    pass("Node version", `v${process.versions.node} (requires ${nvmrc}+)`);
  } else if (!Number.isNaN(wantedMajor)) {
    fail(
      "Node version",
      `v${process.versions.node}, project requires ${nvmrc}+`,
      `nvm install ${nvmrc} && nvm use ${nvmrc}`
    );
  } else {
    warn("Node version", "could not read .nvmrc", "check .nvmrc exists");
  }

  // --- 2. Dependencies installed -------------------------------------------
  if (fs.existsSync(path.join(ROOT, "node_modules", "expo"))) {
    pass("Dependencies installed", "node_modules/expo present");
  } else {
    fail(
      "Dependencies installed",
      "node_modules missing or incomplete",
      "npm install  (postinstall applies patch-package — do not skip)"
    );
  }

  // --- 3. .env exists --------------------------------------------------------
  const envContent = readFileSafe(".env");
  if (envContent === null) {
    fail(".env file", "not found", "cp .env.example .env && npm run setup");
  } else {
    pass(".env file", "present");
  }
  const env = envContent ? parseEnv(envContent) : {};

  // --- 4. Backend mode + its required vars ----------------------------------
  const apiTs = readFileSafe("src/constants/api.ts") || "";
  const modeMatch = apiTs.match(
    /export const API_MODE(?:\s*:\s*ApiMode)?\s*=\s*"([^"]+)"(?:\s+as\s+ApiMode)?/
  );
  const apiMode = modeMatch ? modeMatch[1] : null;

  if (!apiMode) {
    fail(
      "Backend mode",
      "could not read API_MODE from src/constants/api.ts",
      'check src/constants/api.ts exports API_MODE as "convex" or "expo-api-routes"'
    );
  } else {
    pass("Backend mode", `"${apiMode}"`);
  }

  let convexUrl = null;
  if (apiMode === "convex" || apiMode === null) {
    convexUrl = env.EXPO_PUBLIC_CONVEX_URL;
    if (isPlaceholder(convexUrl)) {
      fail(
        "Convex URL",
        "EXPO_PUBLIC_CONVEX_URL is missing or still the .env.example placeholder",
        "npx convex dev  (creates the deployment and prints the URL — paste it into .env)"
      );
      convexUrl = null;
    } else if (!/^https:\/\/.+\.convex\.(cloud|site)/.test(convexUrl)) {
      fail(
        "Convex URL",
        `"${convexUrl}" doesn't look like a Convex deployment URL`,
        "expected https://<deployment>.convex.cloud — copy it from `npx convex dev` output"
      );
      convexUrl = null;
    } else {
      pass("Convex URL", convexUrl);
    }
  }
  if (apiMode === "expo-api-routes") {
    if (isPlaceholder(env.EXPO_PUBLIC_API_URL)) {
      fail(
        "API routes base URL",
        "EXPO_PUBLIC_API_URL is required in expo-api-routes mode",
        "set EXPO_PUBLIC_API_URL in .env to your deployed API routes origin"
      );
    } else {
      pass("API routes base URL", env.EXPO_PUBLIC_API_URL);
    }
    warn(
      "Server AI keys",
      "cannot verify from here — OPENAI_API_KEY / REPLICATE_API_TOKEN / ELEVENLABS_API_KEY must be in the server deployment env",
      "check your deployment environment (EAS/Vercel/Netlify), NOT .env"
    );
  }

  // --- 5. Server keys must NOT leak into client env -------------------------
  const leaked = ["OPENAI_API_KEY", "REPLICATE_API_TOKEN", "ELEVENLABS_API_KEY"].filter(
    (k) => env[k] && apiMode === "convex"
  );
  const leakedPublic = Object.keys(env).filter(
    (k) =>
      k.startsWith("EXPO_PUBLIC_") &&
      /(OPENAI|REPLICATE|ELEVENLABS|CLIENT_SECRET|WEBHOOK_SECRET)/.test(k)
  );
  if (leaked.length || leakedPublic.length) {
    fail(
      "Secret placement",
      `server-side keys found in .env: ${[...leaked, ...leakedPublic].join(", ")}`,
      "move them to the Convex dashboard (Settings → Environment Variables) and delete from .env — anything in the client bundle is extractable"
    );
  } else {
    pass("Secret placement", "no server-side keys in client env");
  }

  // --- 6. RevenueCat keys ----------------------------------------------------
  const iosKey = env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
  const androidKey = env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
  if (isPlaceholder(iosKey) && isPlaceholder(androidKey)) {
    warn(
      "RevenueCat keys",
      "not configured — purchases/paywall will not work",
      "get keys from app.revenuecat.com (iOS key starts with appl_, Android with goog_)"
    );
  } else {
    if (!isPlaceholder(iosKey) && !iosKey.startsWith("appl_")) {
      fail(
        "RevenueCat iOS key",
        "should start with appl_",
        "you may have pasted the Android or secret key — use the iOS public SDK key"
      );
    } else if (!isPlaceholder(iosKey)) {
      pass("RevenueCat iOS key", "appl_…");
    }
    if (!isPlaceholder(androidKey) && !androidKey.startsWith("goog_")) {
      fail(
        "RevenueCat Android key",
        "should start with goog_",
        "use the Android public SDK key from RevenueCat"
      );
    } else if (!isPlaceholder(androidKey)) {
      pass("RevenueCat Android key", "goog_…");
    }
  }

  // --- 7. Optional services --------------------------------------------------
  if (isPlaceholder(env.EXPO_PUBLIC_POSTHOG_API_KEY)) {
    warn("PostHog", "not configured (optional — analytics disabled)");
  } else {
    pass("PostHog", "configured");
  }
  if (isPlaceholder(env.EXPO_PUBLIC_SENTRY_DSN)) {
    warn("Sentry", "not configured (optional — error tracking disabled)");
  } else {
    pass("Sentry", "configured");
  }

  // --- 8. app.json identity (boilerplate defaults) ---------------------------
  try {
    const appJson = JSON.parse(readFileSafe("app.json"));
    const expo = appJson.expo || {};
    const iosId = expo.ios && expo.ios.bundleIdentifier;
    const androidId = expo.android && expo.android.package;
    const defaults = [];
    if (expo.name === "ShipReactNative") defaults.push('name "ShipReactNative"');
    if (expo.scheme === "myapp") defaults.push('scheme "myapp"');
    if (iosId === "com.company.boilerplate") defaults.push("iOS bundle ID");
    if (androidId === "com.company.boilerplate") defaults.push("Android package");
    if (defaults.length) {
      warn(
        "App identity",
        `still boilerplate defaults: ${defaults.join(", ")}`,
        "npm run setup (step 1), or edit app.json — required before any store build"
      );
    } else {
      pass("App identity", `${expo.name} (${iosId || "no iOS id"})`);
    }
  } catch {
    fail("App identity", "could not parse app.json", "check app.json is valid JSON");
  }

  // --- 9. Feature template ----------------------------------------------------
  const featuresTs = readFileSafe("src/constants/features.ts") || "";
  const tplMatch = featuresTs.match(/export const CURRENT_TEMPLATE:\s*AppTemplate\s*=\s*"([^"]+)"/);
  if (tplMatch) {
    pass("Feature template", `"${tplMatch[1]}"`);
  } else {
    warn(
      "Feature template",
      "could not read CURRENT_TEMPLATE from src/constants/features.ts",
      "check src/constants/features.ts"
    );
  }

  // --- 10. Convex reachability (warn-only, network) ---------------------------
  if (convexUrl && typeof fetch === "function") {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      // Any HTTP response (including 404) proves the deployment resolves and answers.
      await fetch(convexUrl, { method: "GET", signal: controller.signal });
      clearTimeout(timer);
      pass("Convex reachable", "deployment responds");
    } catch {
      warn(
        "Convex reachable",
        "no response in 5s (offline, or deployment paused/deleted)",
        "run `npx convex dev` and confirm the URL matches .env"
      );
    }
  }

  // --- Summary -----------------------------------------------------------------
  const failures = results.filter((r) => r.status === "fail");
  const warnings = results.filter((r) => r.status === "warn");

  if (jsonMode) {
    console.log(
      JSON.stringify(
        {
          ok: failures.length === 0,
          failures: failures.length,
          warnings: warnings.length,
          results,
        },
        null,
        2
      )
    );
  } else {
    console.log(
      `\n${colors.bright}${failures.length === 0 ? colors.green + "Ready." : colors.red + "Not ready."}${colors.reset} ` +
        `${results.length} checks: ${results.length - failures.length - warnings.length} passed, ` +
        `${warnings.length} warnings, ${failures.length} failures.\n`
    );
    if (failures.length === 0 && warnings.length > 0) {
      console.log(
        `${colors.dim}Warnings are optional services or pre-store-build reminders.${colors.reset}\n`
      );
    }
  }

  process.exit(failures.length === 0 ? 0 : 1);
}

main();
