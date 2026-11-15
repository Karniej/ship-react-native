# Architecture Overview

This document describes the current Ship React Native architecture.

## Source Of Truth

The boilerplate currently supports two backend modes:

- `Convex` - recommended and the most complete mode
- `Expo API Routes` - lighter mode for server-side AI endpoints

Older Supabase-based docs are historical and should not be treated as the current architecture.

## System Layout

```text
Mobile App (Expo / React Native)
  ├─ src/app/               routes and screens
  ├─ src/components/        reusable UI and feature components
  ├─ src/hooks/             app hooks and backend-specific hooks
  ├─ src/store/             Zustand state
  ├─ src/services/          AI, purchases, auth, notifications
  └─ src/constants/         branding, features, backend mode

Backend Mode A: Convex
  ├─ convex/auth.ts
  ├─ convex/schema.ts
  ├─ convex/profiles.ts
  ├─ convex/credits.ts
  ├─ convex/generations.ts
  ├─ convex/subscriptions.ts
  └─ convex/ai/*

Backend Mode B: Expo API Routes
  └─ src/app/api/*
```

## App Structure

```text
src/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── onboarding.tsx
│   ├── login.tsx
│   ├── api/
│   └── (app)/
│       ├── _layout.tsx
│       ├── (tabs)/
│       ├── generate.tsx
│       ├── video-generation.tsx
│       ├── speech.tsx
│       ├── transcription.tsx
│       ├── image-identify.tsx
│       ├── chat.tsx
│       ├── generations.tsx
│       ├── analytics.tsx
│       └── premium.tsx
├── components/
├── constants/
├── hooks/
├── providers/
├── services/
├── store/
├── types/
└── utils/
```

## Backend Selection

Backend mode is configured in `src/constants/api.ts`.

```ts
export type ApiMode = "convex" | "expo-api-routes";
export const API_MODE: ApiMode = "convex";
```

The setup script updates the project configuration, but this file is the runtime switch used throughout the codebase.

## Convex Mode

Convex mode is the most complete path and is what the repo is optimized for today.

It provides:

- auth via `@convex-dev/auth`
- persisted profiles
- credits and rate limits
- generation history
- subscription state storage
- server-side AI actions

Core files:

- `src/providers/ConvexClientProvider.tsx`
- `src/hooks/useConvexAuth.ts`
- `src/hooks/useConvexAI.ts`
- `convex/schema.ts`
- `convex/ai/*.ts`

## Expo API Routes Mode

Expo API Routes mode is a lighter alternative for shipping server-side AI endpoints without the full Convex data layer.

It currently provides:

- server-side API routes for AI features
- simpler deployment path for AI proxying
- a viable mode for apps that do not need the full data backend

Current limitation:

- this mode does not have parity with Convex for auth, persistence, and full product infrastructure

## Feature Configuration

Feature configuration lives in `src/constants/features.ts`.

Important concepts:

- `CURRENT_TEMPLATE` controls the active template
- `APP_TEMPLATES` define grouped feature presets
- `FEATURES` defines final feature flags used in the app

This is one of the most platform-relevant parts of the codebase because it already separates product capabilities from the screen implementation.

## Branding And Product Config

- Branding: `src/constants/brand.ts`
- App config: `src/constants/config.ts`
- Theme tokens: `src/constants/theme.ts`
- Onboarding content: `src/constants/onboarding.ts` and `src/constants/onboardingData.ts`
- Paywall content: `src/constants/paywall.ts`

## State Management

The app uses Zustand for client state.

Key stores:

- `useAuthStore`
- `useAIStore`
- `usePremiumStore`
- `useGeneralStore`
- `useSettingsStore`
- `useOfflineStore`
- `useNotificationStore`

## Current Product Defaults

The current app shell is opinionated:

- premium flow is central to the UX
- routes already exist for the core AI feature set
- the home screen renders enabled features from the feature config

This makes the boilerplate strong for shipping apps quickly, but it also means a future platform should be built by composing and pruning known modules rather than generating arbitrary app structure from scratch.
