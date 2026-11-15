# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **Open source** - Ship React Native is now free and open source under the MIT License.
  The previous commercial licence no longer applies to this repository.
  - Added `SECURITY.md`, `CODE_OF_CONDUCT.md`, and `THIRD_PARTY_NOTICES.md`
  - README rewritten for the public repository (Expo SDK 57, React Native 0.86)
  - Removed internal planning memos and owner-specific placeholders from the docs

### Added

- **Push Notifications Service** - Complete notification system
  - Permission request flow with graceful handling
  - Token registration with Supabase
  - Foreground and background notification handlers
  - Local notification scheduling
  - `useNotifications` hook for easy integration
  - Database migration for push tokens

- **Store Review Integration** - Smart App Store review prompts
  - Configurable prompt conditions (generations, app opens, time)
  - Rate limiting between prompts
  - Analytics tracking for review events
  - `storeReviewService` for programmatic control

- **Centralized Permissions Service** - Unified permission handling
  - Camera, microphone, media library, notifications
  - Permission status checking and requesting
  - Settings redirect on denial
  - Helper functions with explanations

- **Social Sharing Utilities** - Complete sharing system
  - Native share sheet integration
  - File and remote URL sharing
  - Save to photo library
  - Clipboard support (text and images)
  - Generation sharing with options

- **Form Validation** - Zod-based validation system
  - `useForm` hook with full validation
  - Pre-built schemas (email, password, name, prompt)
  - Type-safe form handling
  - Field-level and form-level validation

- **OTA Updates** - expo-updates configuration
  - Automatic update checking
  - Fallback timeout configuration
  - Runtime version policy

- **Debug Menu** - Developer-only debug panel
  - View all store states
  - Quick actions (add credits, toggle premium, reset onboarding)
  - Update checking
  - Storage management

- **Comprehensive Documentation**
  - `docs/UPGRADE.md` - Version upgrade guide
  - `docs/ARCHITECTURE.md` - System architecture with diagrams
  - `docs/RATE_LIMITS.md` - API rate limit documentation
  - `docs/COST_GUIDE.md` - Cost estimation and optimization
  - `docs/SECURITY_CHECKLIST.md` - Security audit checklist
  - `docs/PERFORMANCE.md` - Performance optimization guide

- **Database Migrations**
  - Push tokens table with RLS policies
  - Rate limits table for API throttling

- Developer experience improvements
  - `.env.example` with all environment variables documented
  - VS Code settings, extensions, and debugging configurations
  - Debugging guide (`docs/DEBUGGING.md`)
  - UI Components documentation (`docs/COMPONENTS.md`)
- Production readiness tools
  - App Store submission checklist (`docs/APP_STORE_CHECKLIST.md`)
  - Security best practices guide (`docs/SECURITY.md`)
  - Release automation with `npm run release`
  - GitHub release workflow
- Testing infrastructure
  - Example tests for components, hooks, stores, and utilities
  - Testing guide (`docs/TESTING.md`)
- Backend documentation
  - Backend and API routes documentation
  - Database seed script (`npm run db:seed`)
- Customization tools
  - Branding guide (`docs/CUSTOMIZATION.md`)
  - Asset generation script (`npm run generate:assets`)
- CI/CD
  - GitHub Actions CI workflow
  - EAS Build workflow
  - Pre-commit hooks with Husky

### Changed

- **ESLint Configuration** - Enhanced linting rules
  - Import sorting with `eslint-plugin-import`
  - Organized imports (React, React Native, Expo, internal)
  - Alphabetized imports within groups
  - No duplicate imports

- **Developer Experience**
  - Added `.prettierrc` configuration
  - Added `.nvmrc` (Node 20)
  - Added `.editorconfig` for consistent formatting
  - Added `commitlint.config.js` for conventional commits
  - Added GitHub issue and PR templates
  - iOS permission descriptions in `app.json`
  - Android permissions configured

- Updated component animations with react-native-reanimated v4
- Improved image/video generation with reference image support

## [1.0.0] - 2024-12-18

### Added

#### AI Generation Features

- **Image Generation** - Create images from text prompts
  - OpenAI DALL-E 3 and DALL-E 2 support
  - Replicate integration (Flux Schnell, SDXL)
  - Image-to-image transformation with reference images
  - Multiple aspect ratios and quality settings
- **Video Generation** - Generate videos from text or images
  - Runway Gen-3 Alpha integration
  - Pika Labs support
  - Stable Video Diffusion
  - Start/end frame support for animations
- **Text-to-Speech** - Convert text to natural-sounding audio
  - ElevenLabs integration with 40+ voices
  - Multiple voice styles and emotions
  - High-quality audio output
- **Speech-to-Text** - Transcribe audio to text
  - OpenAI Whisper integration
  - Support for 50+ languages
  - Multiple audio format support (MP3, WAV, M4A, FLAC)
- **Image Analysis** - Identify and analyze images
  - GPT-4 Vision integration
  - Object detection and scene description
  - Text extraction from images
- **AI Chat** - Multi-turn conversations
  - GPT-4o and GPT-4o-mini support
  - Conversation history persistence
  - Markdown rendering for responses

#### Authentication & User Management

- **Email/Password Authentication** - Traditional signup/login via Supabase
- **Magic Link Authentication** - Passwordless login via email
- **Social Authentication** - Google Sign-In and Apple Sign-In
- **Anonymous Authentication** - Zero-friction onboarding
- **Account Linking** - Upgrade anonymous to full accounts
- **Profile Management** - User profiles with avatars and metadata
- **Session Persistence** - Automatic token refresh

#### Monetization

- **RevenueCat Integration** - Cross-platform in-app purchases
  - iOS App Store support
  - Google Play Store support
  - Subscription management
  - Receipt validation
