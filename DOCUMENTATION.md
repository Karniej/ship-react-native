# Ship React Native Documentation

This file is the high-level map of the boilerplate. For implementation details, use the docs in `docs/`.

## Canonical Architecture

- Framework: Expo SDK 57 + React Native 0.86 + React 19
- Routing: Expo Router under `src/app/`
- State: Zustand stores under `src/store/`
- Backend: `Convex` recommended, `Expo API Routes` supported
- Payments: RevenueCat
- Analytics: PostHog
- Error tracking: Sentry
- AI providers: OpenAI, Replicate, ElevenLabs

## Project Structure

```text
ship-react-native/
├── src/
│   ├── app/                # Expo Router app, screens, API routes
│   ├── components/         # UI primitives and feature components
│   ├── constants/          # App config, backend mode, feature flags, branding
│   ├── hooks/              # App hooks and backend-specific hooks
│   ├── providers/          # Root providers (Convex, Query, etc.)
│   ├── services/           # AI, auth, purchases, notifications
│   ├── store/              # Zustand stores
│   ├── types/              # Shared TS types
│   └── utils/              # Storage, haptics, caching, validation
├── convex/                 # Convex schema, auth, queries, mutations, actions
├── docs/                   # User-facing docs
├── scripts/                # Setup and utility scripts
└── __tests__/              # Jest tests
```

## Backend Modes

### Convex

Use `Convex` when you want:

- real auth flows
- persisted profiles, credits, generations, and subscriptions
- reactive queries and mutations
- rate limiting and server-side orchestration

Relevant files:

- `src/constants/api.ts`
- `src/providers/ConvexClientProvider.tsx`
- `src/hooks/useConvexAuth.ts`
- `src/hooks/useConvexAI.ts`
- `convex/schema.ts`

### Expo API Routes

Use `Expo API Routes` when you want:

- a lighter deployment path
- server-side AI proxy routes
- a simpler starting point without the full Convex data layer

Relevant files:

- `src/app/api/*.ts`
- `src/constants/api.ts`
- `src/services/ai/*.ts`

## Important Defaults

- Feature templates are controlled in `src/constants/features.ts`
- Branding is controlled in `src/constants/brand.ts`
- App config is controlled in `src/constants/config.ts`
- The setup wizard is `scripts/setup.js`
- The current repo defaults to `Convex` mode in `src/constants/api.ts`

## Recommended Docs

- [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/FEATURES.md](docs/FEATURES.md)
- [docs/CONVEX_SETUP.md](docs/CONVEX_SETUP.md)
- [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md)
- [docs/EAS_DEPLOYMENT.md](docs/EAS_DEPLOYMENT.md)
