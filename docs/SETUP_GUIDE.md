# Setup Guide: From Boilerplate to App Store

> Battle-tested workflow extracted from Fishify and ReWordly submissions.

---

## 1. Initial Setup

```bash
# Clone the boilerplate
git clone https://github.com/Karniej/ship-react-native.git my-app
cd my-app

# Install dependencies
npm install

# Run the interactive setup wizard (sets app name, brand colors, font)
npm run setup

# Start the dev server
npm start
```

After setup, update these files manually:

- `src/constants/brand.ts` -- name, tagline, colors, gradients, links
- `src/constants/config.ts` -- APP_NAME, SUPPORT_EMAIL, URLs, PRODUCT_IDS
- `src/constants/paywall.ts` -- benefit list (icons, title keys, descriptions)
- `src/constants/onboarding.ts` -- slide content, icon, gradient

---

## 2. Environment Variables

Create a `.env` file at the project root:

```env
SENTRY_DISABLE_AUTO_UPLOAD=true

# Convex mode (recommended)
EXPO_PUBLIC_CONVEX_URL=

# Expo API Routes mode only
EXPO_PUBLIC_API_URL=

# RevenueCat
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxx
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxx
```

**Important**:

- `EXPO_PUBLIC_*` vars are embedded in the client bundle
- provider secrets like `OPENAI_API_KEY` must stay server-side
- in `Convex` mode, store those secrets in the Convex dashboard
- in `Expo API Routes` mode, store them in your deployment environment

---

## 3. Backend Setup

### Option A: Convex (Recommended)

```bash
npx convex init
npx convex dev
```

Add your deployment URL to `.env`:

```env
EXPO_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

### Option B: Expo API Routes

Use this mode if you only need server-side AI routes and do not need the full Convex data layer.

After deploying your server runtime, add:

```env
EXPO_PUBLIC_API_URL=https://your-api-origin
```

## 4. EAS Setup

### Initialize EAS

```bash
eas init
```

This creates a project on expo.dev and writes your `projectId` into `app.json > extra.eas.projectId`.

### eas.json Configuration

Create/update `eas.json` based on Fishify's proven config:

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
        "simulator": true,
        "image": "latest"
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
      "ios": {
        "image": "latest"
      },
      "android": {
        "buildType": "app-bundle"
      },
      "env": {
        "APP_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "YOUR_ASC_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-key.json",
        "track": "internal",
        "releaseStatus": "draft"
      }
    }
  }
}
```

Key fields explained:

| Field                                | Value          | Why                                                                             |
| ------------------------------------ | -------------- | ------------------------------------------------------------------------------- |
| `cli.appVersionSource`               | `"remote"`     | EAS manages version numbers; `autoIncrement` bumps build number each submission |
| `build.production.autoIncrement`     | `true`         | Auto-increments iOS buildNumber and Android versionCode                         |
| `build.production.ios.image`         | `"latest"`     | Uses latest Xcode on EAS build servers                                          |
| `build.production.android.buildType` | `"app-bundle"` | AAB format required by Play Store                                               |
| `submit.production.android.track`    | `"internal"`   | Uploads to internal testing track (promote manually)                            |

### Why pin expo-constants to 55.0.4

EAS iOS builds can fail with a CocoaPods podspec parse error on newer versions of `expo-constants`. Pin it in `package.json`:

```json
"expo-constants": "~55.0.4"
```

If you see `Pod install failed` or `podspec parse error` during `eas build`, this is almost always the fix.

### Why runtimeVersion must be hardcoded "1.0.0"

In `app.json`:

```json
"runtimeVersion": "1.0.0"
```

Do NOT use a policy like `{ "policy": "sdkVersion" }`. A hardcoded string ensures OTA updates only target builds with a matching runtime. If you change native dependencies, bump this manually (e.g., `"2.0.0"`).

---

## 4. app.json Checklist

