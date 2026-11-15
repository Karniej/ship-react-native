# Scripts Guide

This document explains all the automation scripts included in this boilerplate.

## Table of Contents

- [Overview](#overview)
- [Setup Script](#setup-script)
- [Release Script](#release-script)
- [Database Seed Script](#database-seed-script)
- [Asset Generation Script](#asset-generation-script)
- [NPM Scripts Reference](#npm-scripts-reference)

---

## Overview

The `scripts/` directory contains automation tools to help you:

| Script               | Purpose                                | Command                   |
| -------------------- | -------------------------------------- | ------------------------- |
| `setup.js`           | Interactive project setup wizard       | `npm run setup`           |
| `release.js`         | Automated version bumping and releases | `npm run release`         |
| `seed.js`            | Populate database with sample data     | `npm run db:seed`         |
| `generate-assets.js` | Generate app icons and splash screens  | `npm run generate:assets` |

---

## Setup Script

**File:** `scripts/setup.js`
**Command:** `npm run setup`

### What It Does

The setup script provides an interactive wizard to customize your app:

1. **App Identity**
   - App name
   - Bundle identifier (iOS/Android)
   - URL scheme for deep linking

2. **Branding**
   - Primary color
   - Secondary color
   - App description

3. **Configuration**
   - Updates `app.json` with your values
   - Updates `constants/brand.ts`
   - Updates `constants/config.ts`

### Usage

```bash
# Run the setup wizard
npm run setup

# Example interaction:
# ? What is your app name? My AI App
# ? What is your iOS bundle identifier? com.mycompany.myaiapp
# ? What is your Android package name? com.mycompany.myaiapp
# ? What is your primary brand color? #6366F1
# ✅ Setup complete!
```

### What Gets Updated

```
app.json
├── expo.name
├── expo.slug
├── expo.scheme
├── ios.bundleIdentifier
└── android.package

constants/brand.ts
├── BRAND.name
├── BRAND.colors.primary
└── BRAND.description

constants/config.ts
└── APP_CONFIG.APP_NAME
```

### Running Setup Again

You can run the setup script multiple times to update values:

```bash
npm run setup
```

---

## Release Script

**File:** `scripts/release.js`
**Command:** `npm run release`

### What It Does

Automates the release process:

1. **Version Bumping**
   - Prompts for version type (major, minor, patch)
   - Updates version in `package.json`
   - Updates version in `app.json`
   - Updates build numbers

2. **Changelog**
   - Moves "Unreleased" items to new version section
   - Adds release date

3. **Git Operations**
   - Creates a git commit with version changes
   - Creates a git tag (e.g., `v1.2.0`)
   - Optionally pushes to remote

### Usage

```bash
# Start the release process
npm run release

# Example interaction:
# Current version: 1.0.0
# ? Select release type: (Use arrow keys)
#   ❯ patch (1.0.1) - Bug fixes
#     minor (1.1.0) - New features
#     major (2.0.0) - Breaking changes
# ? Create git tag? Yes
# ? Push to remote? Yes
# ✅ Released v1.0.1
```

### Version Types

| Type    | When to Use                         | Example       |
| ------- | ----------------------------------- | ------------- |
| `patch` | Bug fixes, small improvements       | 1.0.0 → 1.0.1 |
| `minor` | New features (backwards compatible) | 1.0.0 → 1.1.0 |
| `major` | Breaking changes                    | 1.0.0 → 2.0.0 |

### Pre-Release Checklist

Before running the release script:

- [ ] All tests passing
- [ ] CHANGELOG.md updated with changes under "Unreleased"
- [ ] No uncommitted changes
- [ ] On the correct branch (usually `main` or `master`)

---

## Database Seed Script

**File:** `scripts/seed.js`
**Command:** `npm run db:seed`

### What It Does

Populates your Supabase database with sample data for development:

1. **Sample Users**
   - Creates test user profiles
   - Sets up initial credits

2. **Sample Generations**
   - Creates example image generations
   - Creates example audio generations
   - Creates example transcriptions

3. **Sample Data**
   - Realistic prompts and outputs
   - Various AI models represented
   - Mix of generation types

### Prerequisites

Before running the seed script:

1. **Supabase Project** - Must have a Supabase project set up
2. **Environment Variables** - Must have `.env` configured:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. **Migrations Run** - Database tables must exist

### Usage

```bash
# Seed the database
npm run db:seed

# Output:
# 🌱 Starting database seed...
# ✅ Created 3 sample users
# ✅ Created 10 sample generations
# ✅ Seed complete!
```

### Customizing Seed Data

Edit `scripts/seed.js` to customize:

```javascript
// Example: Add more sample users
const SAMPLE_USERS = [
  {
    email: "demo@example.com",
    name: "Demo User",
    credits: 100,
  },
  // Add more users...
];

// Example: Add more sample generations
const SAMPLE_GENERATIONS = [
  {
    type: "image",
    provider: "openai",
    model: "dall-e-3",
    prompt: "A futuristic city at sunset",
    // ...
  },
  // Add more generations...
];
```

### Clearing Seed Data

To remove seed data and start fresh:

```sql
-- Run in Supabase SQL Editor
DELETE FROM generations WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE '%@example.com'
);
DELETE FROM user_credits WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE '%@example.com'
);
DELETE FROM profiles WHERE email LIKE '%@example.com';
```

---

## Asset Generation Script

**File:** `scripts/generate-assets.js`
**Command:** `npm run generate:assets`

### What It Does

Generates all required app icons and splash screens from source images:

1. **App Icons**
   - iOS icons (all required sizes)
   - Android adaptive icons
   - Web favicon

2. **Splash Screens**
   - iOS splash images
   - Android splash images
   - Various resolutions

### Prerequisites

1. **Source Images** in `assets/source/`:

   ```
   assets/source/
   ├── icon-source.png      # 1024x1024, your app icon
   └── splash-logo.png      # Logo for splash screen
   ```

2. **Sharp** (image processing library):
   ```bash
   npm install sharp --save-dev
   ```

### Source Image Requirements

| File              | Size      | Format | Notes                   |
| ----------------- | --------- | ------ | ----------------------- |
| `icon-source.png` | 1024x1024 | PNG    | No transparency for iOS |
| `splash-logo.png` | 512x512+  | PNG    | Centered on splash      |

### Usage

```bash
# Generate all assets
npm run generate:assets

# Output:
# 🎨 Generating assets...
# ✅ Generated iOS icons (10 sizes)
# ✅ Generated Android icons (5 sizes)
# ✅ Generated splash screens (6 sizes)
# ✅ Generated favicon
# 🎉 All assets generated!
```

### Generated Files

```
assets/
├── icon.png                 # Main app icon (1024x1024)
├── adaptive-icon.png        # Android adaptive icon foreground
├── splash.png               # Main splash screen
├── favicon.png              # Web favicon (32x32)
└── generated/               # Additional sizes
    ├── icon-20.png
    ├── icon-29.png
    ├── icon-40.png
    ├── icon-60.png
    ├── icon-76.png
    ├── icon-83.5.png
    ├── icon-1024.png
    └── ...
```

### Customizing Generation

Edit `scripts/generate-assets.js` to customize:

```javascript
// Example: Add custom icon sizes
const ICON_SIZES = [
  { size: 20, name: "icon-20" },
  { size: 29, name: "icon-29" },
  // Add more sizes...
];

// Example: Customize splash background color
const SPLASH_CONFIG = {
  backgroundColor: "#1a1a2e",
  logoMaxWidth: 200,
  logoMaxHeight: 200,
};
```

---

## NPM Scripts Reference

All available npm scripts in `package.json`:

### Development

| Command           | Description                   |
| ----------------- | ----------------------------- |
| `npm start`       | Start Expo development server |
| `npm run ios`     | Run on iOS simulator          |
| `npm run android` | Run on Android emulator       |
| `npm run web`     | Run in web browser            |

### Code Quality

| Command                 | Description                    |
| ----------------------- | ------------------------------ |
| `npm run lint`          | Run ESLint                     |
| `npm run lint:fix`      | Run ESLint with auto-fix       |
| `npm run type-check`    | Run TypeScript compiler check  |
| `npm test`              | Run Jest tests                 |
| `npm run test:watch`    | Run tests in watch mode        |
| `npm run test:coverage` | Run tests with coverage report |

### Building

| Command                 | Description              |
| ----------------------- | ------------------------ |
| `npm run build:ios`     | Build for iOS (EAS)      |
| `npm run build:android` | Build for Android (EAS)  |
| `npm run build:all`     | Build for both platforms |

### Automation

| Command                   | Description                    |
| ------------------------- | ------------------------------ |
| `npm run setup`           | Run interactive setup wizard   |
| `npm run release`         | Run release automation         |
| `npm run db:seed`         | Seed database with sample data |
| `npm run generate:assets` | Generate app icons and splash  |

### Utilities

| Command          | Description                       |
| ---------------- | --------------------------------- |
| `npm run clean`  | Clear caches and temp files       |
| `npm run reset`  | Full reset (node_modules, caches) |
| `npm run doctor` | Check project health              |

---

## Creating Custom Scripts

To add your own automation scripts:

1. **Create the script** in `scripts/`:

   ```javascript
   // scripts/my-script.js
   const { execSync } = require("child_process");

   console.log("🚀 Running my script...");

   // Your automation logic here

   console.log("✅ Done!");
   ```

2. **Add to package.json**:

   ```json
   {
     "scripts": {
       "my-script": "node scripts/my-script.js"
     }
   }
   ```

3. **Run it**:
   ```bash
   npm run my-script
   ```

---

## Troubleshooting

### Setup Script Issues

**"Permission denied"**

```bash
chmod +x scripts/setup.js
```

**"Module not found"**

```bash
npm install
```

### Seed Script Issues

**"Connection refused"**

- Check Supabase URL in `.env`
- Ensure Supabase project is running

**"Unauthorized"**

- Check `SUPABASE_SERVICE_ROLE_KEY` in `.env`
- Ensure you're using the service role key, not anon key

### Asset Generation Issues

**"Sharp module not found"**

```bash
npm install sharp --save-dev
```

**"Source image not found"**

- Ensure `assets/source/icon-source.png` exists
- Check file is exactly 1024x1024 pixels
