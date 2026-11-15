# Setup Script Enhancement Ideas

> Historical ideation document: some examples in this file refer to the older Supabase-based setup flow.
> The current boilerplate backend story is `Convex` recommended with `Expo API Routes` as the lighter alternative.
> Use `scripts/setup.js` and `docs/SETUP_GUIDE.md` as the current source of truth.

Ideas for improving the `scripts/setup.js` interactive setup wizard.

---

## Current Features (Already Implemented)

- [x] Project info (name, slug, bundle ID, description, author)
- [x] Brand colors (primary, secondary with presets)
- [x] Default theme selection (system/light/dark)
- [x] App links (website, support email, twitter)
- [x] App template selection (7 AI feature combinations)
- [x] Authentication configuration (social/anonymous)
- [x] .env file creation from template

---

## High Priority Additions

### 1. Supabase Configuration

Auto-configure Supabase credentials in `.env`:

```javascript
// Prompt for Supabase setup
log.title("🗄️  Supabase Configuration");

console.log(`
Do you have a Supabase project ready?

  1. Yes, I have my credentials
  2. No, I'll set it up later
`);

const supabaseChoice = await question("Select option (1-2) [2]: ");

if (supabaseChoice === "1") {
  const supabaseUrl = await question("Supabase Project URL: ");
  const supabaseAnonKey = await question("Supabase Anon Key: ");

  // Update .env file
  let envContent = fs.readFileSync(envPath, "utf8");
  envContent = envContent.replace(
    /EXPO_PUBLIC_SUPABASE_URL=.*/,
    `EXPO_PUBLIC_SUPABASE_URL=${supabaseUrl}`
  );
  envContent = envContent.replace(
    /EXPO_PUBLIC_SUPABASE_ANON_KEY=.*/,
    `EXPO_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}`
  );
  fs.writeFileSync(envPath, envContent);

  // Ask about running migrations
  const runMigrations = await question("Run database migrations now? (y/n) [n]: ");
  if (runMigrations === "y") {
    console.log("Running: npx supabase db push");
    execSync("npx supabase db push", { stdio: "inherit" });
  }
}
```

**Value:** Most users struggle with initial Supabase setup. This streamlines it.

---

### 2. EAS Project Setup

Auto-configure EAS project ID:

```javascript
log.title("📦 EAS Build Configuration");

console.log(`
Do you want to set up EAS Build now?

  1. Yes, initialize new EAS project
  2. Yes, I have an existing project ID
  3. No, I'll do this later
`);

const easChoice = await question("Select option (1-3) [3]: ");

if (easChoice === "1") {
  console.log("\nRunning: eas init\n");
  execSync("eas init", { stdio: "inherit" });
  log.success("EAS project initialized!");
} else if (easChoice === "2") {
  const projectId = await question("Enter your EAS project ID: ");

  // Update app.json
  appJson.expo.extra.eas.projectId = projectId;
  appJson.expo.updates.url = `https://u.expo.dev/${projectId}`;
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

  log.success(`EAS project ID configured: ${projectId}`);
}
```

**Value:** Prevents common "your-project-id" placeholder issues.

---

### 3. Credit System Configuration

Let users customize the credit/monetization model:

```javascript
log.title("💰 Credit System Configuration");

console.log(`
Configure your app's credit system:
`);

const initialCredits = await question("Initial free credits for new users [10]: ");
const finalInitialCredits = parseInt(initialCredits) || 10;

console.log(`
Credit costs per generation (enter number or press Enter for default):
`);

const imageCost = await question("  Image generation cost [1]: ");
const videoCost = await question("  Video generation cost [4]: ");
const speechCost = await question("  Text-to-speech cost [1]: ");
const transcriptionCost = await question("  Transcription cost [1]: ");

// Update constants/generations.ts
const generationsPath = path.join(__dirname, "..", "constants", "generations.ts");
let generationsContent = fs.readFileSync(generationsPath, "utf8");

generationsContent = generationsContent.replace(
  /initialCredits: \d+/,
  `initialCredits: ${finalInitialCredits}`
);
// ... update other costs

fs.writeFileSync(generationsPath, generationsContent);
log.success(`Credit system configured (starting credits: ${finalInitialCredits})`);
```

**Value:** Critical for monetization strategy - users need to customize this.

---

### 4. Onboarding Configuration

Control the onboarding experience:

```javascript
log.title("👋 Onboarding Configuration");

console.log(`
Configure your app's onboarding flow:

  1. Full onboarding (welcome → features → permissions → premium)
  2. Minimal onboarding (welcome → premium)
  3. No onboarding (go straight to app)
`);