Every field that must be set before building:

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "yourapp",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "cover",
      "backgroundColor": "#YOUR_PRIMARY_DARK"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.yourcompany.yourapp",
      "usesAppleSignIn": true,
      "infoPlist": {
        "NSCameraUsageDescription": "...",
        "NSPhotoLibraryUsageDescription": "...",
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#YOUR_PRIMARY_DARK"
      },
      "package": "com.yourcompany.yourapp",
      "permissions": ["CAMERA", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"]
    },
    "web": {
      "bundler": "metro",
      "output": "server",
      "favicon": "./assets/favicon.png"
    },
    "runtimeVersion": "1.0.0",
    "experiments": {
      "typedRoutes": true,
      "tsconfigPaths": true,
      "reactCompiler": true
    },
    "extra": {
      "router": { "origin": false },
      "eas": { "projectId": "your-project-id" }
    },
    "owner": "your-expo-username"
  }
}
```

Critical fields:

| Field                           | Required Value  | Why                                                            |
| ------------------------------- | --------------- | -------------------------------------------------------------- |
| `web.output`                    | `"server"`      | Required for Expo API routes and EAS Hosting                   |
| `ios.supportsTablet`            | `false`         | Unless you explicitly support iPad layouts                     |
| `ITSAppUsesNonExemptEncryption` | `false`         | Avoids the export compliance questionnaire on every submission |
| `runtimeVersion`                | `"1.0.0"`       | Hardcoded string, not a policy object                          |
| `scheme`                        | your app scheme | Required for deep linking and OAuth redirects                  |

---

## 5. Hard Paywall Architecture

The boilerplate uses a 3-layer hard paywall system. Every layer serves a distinct purpose:

### Layer 1: index.tsx (Entry Router)

```
App launches -> index.tsx checks:
  1. Onboarding completed? No -> /onboarding
  2. isPremium? No -> /(app)/premium
  3. isPremium? Yes -> /(app)/(tabs)
```

**Why it exists**: Handles the initial routing decision on cold start. Waits for `usePremiumStatus` to finish loading before routing, preventing flash of wrong screen.

### Layer 2: (app)/\_layout.tsx (Guard)

```typescript
useEffect(() => {
  if (isStatusLoading) return;
  const onPremium = segments.some((s) => s === "premium");
  if (!isSubscribed && !onPremium) {
    router.replace("/(app)/premium");
  }
}, [isSubscribed, isStatusLoading, segments, router]);
```

**Why it exists**: Catches edge cases where a user navigates directly to an app route (deep link, back button) without being subscribed. Acts as a safety net after the initial routing.

### Layer 3: usePremiumStatus Hook

```typescript
// Checks RevenueCat on mount, then every 5 minutes
// Syncs result to shared usePremiumStore (Zustand)
const isPremium = await purchasesService.checkSubscriptionStatus();
usePremiumStore.setState({ isSubscribed: isPremium });
```

**Why it exists**: The single source of truth for subscription state. Both Layer 1 and Layer 2 read from `usePremiumStore`. After a successful purchase, `refreshPremiumStatus()` is called to immediately update the store, which triggers Layer 2's useEffect to allow navigation past the paywall.

### How purchase flow works

1. User taps Subscribe on `premium.tsx`
2. `purchasePackage()` calls RevenueCat
3. On success, `refreshPremiumStatus()` re-checks entitlements
4. `usePremiumStore.isSubscribed` becomes `true`
5. Layer 2's useEffect fires, but since user is on premium screen already, no redirect
6. After confetti animation (2.5s), `handleClose()` navigates to `/(app)/(tabs)`

### Dev skip button

In `__DEV__` mode, the premium screen shows a "Skip (Dev)" button that sets `isSubscribed: true` directly in the store, bypassing RevenueCat entirely. This only appears in development builds.

---

## 6. RevenueCat Setup

### Step 1: Create RevenueCat project

1. Go to [app.revenuecat.com](https://app.revenuecat.com)
2. Create a new project
3. Add an iOS app (enter your bundle ID)
4. Add an Android app (enter your package name)

### Step 2: App Store Connect products

Create subscriptions in ASC first (see Section 8 below), then in RevenueCat:

1. Go to Products in RevenueCat dashboard
2. Click "Import from App Store Connect" (or add manually)
3. Add both products: `yourapp.ios.weekly` and `yourapp.ios.yearly`

### Step 3: Create entitlement

1. Go to Entitlements
2. Create entitlement with ID: **`premium`**
3. Attach both products to this entitlement

This ID must match `APP_CONFIG.PREMIUM_ENTITLEMENT_ID` in `src/constants/config.ts`.

### Step 4: Create offering

1. Go to Offerings
2. The `default` offering should already exist
3. Add two packages:
   - **Weekly** package -> attach weekly product
   - **Annual** package -> attach yearly product

### Step 5: Set API key

In `eas.json`, add the RevenueCat key as a **PLAINTEXT** environment variable:

```json
"production": {
  "env": {
    "APP_ENV": "production",
    "EXPO_PUBLIC_REVENUECAT_IOS_KEY": "appl_YourActualKey"
  }
}
```

**IMPORTANT**: Do NOT use EAS Secrets for `EXPO_PUBLIC_` variables. EAS Secrets are not available at JS bundle time -- they are only available as OS-level env vars during the build process. Since `EXPO_PUBLIC_` vars must be inlined into the JavaScript bundle by Metro, they must be set as plaintext in `eas.json` or `.env`.

For EAS Hosting (API routes), env vars must also be **PLAINTEXT** in the EAS environment settings, not secrets. Secrets are not injected into the deployed worker runtime.

### Step 6: Update config.ts

```typescript
PREMIUM_ENTITLEMENT_ID: "premium",
PRODUCT_IDS: {
  WEEKLY: "yourapp.ios.weekly",
  YEARLY: "yourapp.ios.yearly",
},
```

---

## 7. API Routes Deployment

The boilerplate uses Expo API routes (files ending in `+api.ts` inside `src/app/api/`) for server-side logic like OpenAI calls.

### Prerequisites

- `web.output` must be `"server"` in `app.json`
- Your API keys (e.g., `OPENAI_API_KEY`) must be set in the EAS environment

### Deploy to EAS Hosting

```bash
# Export the web build (generates server bundle)
npx expo export --platform web