- **Credit System** - Flexible AI generation credits
  - Configurable costs per generation type
  - Free tier with initial credits
  - Daily credit refill options
  - Low credit warnings
- **Premium Features** - Feature gating for subscribers
  - Unlimited generations
  - Priority processing
  - Exclusive AI models
  - Ad-free experience

#### User Experience

- **Onboarding Flow** - Customizable multi-step onboarding
  - Animated transitions
  - User data collection (name, preferences)
  - Theme selection
  - Progress indicators
- **Paywall Screen** - Premium upgrade UI
  - Feature comparison
  - Subscription plan picker
  - Free trial support
  - Animated benefits carousel
- **Gallery** - Browse and manage generated content
  - Grid and list views
  - Filter by content type
  - Detail modal with sharing
  - Delete functionality
- **Dark/Light Theme** - Automatic and manual theme switching
  - System preference detection
  - Persistent preference storage
  - Comprehensive design tokens

#### Internationalization

- **Multi-language Support** - 5 languages included
  - English (en)
  - Spanish (es)
  - French (fr)
  - German (de)
  - Italian (it)
- **Translation System** - Easy-to-extend i18n
  - Nested key support
  - Parameter interpolation
  - Language persistence

#### Analytics & Monitoring

- **PostHog Integration** - Comprehensive analytics
  - Screen view tracking
  - Event tracking
  - User identification
  - Feature usage metrics
- **Sentry Integration** - Error tracking and monitoring
  - Crash reporting
  - Error boundaries
  - Session tracking
  - Performance monitoring

#### Backend (Supabase)

- **Database Schema** - Production-ready tables
  - User profiles
  - Credit tracking
  - Generation history
- **Edge Functions** - Serverless AI processing
  - Image generation endpoint
  - Video generation endpoint
  - Text-to-speech endpoint
  - Transcription endpoint
  - Image analysis endpoint
  - Chat endpoint
  - RevenueCat webhook handler
- **Row Level Security** - Secure data access policies
- **Real-time Subscriptions** - Live data updates

#### Developer Experience

- **TypeScript** - Full type safety throughout
  - Strict mode enabled
  - Auto-generated database types
  - Path aliases configured
- **State Management** - Zustand stores
  - Auth store
  - AI generation store
  - Premium store
  - Settings store
  - Notification store
  - Offline store
  - Onboarding store
- **File-based Routing** - Expo Router 6
  - Typed routes
  - Nested layouts
  - Tab navigation
- **UI Components** - 36+ reusable components
  - Buttons, inputs, cards
  - Loading states, skeletons
  - Modals, avatars, badges
  - AI-specific components
- **Custom Hooks** - 9 utility hooks
  - useAnalytics
  - useAppTheme
  - useI18n
  - useNetworkState
  - usePremiumFeatures
  - usePremiumStatus
  - useQuery
  - useStoreReview
  - useWatchIntegration
- **Development Mode** - Unlimited AI generations in dev
  - Credit bypass
  - Verbose logging
  - Dev banner

#### Configuration & Customization

- **Feature Flags** - Toggle features on/off
  - Pre-configured app templates
  - Per-feature enable/disable
  - Premium-only features
  - Beta feature flags
- **Brand Configuration** - Centralized branding
  - Colors and gradients
  - App identity
  - Social links
- **Validation System** - Startup configuration checks
  - Environment variable validation
  - Placeholder value detection
  - Missing config warnings

#### Documentation

- **README.md** - Comprehensive getting started guide
- **docs/FEATURES.md** - Complete feature list
- **docs/CUSTOMIZATION.md** - Branding and customization guide
- **docs/COMPONENTS.md** - UI component documentation
- **docs/TESTING.md** - Testing strategy and examples
- **docs/EDGE_FUNCTIONS.md** - Supabase Edge Functions guide
- **docs/SUPABASE_SETUP.md** - Database setup instructions
- **docs/SECURITY.md** - Security best practices
- **docs/DEBUGGING.md** - Debugging tools and tips
- **docs/APP_STORE_CHECKLIST.md** - Pre-launch checklist
- **docs/EAS_DEPLOYMENT.md** - Build and submit guide
- **docs/FUTURE_FEATURES.md** - Roadmap

#### Infrastructure

- **Push Notifications** - expo-notifications integration
  - Permission handling
  - Notification preferences
  - Scheduling support
- **Offline Support** - React Query caching
  - Persistent cache
  - Optimistic updates
  - Background sync
- **Network Detection** - Online/offline state
  - Network state hook
  - Offline indicator UI
- **File Caching** - Local file storage
  - Generated content caching
  - Download and share functionality
- **Haptic Feedback** - Touch feedback throughout
- **Rate Limiting** - Client-side API protection

---

## Version Guidelines

### Major (X.0.0)

- Breaking changes to API or core functionality
- Removal of deprecated features
- Major architectural changes

### Minor (0.X.0)

- New features
- New AI model integrations
- New UI components
- Non-breaking enhancements

### Patch (0.0.X)

- Bug fixes
- Security patches
- Documentation updates
- Minor improvements

---

## How to Update This File

When making changes:

1. Add entries under `[Unreleased]` section
2. Use appropriate category:
   - **Added** for new features
   - **Changed** for changes in existing functionality
   - **Deprecated** for soon-to-be removed features
   - **Removed** for now removed features
   - **Fixed** for any bug fixes
   - **Security** for vulnerability fixes

3. Before release, move unreleased items to a new version section

Example:

```markdown
## [Unreleased]

### Added

- New feature description

## [1.2.0] - 2024-01-15

### Added

- Previous unreleased features...
```
