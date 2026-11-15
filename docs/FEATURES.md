# Ship React Native Feature Overview

This document lists the current product capabilities of the boilerplate.

## Tech Stack

- Expo SDK 55 preview
- React Native 0.83
- React 19
- TypeScript
- Expo Router
- Zustand
- RevenueCat
- PostHog
- Sentry
- Convex or Expo API Routes

## Backend Modes

### Convex

Recommended for full products that need:

- authentication
- persisted data
- credits and rate limits
- subscriptions and server-side business logic

### Expo API Routes

Supported for lighter apps that primarily need:

- server-side AI proxy endpoints
- simpler deployment without the full Convex backend layer

## AI Features

- Image generation
- Video generation
- Text to speech
- Speech to text
- Image analysis
- AI chat

Provider integrations in the repo include:

- OpenAI
- Replicate
- ElevenLabs

## Product Infrastructure

- Onboarding flow
- RevenueCat paywall and subscription wiring
- Analytics via PostHog
- Error tracking via Sentry
- Offline caching helpers
- Notification service scaffolding
- Store review prompt scaffolding
- Permissions service scaffolding

## UI And Screens

Main screens under `src/app/`:

- onboarding
- login
- home
- gallery
- profile
- settings
- premium
- generate
- video-generation
- speech
- transcription
- image-identify
- chat
- analytics
- generations

UI primitives under `src/components/ui/` include:

- Button
- Input
- Card
- Text
- Badge
- Avatar
- Divider
- ScreenHeader
- EmptyState
- ErrorCard
- Skeleton
- FullScreenModal

Design-oriented components also exist under `src/components/ui/design/`.

## Feature Templates

The boilerplate already supports app template presets in `src/constants/features.ts`:

- image-generation
- video-generation
- image-video
- audio-generation
- audio-transcription
- audio-full
- full-suite
- custom

These templates are one of the strongest foundations for turning the boilerplate into a more configurable system later.

## What Is Most Complete Today

The strongest, most production-ready path in the current repo is:

- Convex backend
- RevenueCat subscriptions
- AI feature toggling via `src/constants/features.ts`
- branded setup through `scripts/setup.js`

## What Is More Scaffold Than Finished

Some parts of the repo are intentionally more scaffold-like than fully productized:

- Expo API Routes mode parity with Convex
- end-to-end testing
- notification backend wiring
- some permissions and store-review integration paths

Use the boilerplate as a strong starting system, but treat those areas as extension points.