# Deploy to EAS Hosting
eas deploy --prod --environment production
```

### Environment variables for the worker

Set env vars in the EAS dashboard under your project > Hosting > Environment variables. These must be **PLAINTEXT**, not secrets. The deployed worker cannot read EAS Secrets.

### Health check pattern

Add a health check route at `src/app/api/health+api.ts`:

```typescript
export function GET() {
  return Response.json({ status: "ok", timestamp: new Date().toISOString() });
}
```

After deploying, verify: `curl https://your-app.expo.app/api/health`

### Setting EXPO_PUBLIC_API_URL

Once deployed, set the hosting URL in your `.env` and `eas.json`:

```env
EXPO_PUBLIC_API_URL=https://your-app.expo.app
```

This tells the mobile app where to send API requests in production.

---

## 8. App Store Connect Subscription Setup via CLI

Use the `asc` CLI tool to create subscriptions programmatically.

### Create subscription group + weekly plan

```bash
asc subscriptions setup \
  --app APP_ID \
  --group-reference-name "App Premium" \
  --reference-name "Weekly" \
  --product-id "com.yourcompany.yourapp.ios.weekly" \
  --subscription-period ONE_WEEK \
  --locale "en-US" \
  --display-name "Weekly Plan" \
  --description "Unlimited Access To All Features" \
  --price "7.99" \
  --price-territory "USA" \
  --territories "USA"
```

### Add yearly plan to existing group

```bash
asc subscriptions setup \
  --app APP_ID \
  --group-id GROUP_ID \
  --reference-name "Yearly" \
  --product-id "com.yourcompany.yourapp.ios.yearly" \
  --subscription-period ONE_YEAR \
  --locale "en-US" \
  --display-name "Yearly Plan" \
  --description "Unlimited Access To All Features" \
  --price "49.99" \
  --price-territory "USA" \
  --territories "USA"
```

### Equalize prices across all territories

```bash
asc subscriptions pricing equalize \
  --subscription-id WEEKLY_SUB_ID \
  --base-price 7.99 \
  --confirm \
  --workers 16

asc subscriptions pricing equalize \
  --subscription-id YEARLY_SUB_ID \
  --base-price 49.99 \
  --confirm \
  --workers 16
```

This sets equivalent prices in every App Store territory based on the USD base price. The `--workers 16` flag parallelizes the API calls.

### Add free trial to yearly plan

In App Store Connect UI: Subscriptions > Your Group > Yearly > Subscription Prices > Introductory Offers > Free Trial > 1 Week.

---

## 9. App Store Connect Metadata

### Listing fields

| Field            | Limit      | Notes                                                 |
| ---------------- | ---------- | ----------------------------------------------------- |
| Title            | 30 chars   | `Brand: Primary Keyword & Secondary`                  |
| Subtitle         | 30 chars   | Action verbs that double as keywords                  |
| Keywords         | 100 chars  | Single words, comma-separated, NO spaces after commas |
| Description      | 4000 chars | Must include SUBSCRIPTION REQUIRED section            |
| Promotional Text | 170 chars  | Can be updated without a new build                    |
| What's New       | -          | "Initial release." for v1.0.0                         |

### Push metadata via CLI

```bash
asc localizations update \
  --app APP_ID \
  --version-id VERSION_ID \
  --locale "en-US" \
  --name "YourApp: Primary & Secondary" \
  --subtitle "Verb, Verb & Verb" \
  --keywords "keyword1,keyword2,keyword3,keyword4" \
  --description "$(cat description.txt)" \
  --promotional-text "Your 170-char promo text here."
```

### Description template

