# Branding & Customization Guide

This guide covers how to customize the AI App Boilerplate for your brand.

## Table of Contents

- [Quick Start - App Templates](#quick-start---app-templates)
- [Configuration Files Overview](#configuration-files-overview)
- [Quick Branding Checklist](#quick-branding-checklist)
- [Brand Configuration](#brand-configuration)
- [App Identity](#app-identity)
- [Colors & Theme](#colors--theme)
- [Typography](#typography)
- [Icons & Assets](#icons--assets)
- [Splash Screen](#splash-screen)
- [Onboarding Configuration](#onboarding-configuration)
- [Paywall Configuration](#paywall-configuration)
- [Content & Copy](#content--copy)
- [Feature Customization](#feature-customization)

## Quick Start - App Templates

The fastest way to configure your app is using **App Templates**. Run the setup script:

```bash
npm run setup
```

Choose from these pre-configured templates:

| Template             | Use Case                                | Features Enabled               |
| -------------------- | --------------------------------------- | ------------------------------ |
| **Image Generation** | AI art, avatar generators, design tools | Image Gen, Image ID            |
| **Video Generation** | AI video creation, animations           | Video Gen                      |
| **Visual Content**   | Full visual creation suite              | Image Gen, Video Gen, Image ID |
| **Audio Generation** | Voiceover, audiobook creators           | Text to Speech                 |
| **Transcription**    | Meeting transcribers, note-taking       | Transcription                  |
| **Full Audio**       | Podcast production, voice apps          | TTS, Transcription             |
| **Full Suite**       | All features enabled                    | Everything                     |
| **Custom**           | Choose individually                     | Your choice                    |

After running setup, your `constants/features.ts` will be configured with the appropriate template.

## Configuration Files Overview

| File                      | Purpose                                         |
| ------------------------- | ----------------------------------------------- |
| `constants/brand.ts`      | App identity, colors, gradients, feature colors |
| `constants/features.ts`   | Feature flags, app templates                    |
| `constants/onboarding.ts` | Onboarding slides configuration                 |
| `constants/paywall.ts`    | Premium screen benefits, free trial settings    |
| `constants/theme.ts`      | UI theme, spacing, typography                   |
| `locales/*.ts`            | Translations and copy                           |

## Quick Branding Checklist

Use this checklist when rebranding the app:

- [ ] Update app name in `app.json`
- [ ] Update bundle identifiers
- [ ] Replace app icon (`assets/icon.png`)
- [ ] Replace adaptive icon (`assets/adaptive-icon.png`)
- [ ] Replace splash screen (`assets/splash.png`)
- [ ] Update colors in `constants/theme.ts`
- [ ] Update translations in `locales/`
- [ ] Update onboarding content
- [ ] Update privacy policy and terms URLs

## Brand Configuration

The main brand configuration is in `constants/brand.ts`. This is the **central place** to customize your app's identity:

```typescript
// constants/brand.ts
export const BRAND = {
  // App Identity
  name: "AI Studio",
  tagline: "Create with AI",
  description: "Generate images, videos, and audio with AI",

  // Primary Colors
  colors: {
    primary: "#007AFF", // Main brand color
    primaryLight: "#4DA3FF", // Lighter variant
    primaryDark: "#0055CC", // Darker variant
    secondary: "#5856D6", // Secondary accent
    accent: "#FF9500", // Highlights, badges
    success: "#34C759", // Positive feedback
    error: "#FF3B30", // Errors, destructive
    warning: "#FF9500", // Warnings
  },

  // Gradient Presets
  gradients: {
    primary: ["#007AFF", "#5856D6"], // CTAs, headers
    premium: ["#FFD700", "#FF9500"], // Upgrade buttons
    success: ["#34C759", "#30D158"], // Completion states
    onboarding: ["#4facfe", "#00f2fe"], // Onboarding screens
  },

  // Feature-specific colors (home screen quick actions)
  featureColors: {
    imageGeneration: "#4CAF50",
    videoGeneration: "#E91E63",
    audioGeneration: "#9C27B0",
    transcription: "#FF5722",
    imageAnalysis: "#2196F3",
    chat: "#00BCD4",
  },

  // External links
  links: {
    website: "https://example.com",
    support: "https://example.com/support",
    privacy: "https://example.com/privacy",
    terms: "https://example.com/terms",
  },
};
```

## App Identity

### app.json

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "description": "Your app description",
    "version": "1.0.0",
    "scheme": "yourapp",
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp"
    },
    "android": {
      "package": "com.yourcompany.yourapp"
    }
  }
}
```

### Key Fields to Update

| Field              | Location           | Description             |
| ------------------ | ------------------ | ----------------------- |
| `name`             | app.json           | Display name on device  |
| `slug`             | app.json           | URL-friendly identifier |
| `scheme`           | app.json           | Deep link scheme        |
| `bundleIdentifier` | app.json (iOS)     | iOS app identifier      |
| `package`          | app.json (Android) | Android package name    |

## Colors & Theme

### Primary Colors

Edit `constants/theme.ts`:

```typescript
export const COLORS = {
  // Primary brand color
  primary: "#007AFF", // Change to your brand color
  primaryLight: "#4DA3FF",
  primaryDark: "#0055B3",

  // Secondary accent
  secondary: "#5856D6",
  secondaryLight: "#7A79E0",
  secondaryDark: "#3634A3",

  // Semantic colors
  success: "#34C759",
  warning: "#FF9500",
  error: "#FF3B30",
  info: "#5AC8FA",

  // Neutral colors
  background: "#FFFFFF",
  surface: "#F2F2F7",
  text: "#000000",
  textSecondary: "#666666",
  border: "#E5E5EA",

  // Dark mode variants
  dark: {
    background: "#000000",
    surface: "#1C1C1E",
    text: "#FFFFFF",
    textSecondary: "#999999",
    border: "#38383A",
  },
};
```

### Gradient Colors

```typescript
export const GRADIENTS = {
  primary: ["#007AFF", "#5856D6"],
  sunset: ["#FF6B6B", "#FFE66D"],
  ocean: ["#2193b0", "#6dd5ed"],
  purple: ["#8E2DE2", "#4A00E0"],
};
```

### Feature-Specific Colors

Each AI feature has an accent color in `constants/config.ts`:

```typescript
export const FEATURE_COLORS = {
  imageGeneration: "#007AFF", // Blue
  videoGeneration: "#E91E63", // Pink
  textToSpeech: "#FF9500", // Orange
  transcription: "#34C759", // Green
  imageIdentification: "#5856D6", // Purple
  aiChat: "#00C7BE", // Teal
};
```

## Typography / Font System

The boilerplate supports 6 premium font families out of the box. Change your app's font by updating `src/constants/brand.ts`:

| Font                | Style                  | Best For                     |
| ------------------- | ---------------------- | ---------------------------- |
| **Inter** (default) | Clean, modern, neutral | AI tools, utilities, SaaS    |
| **Poppins**         | Friendly, rounded      | Lifestyle, fun, social       |
| **Space Grotesk**   | Futuristic, technical  | Tech, AI, innovation         |
| **DM Sans**         | Elegant, sophisticated | Premium, luxury, fashion     |
| **Outfit**          | Modern, geometric      | Professional, business       |
| **Montserrat**      | Classic, impactful     | Outdoor, sports, bold brands |

To change:

1. Open `src/constants/brand.ts`
2. Change `font: "Inter"` to your chosen font
3. That's it — theme.ts and \_layout.tsx handle the rest

All 6 fonts are loaded at app startup. The active font is determined by `BRAND.font`.

### Font Weights Available

All fonts support these weights (accessed via `typography.fontFamily`):

- `regular` (400)
- `medium` (500)
- `semiBold` (600)
- `bold` (700)
- `extraBold` (800)
- `black` (900)

> **Note:** Space Grotesk only goes up to weight 700, so `extraBold` and `black` map to 700.

## Icons & Assets

### App Icon Requirements

| Platform         | Size        | File                       |
| ---------------- | ----------- | -------------------------- |
| iOS              | 1024x1024px | `assets/icon.png`          |
| Android Adaptive | 1024x1024px | `assets/adaptive-icon.png` |
| Favicon          | 48x48px     | `assets/favicon.png`       |

### Icon Design Guidelines

- Use a simple, recognizable design
- Ensure visibility at small sizes
- No transparency for iOS
- Include safe zone for Android adaptive icons

### Generate Icons Automatically

Use the asset generation script:

```bash
npm run generate:assets
```

Or use online tools:

- [App Icon Generator](https://appicon.co/)
- [Figma App Icon Template](https://www.figma.com/community/file/824894885635013369)

## Splash Screen

### Configuration

Edit `app.json`:

```json
{
  "expo": {
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#007AFF"
    }
  }
}
```

### Splash Screen Image

- **Size:** 1284x2778px (iPhone 13 Pro Max)
- **Format:** PNG
- **Background:** Match `backgroundColor` in config

### Animated Splash (Optional)

For animated splash screens, use `expo-splash-screen`:

```typescript
import * as SplashScreen from "expo-splash-screen";

// Keep splash visible while loading
SplashScreen.preventAutoHideAsync();

// Hide when ready
await SplashScreen.hideAsync();
```

## Onboarding Configuration

The onboarding flow is configured in `constants/onboarding.ts`. This file contains:

- Slides array (easy to add/remove/reorder)
- Global configuration options
- Helper functions

### Customize Slides

```typescript
// constants/onboarding.ts
export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: "welcome",
    icon: "zap", // Feather icon name
    iconColor: BRAND.colors.accent, // Optional, defaults to primary
    gradient: ["#4facfe", "#00f2fe"], // Background gradient
    titleKey: "onboarding.slide1.title", // i18n key
    descriptionKey: "onboarding.slide1.description",
  },
  {
    id: "create",
    icon: "image",
    iconColor: BRAND.featureColors.imageGeneration,
    gradient: ["#43e97b", "#38f9d7"],
    titleKey: "onboarding.slide2.title",
    descriptionKey: "onboarding.slide2.description",
  },
  // Add more slides...
];
```

### Onboarding Config Options

```typescript
export const ONBOARDING_CONFIG: OnboardingConfig = {
  showSkipButton: true, // Allow users to skip
  showProgressDots: true, // Show navigation dots
  showProgressBar: true, // Show progress bar at top
  autoAdvanceMs: 0, // Auto-advance (0 = disabled)
  animationDuration: 300, // Transition animation duration
  buttonStyle: "gradient", // "solid" | "outline" | "gradient"
  finalButtonKey: "onboarding.getStarted",
  nextButtonKey: "onboarding.next",
  skipButtonKey: "onboarding.skip",
};
```

### Skip or Modify Onboarding

In `constants/features.ts`:

```typescript
onboarding: {
  enabled: true,  // Set to false to skip
  premiumOnly: false,
  beta: false,
  comingSoon: false,
},
```

## Paywall Configuration

The premium/paywall screen is configured in `constants/paywall.ts`:

### Customize Benefits

```typescript
// constants/paywall.ts
export const PAYWALL_BENEFITS: PaywallBenefit[] = [
  {
    id: "unlimited",
    icon: "zap",
    iconColor: BRAND.colors.accent,
    titleKey: "premium.benefit.unlimited.title",
    descriptionKey: "premium.benefit.unlimited.description",
    highlighted: true, // Show highlight badge
  },
  {
    id: "quality",
    icon: "award",
    iconColor: BRAND.colors.primary,
    titleKey: "premium.benefit.quality.title",
    descriptionKey: "premium.benefit.quality.description",
  },
  // Add more benefits...
];
```

### Free Trial Configuration

The paywall automatically detects free trials from RevenueCat offerings:

```typescript
export const FREE_TRIAL_CONFIG: FreeTrialConfig = {
  enabled: true, // Enable free trial UI
  showTrialBadge: true, // Show "X Day Free Trial" badge
  badgeStyle: "pill", // "pill" | "banner" | "subtle"
  emphasizeTrial: true, // Green CTA for trial
  showUrgency: false, // Show urgency messaging
  trialButtonKey: "premium.startFreeTrial",
  subscribeButtonKey: "premium.subscribe",
};
```

### Paywall Display Options

```typescript
export const PAYWALL_CONFIG: PaywallConfig = {
  headerTitleKey: "premium.title",
  headerSubtitleKey: "premium.subtitle",
  showComparison: false, // Show free vs premium comparison
  showGuarantee: true, // Show money-back guarantee
  guaranteeKey: "premium.guarantee",
  showRestorePurchases: true,
  showLegalLinks: true, // Terms/Privacy links
  benefitAnimation: "slide", // "fade" | "slide" | "scale" | "none"
  benefitStaggerDelay: 100, // Animation stagger (ms)
  headerGradient: BRAND.gradients.premium,
  closeButtonPosition: "left", // "left" | "right"
};
```

## Content & Copy

### Translations

Update text in `locales/en.ts`:

```typescript
export default {
  common: {
    appName: "Your App Name",
    // ...
  },
  home: {
    greeting: "Hello, {{name}}!",
    whatToCreate: "What would you like to create?",
    // ...
  },
  // ...
};
```

### Adding Languages

1. Copy `locales/en.ts` to `locales/XX.ts`
2. Translate all strings
3. Add to `locales/index.ts`:

```typescript
import en from "./en";
import es from "./es";
import fr from "./fr";
import ja from "./ja"; // New language

export const translations = { en, es, fr, ja };
```

## Feature Customization

### Enable/Disable Features

Edit `constants/features.ts`:

```typescript
export const FEATURES = {
  // Disable video generation
  videoGeneration: {
    enabled: false,
    premiumOnly: false,
    beta: false,
    comingSoon: true, // Show "Coming Soon" placeholder
  },

  // Make image-to-image premium only
  imageToImage: {
    enabled: true,
    premiumOnly: true,
    beta: false,
    comingSoon: false,
  },
};
```

### Customize AI Models

Edit `components/ai/ModelPicker.tsx` to change available models:

```typescript
export const IMAGE_MODELS = [
  { id: "dall-e-3", name: "DALL-E 3", provider: "openai" },
  { id: "flux-schnell", name: "Flux (Fast)", provider: "replicate" },
  // Add or remove models
];
```

### Adjust Credit Costs

Edit `constants/generations.ts`:

```typescript
export const CREDIT_COSTS = {
  image: {
    "dall-e-3": 2,
    "dall-e-2": 1,
    "flux-schnell": 1,
    "flux-pro": 3,
  },
  video: {
    "runway-gen3": 10,
  },
  speech: {
    default: 1,
  },
};
```

## Premium/Subscription

### Configure Products

Edit RevenueCat products in `constants/config.ts`:

```typescript
export const SUBSCRIPTION_PRODUCTS = {
  ios: {
    monthly: "com.yourapp.premium.monthly",
    yearly: "com.yourapp.premium.yearly",
  },
  android: {
    monthly: "premium_monthly",
    yearly: "premium_yearly",
  },
};
```

### Premium Features List

Customize in `components/premium/PremiumFeatureList.tsx`:

```typescript
export const PREMIUM_FEATURES = [
  {
    icon: "infinity",
    title: "Unlimited Generations",
    description: "Create without limits",
  },
  {
    icon: "zap",
    title: "Priority Processing",
    description: "Faster generation times",
  },
  // Add your features
];
```

---

## Setup CLI Tool

The setup CLI (`npm run setup`) is the fastest way to configure your new app.

### Running Setup

```bash
npm run setup
```

### What Setup Configures

The setup script walks you through:

#### Step 1: Project Information

- **App name** - Display name shown to users (e.g., "My AI App")
- **App slug** - URL-friendly identifier (e.g., "my-ai-app")
- **Bundle identifier** - Unique app ID (e.g., "com.yourcompany.myaiapp")
- **Description** - One-line app description
- **Author** - Your name and email

#### Step 2: App Template Selection

Choose from pre-configured templates:

```
1. Image Generation App
   → AI art apps, avatar generators, design tools
   Features: Image Gen, Image ID

2. Video Generation App
   → AI video creation, animation tools
   Features: Video Gen

3. Visual Content App (Image + Video)
   → Full visual content creation
   Features: Image Gen, Video Gen, Image ID

4. Audio Generation App
   → Voiceover apps, audiobook creators, TTS
   Features: Audio Gen (Text to Speech)

5. Audio Transcription App
   → Meeting transcribers, note-taking apps
   Features: Transcription (Speech to Text)

6. Full Audio App
   → Podcast production, voice apps
   Features: Audio Gen, Transcription

7. Full Suite (All Features)
   → All AI features enabled

8. Custom
   → Choose features individually
```

#### What Gets Updated

| File                    | Changes                            |
| ----------------------- | ---------------------------------- |
| `app.json`              | App name, slug, bundle IDs, scheme |
| `package.json`          | Package name, description, author  |
| `constants/features.ts` | CURRENT_TEMPLATE, feature flags    |
| `.env`                  | Created from `.env.example`        |

### After Setup

1. **Review `.env`** - Add your API keys from `.env.example`
2. **Run `npm install`** - Install dependencies
3. **Start developing** - `npm start`

---

## Other Utility Scripts

### Asset Generation

Generate app icons and splash screens from source images:

```bash
npm run generate:assets
```

Place your source images in `assets/source/`:

- `icon-source.png` - Square icon (1024x1024 recommended)
- `splash-logo.png` - Logo for splash screen

### Development Seeding

Seed sample data for development:

```bash
npm run db:seed
npm run db:seed -- --clean  # Clean and reseed
```

The seed script is intended for local development workflows and can be adapted to your chosen backend.

Creates:

- Test user account
- Sample generations
- Initial credits

### Release Script

Bump version and create git tags:

```bash
npm run release patch   # 1.0.0 → 1.0.1
npm run release minor   # 1.0.0 → 1.1.0
npm run release major   # 1.0.0 → 2.0.0
npm run release 1.2.3   # Set specific version
```

---

## Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Convex (recommended full backend)
EXPO_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Expo API Routes mode only
EXPO_PUBLIC_API_URL=https://your-api-origin

# Analytics
EXPO_PUBLIC_POSTHOG_API_KEY=phc_your_key
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Error Tracking
EXPO_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project

# Purchases
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_your_ios_key
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_your_android_key
```

AI service keys should stay server-side:

```bash
# Convex mode
# Add OPENAI_API_KEY / REPLICATE_API_TOKEN / ELEVENLABS_API_KEY
# in the Convex dashboard environment variables

# Expo API Routes mode
# Add the same keys in your deployment environment
```

---

## Project Structure

```
├── src/
│   ├── app/               # Expo Router screens and API routes
│   ├── components/        # Reusable components
│   ├── constants/         # Configuration
│   ├── hooks/             # Custom hooks
│   ├── locales/           # Translations
│   ├── providers/         # Root providers
│   ├── services/          # API services
│   ├── store/             # Zustand stores
│   └── utils/             # Utility functions
├── convex/                # Convex backend (when using Convex mode)
├── scripts/               # CLI utilities
└── __tests__/             # Jest tests
```

---

For more detailed customization, see:

- [Expo Configuration](https://docs.expo.dev/versions/latest/config/app/)
- [React Navigation Theming](https://reactnavigation.org/docs/themes)
- [RevenueCat Setup](https://www.revenuecat.com/docs/getting-started)
- [Convex Documentation](https://docs.convex.dev/)
