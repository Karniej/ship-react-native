# EAS Build & Submit Guide

Complete guide for building and submitting your app using Expo Application Services (EAS).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Configuration](#configuration)
- [Building Your App](#building-your-app)
- [Submitting to App Stores](#submitting-to-app-stores)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- [ ] An [Expo account](https://expo.dev/signup)
- [ ] [EAS CLI](https://docs.expo.dev/eas/) installed: `npm install -g eas-cli`
- [ ] For iOS: An [Apple Developer account](https://developer.apple.com/) ($99/year)
- [ ] For Android: A [Google Play Developer account](https://play.google.com/console/) ($25 one-time)

---

## Initial Setup

### 1. Login to EAS

```bash
eas login
```

### 2. Configure Your Project

If this is your first time setting up EAS for this project:

```bash
eas build:configure
```

This creates/updates `eas.json` with build profiles.

### 3. Update app.json

Update your `app.json` with your app's information:

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.yourcompany.yourapp",
      "versionCode": 1
    }
  }
}
```

---

## Configuration

### Understanding eas.json

The `eas.json` file defines build profiles. Here's what each profile does:

```json
{
  "cli": {
    "version": ">= 12.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "env": {
        "APP_ENV": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      },
      "env": {
        "APP_ENV": "preview"
      }
    },
    "production": {
      "autoIncrement": true,
      "env": {
        "APP_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_APPLE_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-services-key.json",
        "track": "internal"
      }
    }
  }
}
```

### Profile Descriptions

| Profile       | Purpose                           | Distribution          |
| ------------- | --------------------------------- | --------------------- |
| `development` | Local development with dev client | Internal (simulator)  |
| `preview`     | Testing builds for QA/testers     | Internal (APK/Ad-hoc) |
| `production`  | App Store / Play Store release    | Store                 |

---

## Building Your App

### Development Build

For local development with hot reload:

```bash
# iOS Simulator
eas build --profile development --platform ios

# Android Emulator
eas build --profile development --platform android
```

### Preview Build

For internal testing (QA, beta testers):

```bash
# iOS (Ad-hoc distribution)
eas build --profile preview --platform ios

# Android (APK file)
eas build --profile preview --platform android

# Both platforms
eas build --profile preview --platform all
```

### Production Build

For App Store / Play Store submission:

```bash
# iOS (App Store)
eas build --profile production --platform ios

# Android (Play Store - AAB)
eas build --profile production --platform android

# Both platforms
eas build --profile production --platform all
```

---

## Submitting to App Stores

### iOS App Store

#### Step 1: Configure Apple Credentials

Update `eas.json` with your Apple credentials:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDEF1234"
      }
    }
  }
}
```

**Where to find these values:**

- **appleId**: Your Apple ID email
- **ascAppId**: App Store Connect → Your App → App Information → Apple ID
- **appleTeamId**: [Apple Developer Account](https://developer.apple.com/account) → Membership → Team ID

#### Step 2: Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click "My Apps" → "+" → "New App"
3. Fill in app details (name, bundle ID, SKU)

#### Step 3: Submit

```bash
eas submit --platform ios
```

Or submit a specific build:

```bash
eas submit --platform ios --id BUILD_ID
```

### Google Play Store

#### Step 1: Create Service Account Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google Play Android Developer API"
4. Create a Service Account:
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Grant "Service Account User" role
   - Create JSON key and download it
5. In [Google Play Console](https://play.google.com/console/):
   - Go to "Users and permissions" → "Invite new users"
   - Add the service account email
   - Grant "Release manager" permission

#### Step 2: Configure EAS

1. Save the JSON key as `google-services-key.json` in your project root
2. **Add to .gitignore** (IMPORTANT - never commit this file):

```gitignore
# Google Play Service Account Key
google-services-key.json
```

3. Update `eas.json`:

```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-services-key.json",
        "track": "internal"
      }
    }
  }
}
```

#### Step 3: Create App in Play Console

1. Go to [Google Play Console](https://play.google.com/console/)
2. Click "Create app"
3. Fill in app details
4. Complete the app content questionnaire

#### Step 4: Submit

```bash
eas submit --platform android
```

### Release Tracks (Android)

| Track        | Purpose                              |
| ------------ | ------------------------------------ |
| `internal`   | Internal testing (up to 100 testers) |
| `alpha`      | Closed testing                       |
| `beta`       | Open testing                         |
| `production` | Public release                       |

Change track in `eas.json`:

```json
{
  "submit": {
    "production": {
      "android": {
        "track": "production"
      }
    }
  }
}
```

---

## Environment Variables

### Setting EAS Secrets

For sensitive values that shouldn't be in your repository:

```bash
# Set a secret
eas secret:create --name SENTRY_DSN --value "https://xxx@sentry.io/xxx" --scope project

# List secrets
eas secret:list

# Delete a secret
eas secret:delete --name SENTRY_DSN
```

### Using Secrets in Builds

Secrets are automatically available as environment variables during builds.

In `eas.json`, you can reference them:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SENTRY_DSN": "@SENTRY_DSN"
      }
    }
  }
}
```

---

## Troubleshooting

### Common Issues

#### "No bundle identifier" error

Ensure `ios.bundleIdentifier` is set in `app.json`:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp"
    }
  }
}
```

#### Build fails with signing errors

```bash
# Clear credentials and re-configure
eas credentials
```

#### "App ID not found" in App Store Connect

Make sure:

1. The app exists in App Store Connect
2. Bundle ID matches exactly
3. You have the correct Apple Team ID

#### Android build fails

```bash
# Clean gradle cache
cd android && ./gradlew clean && cd ..

# Or rebuild from scratch
eas build --platform android --clear-cache
```

### Getting Help

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Expo Discord Community](https://chat.expo.dev/)
- [Expo Forums](https://forums.expo.dev/)

---

## Backend Strategy

This boilerplate uses **Expo API Routes** for all server-side logic (AI API calls, etc.).
Routes in `src/app/api/` run server-side on EAS — API keys stay secure.

### Why EAS over a custom backend:

- Zero extra infrastructure to maintain
- Deploys automatically with the app
- Scales per-app automatically
- API keys set via EAS environment variables
- Simple to migrate later if needed

### Setting API Keys on EAS:

```bash
eas secret:create --name OPENAI_API_KEY --value sk-xxx --scope project
# Or for Anthropic:
eas secret:create --name ANTHROPIC_API_KEY --value sk-ant-xxx --scope project
```

### When to consider a shared backend:

- 5+ apps generating revenue
- Need cross-app analytics or rate limiting
- API costs need centralized tracking
- Want to swap models without app updates

---

## Quick Reference

### Build Commands

```bash
# Development (with dev client)
eas build -p ios --profile development
eas build -p android --profile development

# Preview (internal testing)
eas build -p ios --profile preview
eas build -p android --profile preview

# Production (store release)
eas build -p ios --profile production
eas build -p android --profile production
eas build -p all --profile production
```

### Submit Commands

```bash
# Submit latest build
eas submit -p ios
eas submit -p android

# Submit specific build
eas submit -p ios --id BUILD_ID

# Submit local binary
eas submit -p ios --path ./path/to/app.ipa
eas submit -p android --path ./path/to/app.aab
```

### Credential Commands

```bash
# Manage credentials
eas credentials

# View current credentials
eas credentials --platform ios
eas credentials --platform android
```
