# Ship React Native

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![CI](https://github.com/Karniej/ship-react-native/actions/workflows/ci.yml/badge.svg)](https://github.com/Karniej/ship-react-native/actions/workflows/ci.yml)

A free, open-source Expo + React Native starter for subscription and AI apps. It
ships with auth, a hard paywall, AI server routes, analytics, error tracking, and
five locales, and it comes with an agent workflow that takes an app idea to a
store-ready build.

Built on Expo SDK 57, React Native 0.86, and TypeScript. Extracted from apps that
are live on the App Store (Fishify, ReWordly).

- **Website and docs:** [shipreactnative.com](https://shipreactnative.com)
- **Licence:** [MIT](LICENSE) — use it for unlimited personal and commercial apps
- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md) · **Security:** [SECURITY.md](SECURITY.md)

## Quick Start

Requires Node.js 22 (see `.nvmrc`), npm, and an iOS Simulator (macOS) or Android
Emulator.

```bash
git clone https://github.com/Karniej/ship-react-native.git my-app
cd my-app
npm install
cp .env.example .env
npm run setup      # interactive: app identity, backend mode, features
npm run doctor     # checks identity, environment, backend, placeholders
npm run ios        # or: npm run android
```

To start your own project history, delete `.git` and run `git init`, or use
GitHub's **Use this template** button.

Then read, in order:

1. [START_HERE.md](START_HERE.md) -- first run, step by step
2. [Setup Guide](docs/SETUP_GUIDE.md) -- from clone to App Store (env vars, EAS, hard paywall, RevenueCat, ASC subscriptions, build + submit)
3. [ASO Template](docs/ASO_TEMPLATE.md) -- fill-in-the-blank App Store optimization (title, subtitle, keywords, description, screenshots)
4. [Landing Page Template](docs/LANDING_PAGE_TEMPLATE.md) -- app landing page structure, SEO meta tags, privacy/terms templates

## What you get

### App foundation

- **Authentication** - Email/password, magic links, anonymous auth, OAuth (Google/Apple) through Convex Auth
- **Hard paywall** - RevenueCat subscriptions for iOS and Android; non-subscribers land on `/premium`
- **Onboarding** - Multi-step flow with a cycling video template that leads into the paywall
- **Two backend modes** - Convex (auth, persistence, credits, reactive data) or Expo API Routes on EAS Hosting
- **Dark mode and theming** - Theme tokens through `useAppTheme()`
- **Internationalization** - EN, ES, FR, DE, IT
- **Analytics and error tracking** - PostHog and Sentry

### AI features

- **Image generation** - OpenAI and Replicate (Flux, SDXL)
- **Video generation** - Runway, Pika, Stable Video
- **Text-to-speech** - ElevenLabs
- **Speech-to-text** - OpenAI Whisper
- **Image analysis and chat** - OpenAI vision and chat models
- **Gallery** - Browse, filter, and manage generated content
- **Server-side keys** - AI provider keys stay in Convex or the API route deployment, never in the app bundle

### ShipReactNative System (agent workflow)

A supervised pipeline for coding agents such as Claude Code:

`Idea → Validate → Spec → Design → Setup → Build → Verify → Device-proof → Store-prep`

- The skills live in `.agents/skills/`; start with `ship-system`. [AGENTS.md](AGENTS.md) is the index.
- `ship.config.ts` is the single configuration source. `npm run apply` applies it deterministically.
- Three human gates: idea approval, design review, and store submission. The agent stops at each one.
- The Design stage uses Anthropic's Claude Design MCP, configured in `.mcp.json`. Authenticate with
  `/design-login` and sync with `/design-sync`. See [`docs/CLAUDE_DESIGN.md`](docs/CLAUDE_DESIGN.md).
- `opportunity-data/100appideas/` holds 76 ranked app idea specs as a seed for validation.
- The configuration engine is vendored at `packages/system`, so one clone is enough.
  See [`packages/system/UPSTREAM.md`](packages/system/UPSTREAM.md).

You do not need the agent workflow to use the template. It works as a plain Expo project.

### Developer experience

- **TypeScript** throughout, **Expo Router** file-based routing, **Zustand** stores with AsyncStorage persistence
- `npm run validate` runs lint, type-check, contract tests, and the Jest suite
- CI workflows for lint/test, a six-config apply matrix, and EAS builds
- Development mode with unlimited AI generations

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [Backend Setup](#backend-setup)
- [Authentication](#authentication)
- [AI Generation System](#ai-generation-system)
- [Premium & Subscriptions](#premium--subscriptions)
- [Internationalization (i18n)](#internationalization-i18n)
- [Analytics](#analytics)
- [Customization Guide](#customization-guide)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Category   | Technology                              |
| ---------- | --------------------------------------- |
| Framework  | Expo SDK 57 + React Native 0.86         |
| Navigation | Expo Router (file-based)                |
| State      | Zustand 5 with AsyncStorage persistence |
| Backend    | Convex (recommended) or Expo API Routes |
| Payments   | RevenueCat                              |
| Analytics  | PostHog, Sentry                         |
| AI         | OpenAI, Replicate, ElevenLabs           |
| Language   | TypeScript 6                            |

---

## First Run

### First Run Checklist

- [ ] Run `npm run setup` to configure your app
- [ ] Choose backend mode (Convex or Expo API Routes)
- [ ] Configure `app.json` with your app details
- [ ] (Optional) Configure PostHog for analytics
- [ ] (Optional) Set up RevenueCat for subscriptions
- [ ] (Optional) Add AI API keys

### Configure app.json

Before building or publishing, update these values in `app.json`:

| Setting                | Current Value                        | Change To                                            |
| ---------------------- | ------------------------------------ | ---------------------------------------------------- |
| `name`                 | "ShipReactNative"                    | Your app name                                        |
| `slug`                 | "ship-react-native"                  | Your app slug (lowercase, no spaces)                 |
| `scheme`               | "myapp"                              | Your deep link scheme (e.g., "yourapp")              |
| `ios.bundleIdentifier` | "com.company.boilerplate"            | Your iOS bundle ID (e.g., "com.yourcompany.yourapp") |
| `android.package`      | "com.company.boilerplate"            | Your Android package name                            |
| `updates.url`          | "https://u.expo.dev/your-project-id" | Your EAS project URL                                 |
| `extra.eas.projectId`  | "your-project-id"                    | Your EAS project ID                                  |

**To get your EAS project ID:**

```bash
 eas init  # This will create a project and show your ID
```

---

## Project Structure

```
ship-react-native/
├── src/
│   ├── app/                          # Expo Router pages
│   │   ├── _layout.tsx              # Root layout with providers
│   │   ├── index.tsx                # Entry point (routing logic)
│   │   ├── onboarding.tsx           # Onboarding flow
│   │   ├── privacy.tsx              # Privacy policy
│   │   ├── terms.tsx                # Terms of service
│   │   ├── api/                     # Expo API Routes (when using Expo API mode)
│   │   │   ├── generate-image+api.ts
│   │   │   ├── text-to-speech+api.ts
│   │   │   └── ...
│   │   └── (app)/                   # Authenticated app routes
│   │       ├── _layout.tsx          # App layout
│   │       ├── (tabs)/              # Tab navigation
│   │       │   ├── _layout.tsx      # Tab bar configuration
│   │       │   ├── index.tsx        # Home tab
│   │       │   ├── gallery.tsx      # Gallery tab
│   │       │   ├── profile.tsx      # Profile tab
│   │       │   └── settings.tsx     # Settings tab
│   │       ├── generate.tsx         # Image generation
│   │       ├── video-generation.tsx # Video generation
│   │       ├── speech.tsx           # Text-to-speech
│   │       ├── transcription.tsx    # Speech-to-text
│   │       ├── image-identify.tsx   # Image analysis
│   │       ├── chat.tsx             # AI chat
│   │       ├── analytics.tsx        # Usage analytics
│   │       ├── generations.tsx      # Gallery of generations
│   │       └── premium.tsx          # Premium upgrade screen
│   │
│   ├── components/                   # Reusable components
│   │   ├── ai/                      # AI-related components
│   │   ├── gallery/                 # Gallery components
│   │   ├── premium/                 # Premium components
│   │   ├── ui/                      # UI primitives
│   │   └── ...
│   │
│   ├── constants/                    # App configuration
│   │   ├── api.ts                   # API mode configuration
│   │   ├── config.ts                # App-wide settings
│   │   ├── generations.ts           # AI credits & model config
│   │   ├── prompts.ts               # AI prompt templates
│   │   └── theme.ts                 # Colors and styling
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useConvexAuth.ts         # Convex auth hooks
│   │   ├── useConvexAI.ts           # Convex AI hooks
│   │   ├── useI18n.ts               # Internationalization
│   │   ├── usePremiumFeatures.ts    # Premium feature gates
│   │   └── ...
│   │
│   ├── locales/                      # Translations
│   │   ├── index.ts                 # i18n setup
│   │   ├── en.ts, es.ts, fr.ts...   # Language files
│   │
│   ├── services/                     # External service integrations
│   │   ├── ai/                      # AI service clients
│   │   │   ├── index.ts             # Barrel export
│   │   │   ├── openai.service.ts    # OpenAI (DALL-E, GPT-4V, Whisper)
│   │   │   ├── replicate.service.ts # Replicate (Flux, SDXL)
│   │   │   ├── elevenlabs.service.ts# ElevenLabs TTS
│   │   │   └── ...
│   │   ├── PostHogService.ts        # Analytics events
│   │   └── purchases.service.ts     # RevenueCat wrapper
│   │
│   ├── store/                        # Zustand state stores
│   │   ├── useAIStore.ts            # AI generation state
│   │   ├── useAuthStore.ts          # Authentication state
│   │   ├── usePremiumStore.ts       # Subscription state
│   │   └── ...
│   │
│   ├── types/                        # TypeScript types
│   │   ├── generation.types.ts      # Generation types
│   │   └── ...
│   │
│   └── utils/                        # Utility functions
│       ├── fileDownload.ts          # File download & sharing
│       ├── haptics.ts               # Haptic feedback
│       └── storage.ts               # AsyncStorage wrapper
│
├── convex/                           # Convex backend (when using Convex mode)
│   ├── schema.ts                    # Database schema
│   ├── auth.ts                      # Auth configuration
│   ├── profiles.ts                  # Profile queries/mutations
│   ├── credits.ts                   # Credit management
│   ├── generations.ts               # Generation tracking
│   └── ai/                          # AI actions
│       ├── chat.ts
│       ├── imageGeneration.ts
│       ├── replicate.ts
│       ├── textToSpeech.ts
│       ├── transcription.ts
│       ├── video.ts
│       └── vision.ts
│
├── assets/                           # Static assets (icons, images)
├── scripts/                          # Setup and utility scripts
│   └── setup.js                     # Interactive setup wizard
├── .env.example                      # Environment template
├── app.json                          # Expo configuration
├── package.json                      # Dependencies
└── tsconfig.json                     # TypeScript config
```

---

## Environment Setup

### 1. Create `.env` File

```bash
cp .env.example .env
```

Or run the setup wizard:

```bash
npm run setup
```

### 2. Environment Variables

```env
# ===========================================
# BACKEND MODE - Choose one
# ===========================================
# "convex" - Full backend with auth, real-time, database
# "expo-api-routes" - Simple server-side proxy, RevenueCat for premium

# ===========================================
# CONVEX (if using Convex mode)
# ===========================================
EXPO_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# ===========================================
# OPTIONAL - Analytics & Monitoring
# ===========================================
EXPO_PUBLIC_POSTHOG_API_KEY=your_posthog_api_key
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn

# ===========================================
# OPTIONAL - In-App Purchases (RevenueCat)
# ===========================================
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_ios_key
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_android_key

# ===========================================
# OPTIONAL - Feature Flags
# ===========================================
EXPO_PUBLIC_ENABLE_ANALYTICS=true
EXPO_PUBLIC_ENABLE_ERROR_REPORTING=true
```

### 3. AI API Keys

**For Convex mode:** Add these in your Convex dashboard (Settings > Environment Variables):

- `OPENAI_API_KEY`
- `REPLICATE_API_TOKEN`
- `ELEVENLABS_API_KEY`

**For Expo API Routes mode:** Add these to your deployment platform (Vercel, etc.):

- `OPENAI_API_KEY`
- `REPLICATE_API_TOKEN`
- `ELEVENLABS_API_KEY`

---

## Backend Setup

This boilerplate supports two backend modes:

### Option 1: Convex (Recommended)

Full-featured backend with authentication, real-time database, and serverless functions.

**Features:**

- Built-in authentication (email, OAuth, anonymous)
- Real-time reactive queries
- Automatic type generation
- Serverless functions for AI

**Setup:**

```bash
# 1. Install Convex CLI
npm install -g convex

# 2. Initialize Convex project
npx convex init

# 3. Start Convex dev server (in separate terminal)
npx convex dev

# 4. Add environment variables to Convex dashboard:
#    - OPENAI_API_KEY
#    - REPLICATE_API_TOKEN
#    - ELEVENLABS_API_KEY

# 5. Start app
npm start
```

### Option 2: Expo API Routes

Simple server-side proxy for AI calls. No database or authentication (use RevenueCat for premium gating).

**Features:**

- Simple setup - just add API keys
- Stateless API proxy
- Works with any deployment platform

**Setup:**

```bash
# 1. Update src/constants/api.ts
export const API_MODE: ApiMode = "expo-api-routes";

# 2. Add API keys to .env (for local dev) or your deployment platform

# 3. Start app
npm start
```

### Database Schema (Convex)

When using Convex mode, the following tables are available:

| Table         | Purpose                                                         |
| ------------- | --------------------------------------------------------------- |
| `profiles`    | User profiles - name, avatar, premium status                    |
| `userCredits` | AI generation credits per user - remaining, used total          |
| `generations` | History of all AI generations - provider, model, prompt, output |
| `pushTokens`  | Push notification tokens                                        |

---

## Authentication

### How Authentication Flow Works

```
1. App opens → app/index.tsx checks auth state
2. Not authenticated → Redirect to onboarding
3. Onboarding complete → Show premium screen (skippable)
4. Premium seen → Redirect to main app tabs
```

### Using Authentication (Convex Mode)

```typescript
import { useConvexAuthState, useConvexAuthActions } from "@/hooks/useConvexAuth";

function LoginScreen() {
  const { isLoading, isAuthenticated, user } = useConvexAuthState();
  const { signInWithEmail, signUpWithEmail, signOut } = useConvexAuthActions();

  // Sign Up
  const handleSignUp = async () => {
    const { error } = await signUpWithEmail(email, password, name);
    if (error) {
      Alert.alert("Error", error.message);
    }
  };

  // Sign In
  const handleSignIn = async () => {
    const { error } = await signInWithEmail(email, password);
    if (error) {
      Alert.alert("Error", error.message);
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    await signOut();
  };
}
```

### Auth Methods Available

- **Email/Password** - Traditional email and password authentication
- **Magic Link** - Passwordless email authentication
- **Anonymous** - Sign in without credentials (can link account later)
- **OAuth** - Google and Apple sign-in (requires additional setup)

---

## AI Generation System

### Overview

The AI system provides 5 generation types:

| Type          | Description                     | Provider                 |
| ------------- | ------------------------------- | ------------------------ |
| Image         | Create images from text prompts | OpenAI DALL-E, Replicate |
| Video         | Generate videos from prompts    | Runway, Pika, Stability  |
| Speech        | Convert text to natural speech  | ElevenLabs               |
| Transcription | Convert audio to text           | OpenAI Whisper           |
| Vision        | Analyze and identify images     | GPT-4 Vision             |

### Development Mode (Unlimited Generations)

**In development, credit checks are automatically bypassed!**

When running `npm start` (or `npx expo start`), the `__DEV__` flag is `true`, which means:

- All credit checks are bypassed
- Users have unlimited generations
- All models are available
- Generation attempts are logged to console

```typescript
// constants/generations.ts
export const DEV_MODE = {
  enabled: __DEV__ || process.env.EXPO_PUBLIC_DEV_MODE === "true",
  showDevBanner: true,
  logGenerations: true,
};
```

### Credit System Configuration

```typescript
// constants/generations.ts

// Cost per generation type and model
export const CREDIT_COSTS = {
  image: {
    "dall-e-3": 2, // Premium model - costs more
    "dall-e-2": 1,
    "flux-schnell": 1,
    sdxl: 2,
    default: 1,
  },
  video: {
    "runway-gen3": 5, // Video is expensive
    pika: 4,
    "stable-video": 3,
    default: 4,
  },
  speech: { elevenlabs: 1, default: 1 },
  transcription: { "whisper-1": 1, "whisper-large-v3": 2, default: 1 },
  vision: { "gpt-4-vision": 2, "gpt-4o": 1, default: 1 },
};

// Free tier configuration
export const FREE_TIER = {
  initialCredits: 10, // New user starting credits
  dailyRefill: 0, // Daily credit refresh (0 = disabled)
  maxCredits: 50, // Maximum accumulated credits
  showUpgradePrompts: true, // Show "upgrade" when low
  lowCreditsThreshold: 3, // "Low credits" warning level
};
```

### Using AI (Convex Mode)

```typescript
import { useGenerateImage, useTextToSpeech, useCredits } from "@/hooks/useConvexAI";

function GenerateScreen() {
  const generateImage = useGenerateImage();
  const textToSpeech = useTextToSpeech();
  const credits = useCredits();

  // Generate an image
  const handleGenerateImage = async () => {
    const result = await generateImage({
      prompt: "A beautiful sunset over mountains",
      model: "dall-e-3",
    });
    if (result.success) {
      console.log("Image URL:", result.url);
    }
  };

  // Generate speech
  const handleGenerateSpeech = async () => {
    const result = await textToSpeech({
      text: "Hello, welcome to our app!",
      voice: "rachel",
    });
    if (result.success) {
      console.log("Audio URL:", result.audioUrl);
    }
  };
}
```

### Customizing AI Prompts

All prompts are centralized in `src/constants/prompts.ts`:

```typescript
export const IMAGE_PROMPTS = {
  placeholder: "Describe the image you want to create...",
  examples: [
    {
      title: "Landscape",
      prompt: "A serene mountain landscape at golden hour...",
    },
    {
      title: "Portrait",
      prompt: "A professional headshot with soft lighting...",
    },
  ],
  styleModifiers: [
    { label: "Photorealistic", value: ", photorealistic, 8k, detailed" },
    { label: "Artistic", value: ", artistic, painterly style" },
    { label: "Minimal", value: ", minimalist, clean design" },
  ],
};
```

---

## Premium & Subscriptions

### RevenueCat Setup

1. Create account at [revenuecat.com](https://revenuecat.com)
2. Set up your app in RevenueCat dashboard
3. Configure products in App Store Connect / Google Play Console
4. Add API keys to `.env`:

```env
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_...
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_...
```

### Using Premium Features

```typescript
import { usePremiumStore } from "@/store/usePremiumStore";
import { usePremiumFeatures } from "@/hooks/usePremiumFeatures";

function MyComponent() {
  const { isSubscribed } = usePremiumStore();
  const { requirePremium } = usePremiumFeatures();

  // Simple check
  if (!isSubscribed) {
    return <UpgradePrompt />;
  }

  // Feature-gated action
  const handlePremiumAction = () => {
    if (requirePremium("unlimited_generations")) {
      // User is premium, proceed
      doSomething();
    }
    // Hook automatically shows upgrade prompt if not premium
  };
}
```

### Premium Configuration

```typescript
// constants/config.ts
export const APP_CONFIG = {
  PREMIUM_ENTITLEMENT_ID: "premium",
  SUBSCRIPTION_TYPES: {
    MONTHLY: "monthly",
    YEARLY: "yearly",
  },
  PREMIUM_FEATURES: [
    "Unlimited AI generations",
    "Ad-free experience",
    "Priority support",
    "Early access to features",
  ],
};
```

---

## Internationalization (i18n)

### Supported Languages

- English (en) - Default
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)

### Using Translations

```typescript
import { useI18n } from "@/hooks/useI18n";

function MyComponent() {
  const { t, locale, setLocale } = useI18n();

  return (
    <View>
      {/* Simple translation */}
      <Text>{t("common.welcome")}</Text>

      {/* With interpolation */}
      <Text>{t("home.greeting", { name: "John" })}</Text>

      {/* Change language */}
      <Button title="Español" onPress={() => setLocale("es")} />
    </View>
  );
}
```

### Adding Translations

1. Add keys to `src/locales/en.ts` (source of truth)
2. Add translations to other locale files (`es.ts`, `fr.ts`, `de.ts`)

```typescript
// locales/en.ts
export default {
  common: {
    welcome: "Welcome",
    save: "Save",
    cancel: "Cancel",
  },
  home: {
    greeting: "Hello, {{name}}!",
    title: "Home",
  },
};

// locales/es.ts
export default {
  common: {
    welcome: "Bienvenido",
    save: "Guardar",
    cancel: "Cancelar",
  },
  home: {
    greeting: "¡Hola, {{name}}!",
    title: "Inicio",
  },
};
```

---

## Analytics

### PostHog Integration

```typescript
import { useAnalytics } from "@/hooks/useAnalytics";

function MyComponent() {
  const { trackEvent, trackScreen } = useAnalytics();

  useEffect(() => {
    trackScreen("generate");
  }, []);

  const handleAction = () => {
    trackEvent("button_pressed", { button: "generate" });
  };
}
```

### Pre-built Analytics Events

```typescript
import { PostHogAnalytics } from "@/services/PostHogService";

// Screen views
PostHogAnalytics.trackScreenViewed(posthog, "generate");

// Generation events
PostHogAnalytics.trackGenerationStarted(posthog, "image", "openai", "dall-e-3");
PostHogAnalytics.trackGenerationCompleted(posthog, "image", "openai", "dall-e-3", 1);
PostHogAnalytics.trackGenerationFailed(posthog, "image", "openai", "API error");

// Premium events
PostHogAnalytics.trackPurchaseStarted(posthog, "monthly");
PostHogAnalytics.trackPurchaseCompleted(posthog, "monthly", 9.99);
```

---

## Customization Guide

### 1. App Branding

**App Name & Icons:**

```json
// app.json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png"
    }
  }
}
```

**Colors:**

```typescript
// src/constants/theme.ts
export const colors = {
  primary: "#007AFF", // Your brand color
  secondary: "#5856D6",
  success: "#34C759",
  error: "#FF3B30",
  // ...
};
```

### 2. Onboarding Flow

```typescript
// src/constants/onboardingData.ts
export const onboardingSlides: OnboardingSlide[] = [
  {
    id: "welcome",
    title: "Welcome to YourApp",
    subtitle: "Get started in seconds",
    type: "welcome",
  },
  {
    id: "name",
    title: "What's your name?",
    type: "input",
    validation: (data) => data.name?.trim().length > 0,
  },
  // Add/remove/modify slides as needed
];
```

### 3. Tab Navigation

```typescript
// src/app/(app)/(tabs)/_layout.tsx
<Tabs>
  <Tabs.Screen
    name="index"
    options={{
      title: "Home",
      tabBarIcon: ({ color }) => <Feather name="home" color={color} />,
    }}
  />
  {/* Add or modify tabs */}
</Tabs>
```

### 4. AI Models

```typescript
// src/constants/generations.ts
export const MODELS = {
  image: [
    {
      id: "your-custom-model",
      name: "Custom Model",
      provider: "replicate",
      description: "Your custom description",
      premium: false,
      enabled: true,
    },
    // ...existing models
  ],
};
```

### 5. App Configuration

```typescript
// src/constants/config.ts
export const APP_CONFIG = {
  APP_NAME: "YourApp",
  VERSION: "1.0.0",
  SUPPORT_EMAIL: "support@yourapp.com",
  PRIVACY_POLICY_URL: "https://yourapp.com/privacy",
  TERMS_URL: "https://yourapp.com/terms",
  // ...
};
```

---

## Deployment

### Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS (first time only)
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Build for both
eas build --platform all --profile production
```

### Pre-deployment Checklist

- [ ] Remove `EXPO_PUBLIC_DEV_MODE` from production `.env`
- [ ] Verify all API keys are production keys
- [ ] Test authentication flow end-to-end
- [ ] Test in-app purchases with sandbox accounts
- [ ] Verify analytics are tracking correctly
- [ ] Test offline functionality
- [ ] Review App Store / Play Store guidelines
- [ ] Prepare screenshots and metadata

### Deploying Backend

**For Convex:**

```bash
npx convex deploy
```

**For Expo API Routes:**
Deploy to your hosting platform (Vercel, etc.) with your API keys as environment variables.

---

## Troubleshooting

### Common Issues

**1. "Module not found" errors**

```bash
rm -rf node_modules
npm install
npx expo start -c  # Clear cache
```

**2. iOS build fails with CocoaPods error**

```bash
cd ios
pod install --repo-update
cd ..
```

**3. Environment variables not loading**

- Ensure file is named `.env` (not `.env.local`)
- Restart Metro bundler after any changes
- Variables must start with `EXPO_PUBLIC_`

**4. Convex connection fails**

- Verify `EXPO_PUBLIC_CONVEX_URL` is correct in `.env`
- Ensure Convex dev server is running: `npx convex dev`
- Check Convex dashboard for errors

**5. AI generation returns errors**

- Check Convex function logs in dashboard
- Verify API keys are set in Convex environment variables
- Check rate limits on AI provider dashboards

**6. TypeScript errors**

```bash
npm run type-check  # See all errors
```

### Debug Mode

```typescript
// Enable verbose logging anywhere
if (__DEV__) {
  console.log("Auth:", useAuthStore.getState());
  console.log("Premium:", usePremiumStore.getState());
  console.log("AI:", useAIStore.getState());
}
```

### Useful Commands

```bash
npm start           # Start dev server
npm run ios         # Run on iOS
npm run android     # Run on Android
npm run type-check  # TypeScript check
npm run lint        # ESLint check
npm test            # Run tests
npm run setup       # Interactive setup wizard
```

---

## Scripts Reference

| Command              | Description                   |
| -------------------- | ----------------------------- |
| `npm start`          | Start Expo development server |
| `npm run ios`        | Run on iOS simulator          |
| `npm run android`    | Run on Android emulator       |
| `npm run web`        | Run in web browser            |
| `npm run type-check` | Run TypeScript compiler       |
| `npm run lint`       | Run ESLint                    |
| `npm test`           | Run Jest tests                |
| `npm run setup`      | Interactive setup wizard      |

---

## Documentation

| Document                                                   | Description                             |
| ---------------------------------------------------------- | --------------------------------------- |
| [docs/FEATURES.md](docs/FEATURES.md)                       | Complete feature list and configuration |
| [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md)             | Branding and theming guide              |
| [docs/COMPONENTS.md](docs/COMPONENTS.md)                   | UI component library documentation      |
| [docs/CONVEX_SETUP.md](docs/CONVEX_SETUP.md)               | Convex backend setup guide              |
| [docs/EAS_DEPLOYMENT.md](docs/EAS_DEPLOYMENT.md)           | Build and submit guide                  |
| [docs/APP_STORE_CHECKLIST.md](docs/APP_STORE_CHECKLIST.md) | Pre-launch checklist                    |
| [docs/SECURITY.md](docs/SECURITY.md)                       | Security best practices                 |
| [docs/TESTING.md](docs/TESTING.md)                         | Testing strategy and examples           |
| [docs/DEBUGGING.md](docs/DEBUGGING.md)                     | Debugging tools and tips                |

---

## Getting Help

- [Expo Documentation](https://docs.expo.dev/)
- [Convex Documentation](https://docs.convex.dev/)
- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [PostHog Documentation](https://posthog.com/docs)

---

## License

[MIT](LICENSE). Use this boilerplate for any personal or commercial project.
Third-party material is listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

---

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

Built with Expo, React Native, Convex, and love.