```
[App Name] gives you [primary value prop in one sentence].

[Expanded description of what the app does — 2-3 sentences].

Features include:
- [Feature 1]
- [Feature 2]
- [Feature 3]
- [Feature 4]
- [Feature 5]

[App Name] subscription unlocks all features including [list key features]. A weekly subscription is available at $7.99/week. An annual subscription is available at $49.99/year with a 7-day free trial. Payment will be charged to your Apple ID account at confirmation of purchase. The subscription automatically renews unless it is canceled at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period. You can manage and cancel your subscriptions by going to your App Store account settings after purchase.

[Disclaimer if applicable].

Terms of Use: https://yourdomain.com/apps/yourapp/terms
Privacy Policy: https://yourdomain.com/apps/yourapp/privacy
```

### What NOT to include in metadata

- **No ChatGPT, OpenAI, GPT, Claude, Anthropic, Gemini references** -- Apple rejects these in the China App Store. Use "AI" generically instead.
- No "free" or "trial" in title/subtitle (misleading if hard paywall)
- No competitor brand names

---

## 10. Build + Submit Checklist

### Pre-build

- [ ] All `app.json` fields set (Section 4)
- [ ] `.env` has production keys
- [ ] `eas.json` submit config has correct `ascAppId` and `appleTeamId`
- [ ] `ITSAppUsesNonExemptEncryption: false` in infoPlist
- [ ] API routes deployed to EAS Hosting
- [ ] `EXPO_PUBLIC_API_URL` set to production URL

### Build

```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

### Submit

```bash
# iOS -- submits to App Store Connect
eas submit --platform ios --profile production

# Android -- submits to Play Console internal track
eas submit --platform android --profile production
```

### Post-submit (App Store Connect)

- [ ] Upload screenshots (6.7" iPhone 15 Pro Max, 6.5" iPhone, 5.5" iPhone)
- [ ] Set app category
- [ ] Fill in age rating questionnaire
- [ ] Set price to Free (subscriptions handle monetization)
- [ ] **Attach IAPs to the version**: App Store > your app > In-App Purchases tab > select both subscriptions > "Submit for Review" for each
- [ ] Add subscription review screenshot (screenshot of the paywall with prices visible)
- [ ] Add review notes for Apple reviewer: "To test subscriptions, use the sandbox account: [email]. The app requires a subscription to access features."
- [ ] Submit for review

---

## 11. Common Rejection Fixes

### Rejection 1: IAP not submitted for review

**Problem**: You submitted the app binary but did not submit the in-app purchase products for review alongside it.

**Fix**: In App Store Connect, go to In-App Purchases, select each subscription, and click "Submit for Review". They must be submitted WITH the app version, not separately.

### Rejection 2: ChatGPT/OpenAI metadata in China

**Problem**: Apple's China App Store review team rejects apps that mention ChatGPT, OpenAI, GPT, or similar AI brand names in metadata (title, subtitle, keywords, description).

**Fix**: Remove all AI brand references. Use generic terms like "AI-powered" instead of "GPT-powered". Check your description, keywords, AND screenshot captions.

### Rejection 3: Same prices bug / pricing mismatch

**Problem**: Weekly and yearly subscriptions show the same price in some territories, or pricing was not equalized properly.

**Fix**: Run the `asc subscriptions pricing equalize` command for each subscription (see Section 8). Verify in App Store Connect that prices differ across all territories. If the CLI shows errors, manually check the pricing in the ASC web UI.

---

## 12. Play Store Prep

### Google Play service account key

1. Create a Google Cloud project
2. Enable the Google Play Android Developer API
3. Create a service account with Editor role
4. Download the JSON key file
5. Save as `google-play-key.json` in your project root (add to `.gitignore`)
6. In Play Console, go to Settings > API access > link the service account

### AAB builds

EAS automatically builds AAB (Android App Bundle) when `buildType: "app-bundle"` is set in `eas.json`. This is required by Play Store.

### Data safety form

Play Store requires a data safety declaration. For a typical app with RevenueCat + PostHog + Sentry:

- **Data collected**: Purchase history (RevenueCat), crash logs (Sentry), app interactions/analytics (PostHog)
- **Data shared**: None (all data is first-party)
- **Encryption**: Yes (HTTPS)
- **Data deletion**: Users can request via support email

### Feature graphic

Play Store requires a 1024x500 feature graphic. This appears at the top of your store listing. Create one matching your brand colors with your app icon and tagline.

### Store listing

- Title: 30 chars max
- Short description: 80 chars max
- Full description: 4000 chars max (can reuse iOS description, remove Apple-specific subscription text)