const onboardingChoice = await question("Select option (1-3) [1]: ");

const showPremiumAfterOnboarding = await question(
  "Show premium/paywall screen after onboarding? (y/n) [y]: "
);

// Update features.ts
// Update onboarding.ts with selected steps
```

**Value:** Many apps need different onboarding strategies.

---

## Medium Priority Additions

### 5. Default Language Selection

```javascript
log.title("🌍 Default Language");

console.log(`
Select the default language for your app:

  1. English (en)
  2. Spanish (es)
  3. French (fr)
  4. German (de)
  5. Italian (it)
`);

const langChoice = await question("Select option (1-5) [1]: ");
const languages = { 1: "en", 2: "es", 3: "fr", 4: "de", 5: "it" };
const defaultLanguage = languages[langChoice] || "en";

// Update locales/index.ts with default
```

---

### 6. Analytics Configuration

```javascript
log.title("📊 Analytics Configuration");

const posthogKey = await question("PostHog API Key (press Enter to skip): ");
const sentryDsn = await question("Sentry DSN (press Enter to skip): ");

// Update .env with provided values
if (posthogKey) {
  envContent = envContent.replace(
    /EXPO_PUBLIC_POSTHOG_API_KEY=.*/,
    `EXPO_PUBLIC_POSTHOG_API_KEY=${posthogKey}`
  );
}
```

---

### 7. RevenueCat Configuration

```javascript
log.title("💳 RevenueCat Configuration");

console.log(`
Do you have RevenueCat API keys ready?
`);

const rcIosKey = await question("iOS API Key (press Enter to skip): ");
const rcAndroidKey = await question("Android API Key (press Enter to skip): ");

// Update .env
```

---

## Low Priority / Nice to Have

### 8. Post-Setup Validation

```javascript
log.title("✅ Validating Setup");

const checks = [
  { name: "app.json updated", check: () => appJson.expo.name !== "ShipReactNative" },
  { name: "package.json updated", check: () => packageJson.name !== "ship-react-native" },
  { name: ".env created", check: () => fs.existsSync(envPath) },
  { name: "Brand colors set", check: () => primaryColor !== "#007AFF" },
];

checks.forEach(({ name, check }) => {
  if (check()) {
    log.success(name);
  } else {
    log.warn(`${name} - using defaults`);
  }
});
```

---

### 9. Auto-Install Dependencies

```javascript
log.title("📦 Installing Dependencies");

const installDeps = await question("Run npm install now? (y/n) [y]: ");
if (installDeps !== "n") {
  console.log("\nInstalling dependencies...\n");
  execSync("npm install", { stdio: "inherit" });
  log.success("Dependencies installed!");
}
```

---

### 10. Git Repository Initialization

```javascript
// Check if already a git repo
if (!fs.existsSync(path.join(__dirname, "..", ".git"))) {
  const initGit = await question("Initialize git repository? (y/n) [y]: ");
  if (initGit !== "n") {
    execSync("git init", { stdio: "inherit" });
    log.success("Git repository initialized");
  }
}
```

---

### 11. Asset Generation Prompt

```javascript
const generateAssets = await question("Generate app icons and splash screen? (y/n) [n]: ");
if (generateAssets === "y") {
  console.log("\nRunning: npm run generate:assets\n");
  execSync("npm run generate:assets", { stdio: "inherit" });
}
```

---

## Implementation Priority

| Priority  | Feature                   | Effort | Value  |
| --------- | ------------------------- | ------ | ------ |
| 🔴 High   | Supabase Configuration    | Medium | High   |
| 🔴 High   | EAS Project Setup         | Low    | High   |
| 🔴 High   | Credit System Config      | Medium | High   |
| 🟡 Medium | Onboarding Config         | Medium | Medium |
| 🟡 Medium | Post-Setup Validation     | Low    | Medium |
| 🟡 Medium | Auto-Install Dependencies | Low    | Medium |
| 🟢 Low    | Default Language          | Low    | Low    |
| 🟢 Low    | Analytics Config          | Low    | Medium |
| 🟢 Low    | RevenueCat Config         | Low    | Medium |
| 🟢 Low    | Git Init                  | Low    | Low    |
| 🟢 Low    | Asset Generation          | Low    | Low    |

---

## Notes

- All additions should be **optional** with sensible defaults
- Keep the setup under 5 minutes total
- Show clear "skip" options for each section
- Validate input where possible (URLs, hex colors, etc.)
- Consider adding a `--quick` flag for minimal setup
