# Start Here

Ship React Native is a production-ready Expo + React Native boilerplate with two supported backend modes:

- `Convex` - recommended for auth, persistence, credits, subscriptions, and reactive data
- `Expo API Routes` - lighter setup for server-side AI proxies without the full backend layer

## Prerequisites

- Node.js 22 installed (see `.nvmrc`)
- npm installed
- iOS Simulator (Mac) or Android Emulator
- An Expo account for EAS builds
- A Convex account if you choose `Convex` mode
- Claude Code and Claude Design access when running the ShipReactNative System

## ShipReactNative System design setup

The System requires an interactive Claude Design prototype before implementation. The official
remote MCP is already configured in `.mcp.json`. Open the repository in Claude Code, trust the
project MCP, run `/design-login`, then `/design-sync`. See
[docs/CLAUDE_DESIGN.md](docs/CLAUDE_DESIGN.md).

If Claude Design is unavailable or unauthenticated, the Design stage stops rather than substituting
a markdown-only pack.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Copy Environment Variables

```bash
cp .env.example .env
```

At minimum, configure the variables required for your chosen backend mode:

- `Convex mode`: set `EXPO_PUBLIC_CONVEX_URL`
- `Expo API Routes mode`: set `EXPO_PUBLIC_API_URL` after deploying your API routes
- Optional services: RevenueCat, PostHog, Sentry

Server-side AI keys should stay server-side:

- In `Convex` mode, put them in the Convex dashboard environment variables
- In `Expo API Routes` mode, put them in your deployment environment, not in client code

## Step 3: Run the Setup Wizard

```bash
npm run setup
```

The setup wizard configures:

- app name and bundle identifiers
- brand colors and font
- feature template selection
- backend mode (`Convex` or `Expo API Routes`)
- auth and paywall defaults
- analytics and RevenueCat keys

## Step 4: Start Development

```bash
npm start
```

Then press:

- `i` for iOS Simulator
- `a` for Android Emulator

## Backend Setup

### Option 1: Convex (Recommended)

```bash
npx convex init
npx convex dev
```

Then add your deployment URL to `.env`:

```env
EXPO_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

### Option 2: Expo API Routes

Use this mode when you only need server-side AI routes and do not need the full Convex data layer.

Deploy the app with EAS Hosting or another supported platform, then set:

```env
EXPO_PUBLIC_API_URL=https://your-deployment-url
```

## Recommended Reading Order

| Task           | Documentation                                              |
| -------------- | ---------------------------------------------------------- |
| Core overview  | [README.md](README.md)                                     |
| Full setup     | [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)                 |
| Convex setup   | [docs/CONVEX_SETUP.md](docs/CONVEX_SETUP.md)               |
| Branding       | [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md)             |
| Claude Design  | [docs/CLAUDE_DESIGN.md](docs/CLAUDE_DESIGN.md)             |
| Architecture   | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)               |
| Deployment     | [docs/EAS_DEPLOYMENT.md](docs/EAS_DEPLOYMENT.md)           |
| App Store prep | [docs/APP_STORE_CHECKLIST.md](docs/APP_STORE_CHECKLIST.md) |

## Quick Reference

```bash
npm start
npm run setup
npm run ios
npm run android
npm run lint
npm run type-check
```
