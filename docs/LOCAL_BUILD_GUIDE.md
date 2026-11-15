# Local Build & Run Guide

> Standard workflow for building and running apps locally on simulators and devices.
> Follow this for every new app created from the boilerplate.

---

## First-Time Setup (New App)

Run these steps in order when setting up a new app for the first time:

### 1. Install dependencies

```bash
npm install
```

### 2. Set up assets

If you have `icon-source.png` and `splash-logo.png` in `assets/source/`:

```bash
# Copy icon
cp assets/source/icon-source.png assets/icon.png
cp assets/source/icon-source.png assets/adaptive-icon.png

# Copy splash
cp assets/source/splash-logo.png assets/splash.png

# Generate favicon
cp assets/icon.png assets/favicon.png && sips -z 48 48 assets/favicon.png
```

Or run `npm run generate:assets` if `sharp` is installed.

### 3. Generate native projects

```bash
npx expo prebuild --clean
```

This generates the `ios/` and `android/` folders with all native modules properly linked. **You MUST run this before the first build.**

### 4. Install iOS pods

```bash
cd ios && pod install && cd ..
```

Usually `prebuild` handles this, but if you see pod-related errors, run it manually.

### 5. Build and run

```bash
# iOS Simulator
npx expo run:ios

# Android Emulator
npx expo run:android

# Specific iOS simulator
npx expo run:ios --device "iPhone 16 Pro"
```

---

## Common Error: "Cannot find native module"

```
[Error: Cannot find native module 'ExpoSecureStore']
[Error: The package 'react-native-keyboard-controller' doesn't seem to be linked]
[Invariant Violation: TurboModuleRegistry.getEnforcing(...): 'RNSkiaModule' could not be found]
```

**Cause:** The `ios/` folder is stale — native modules were added to `package.json` but the native project wasn't regenerated.

**Fix:**

```bash
npx expo prebuild --clean
npx expo run:ios
```

The `--clean` flag deletes the existing `ios/` and `android/` folders and regenerates them from scratch. This ensures all native modules from `package.json` are properly linked.

**When does this happen?**

- After adding new native dependencies (`npm install expo-secure-store`, etc.)
- After cloning a project that already has an `ios/` folder from a different machine
- After upgrading Expo SDK version
- When using a project built by an agent that didn't run `prebuild`

---

## Development Workflow

### Starting the dev server

```bash
# Standard
npx expo start

# Clear Metro cache (if you see stale bundle errors)
npx expo start --clear

# Force dev client mode (not Expo Go)
npx expo start --dev-client
```

### Rebuilding after dependency changes

If you add a package with native code:

```bash
npm install <package>
npx expo prebuild --clean
npx expo run:ios
```

If you add a JS-only package:

```bash
npm install <package>
# No prebuild needed, just restart Metro
npx expo start --clear
```

### Clean build (nuclear option)

If nothing else works:

```bash
# Remove everything and start fresh
rm -rf node_modules ios android
npm install
npx expo prebuild --clean
npx expo run:ios
```

---

## Environment Variables

Create a `.env` file in the project root for API keys:

```env
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_key_here
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_key_here
EXPO_PUBLIC_POSTHOG_KEY=your_key_here
EXPO_PUBLIC_API_URL=http://localhost:8081
```

These are baked into the JS bundle at build time via `process.env.EXPO_PUBLIC_*`.

For secrets that shouldn't be in the bundle (OpenAI keys, etc.), use Expo API routes (`src/app/api/`) — these run server-side.

---

## Simulator Screenshots (for App Store)

Before capturing screenshots for ASO:

```bash
# Set clean status bar (Simulator menu)
# Simulator → Features → Status Bar → Override
# Time: 9:41, Battery: 100%, WiFi/Cellular: Full

# Or via command line:
xcrun simctl status_bar booted override \
  --time "9:41" \
  --batteryState charged \
  --batteryLevel 100 \
  --wiFiMode active \
  --wiFiBars 3 \
  --cellularMode active \
  --cellularBars 4
```

Then use Cmd+S in Simulator to save screenshots, or:

```bash
xcrun simctl io booted screenshot ~/Desktop/screenshot.png
```

---

## Build for Testing (Device)

### iOS Device

```bash
# Build for connected device
npx expo run:ios --device

# Or build with EAS for TestFlight
eas build --platform ios --profile preview
```

### Android Device

```bash
# Build APK for local testing
npx expo run:android --device

# Or build with EAS
eas build --platform android --profile preview
```

---

## Pre-Submission Build

When ready to submit to stores:

```bash
# Production iOS build (sends to TestFlight)
eas build --platform ios --profile production

# Production Android build (AAB for Play Store)
eas build --platform android --profile production

# Submit to App Store
eas submit --platform ios

# Submit to Play Store
eas submit --platform android
```

See `docs/EAS_DEPLOYMENT.md` for full EAS configuration.

---

## API Routes — Local Development

Expo API routes (`src/app/api/`) run server-side and **only work when deployed via EAS**.
For local development on iOS/Android simulators, use the dev server:

### Setup

1. Create `.env` in project root:

```env
OPENAI_API_KEY=sk-your-key
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:8082
```

2. Install dotenv: `npm install dotenv --save-dev`

3. Start the dev server (separate terminal):

```bash
node dev-server.js
```

4. Start Metro (another terminal):

```bash
npx expo start --clear
```

5. Run on simulator:

```bash
npx expo run:ios
```

### Finding Your Local IP

```bash
ifconfig en0 | grep "inet " | awk '{print $2}'
```

### Important Notes

- `EXPO_PUBLIC_*` vars are baked into the JS bundle — restart Metro after changing them
- Non-prefixed vars (like `OPENAI_API_KEY`) are only available server-side (dev-server.js or EAS)
- The dev server logs all API calls so you can debug issues

---

## Production Deployment (EAS)

In production, API routes run automatically on EAS servers. No dev-server needed.

### Set API Keys on EAS

```bash
# Set secrets (one-time per project)
eas secret:create --name OPENAI_API_KEY --value sk-xxx --scope project
eas secret:create --name ANTHROPIC_API_KEY --value sk-ant-xxx --scope project

# Remove EXPO_PUBLIC_API_URL for production (routes are relative)
# Or set it to your EAS URL if needed
```

### Build & Deploy

```bash
# Preview build (TestFlight/internal)
eas build --platform ios --profile preview
eas submit --platform ios

# Production build
eas build --platform ios --profile production
eas submit --platform ios
```

### Environment Variables in Production

- API keys: Set via `eas secret:create` (server-side only)
- `EXPO_PUBLIC_API_URL`: Leave empty or unset — routes use relative URLs on EAS
- RevenueCat keys: Set as `EXPO_PUBLIC_REVENUECAT_IOS_KEY` in eas.json or secrets

---

## Troubleshooting

| Problem                     | Fix                                                          |
| --------------------------- | ------------------------------------------------------------ |
| "Cannot find native module" | `npx expo prebuild --clean && npx expo run:ios`              |
| Metro bundler stuck         | `npx expo start --clear`                                     |
| Pod install fails           | `cd ios && rm -rf Pods Podfile.lock && pod install`          |
| Xcode build fails           | Open `ios/*.xcworkspace` in Xcode, clean build (Cmd+Shift+K) |
| Android build fails         | `cd android && ./gradlew clean`                              |
| White screen on launch      | Check Metro console for JS errors                            |
| "Invariant Violation"       | Usually a missing native module — run prebuild               |
| Old bundle loading          | Kill the app, clear Metro cache, restart                     |
