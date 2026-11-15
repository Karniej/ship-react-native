# Design System

## Overview

This boilerplate uses a comprehensive design system inspired by VidNotes' "dark-first cinematic premium" aesthetic. All design tokens are centralized for easy customization.

## Color System

- Brand colors configured in `src/constants/brand.ts`
- Theme tokens in `src/constants/theme.ts`
- Use `useAppTheme()` hook -- never `useTheme()` from React Navigation
- All colors accessed via `tc.text`, `tc.surfaceElevated`, `tc.borderSubtle`, etc.

### Color Categories

| Category       | Examples                               | Source                       |
| -------------- | -------------------------------------- | ---------------------------- |
| Brand          | primary, primaryLight, primaryDark     | `BRAND.colors` in brand.ts   |
| Semantic       | success, error, warning, info          | `BRAND.colors` + theme.ts    |
| Surface        | light, dark, elevated, glass           | `colors.surface` in theme.ts |
| Text           | primary, secondary, tertiary, disabled | `colors.text` in theme.ts    |
| Border         | subtle, medium, strong                 | `colors.border` in theme.ts  |
| Accent-derived | ctaGlow, iconCircleBg, selectedOverlay | `accentDerived` in theme.ts  |

## Typography

- 6 font families available (see [Customization docs](./CUSTOMIZATION.md#typography--font-system))
- Font configured via `BRAND.font` in `src/constants/brand.ts`
- Font weights: Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800), Black (900)
- Access via `typography.fontFamily.bold`, `typography.fontFamily.semiBold`, etc.

### Text Variants

Pre-defined text styles available via `typography.variants`:

| Variant                    | Size  | Weight  | Use Case               |
| -------------------------- | ----- | ------- | ---------------------- |
| `display`                  | 48    | 700     | Hero sections          |
| `h1` - `h6`                | 32-16 | 600-700 | Headings               |
| `bodyLarge`                | 18    | 400     | Emphasized body        |
| `body`                     | 16    | 400     | Default body           |
| `bodySmall`                | 14    | 400     | Compact body           |
| `label` / `labelSmall`     | 14/12 | 500     | Form labels            |
| `caption` / `captionSmall` | 12/10 | 400     | Captions               |
| `button` / `buttonSmall`   | 16/14 | 600     | Button text            |
| `largeTitle`               | 34    | 700     | iOS-style large titles |

## Components

| Component             | Description                    |
| --------------------- | ------------------------------ |
| `GlassCard`           | Frosted glass card with border |
| `CTAButton`           | Gradient call-to-action button |
| `PressableCard`       | Animated press card            |
| `CinematicBackground` | Gradient background overlay    |
| `PageDots`            | Pagination dots                |

See `docs/COMPONENTS.md` for full component documentation.

## Spacing & Border Radius

Access via `useAppTheme()` destructured as `sp` and `br`.

### Spacing Scale

| Token                         | Value | Use Case        |
| ----------------------------- | ----- | --------------- |
| `spacing.xxs`                 | 2     | Tight gaps      |
| `spacing.xs`                  | 4     | Small gaps      |
| `spacing.sm`                  | 8     | Compact padding |
| `spacing.md`                  | 12    | Default padding |
| `spacing.lg`                  | 16    | Section padding |
| `spacing.xl`                  | 20    | Large padding   |
| `spacing.2xl`                 | 24    | Section gaps    |
| `spacing.3xl` - `spacing.8xl` | 32-96 | Layout spacing  |

### Border Radius Scale

| Token               | Value | Use Case        |
| ------------------- | ----- | --------------- |
| `borderRadius.sm`   | 4     | Subtle rounding |
| `borderRadius.md`   | 8     | Cards, inputs   |
| `borderRadius.lg`   | 12    | Modals, sheets  |
| `borderRadius.xl`   | 16    | Large cards     |
| `borderRadius.2xl`  | 20    | Feature cards   |
| `borderRadius.3xl`  | 24    | Hero elements   |
| `borderRadius.full` | 9999  | Circles, pills  |

## Shadows

Pre-defined shadow presets from `xs` to `2xl`, plus:

- `ctaGlow` -- brand-colored glow for CTA buttons
- `mockup` -- elevated mockup shadow with brand tint

## Animation

### Spring Presets

| Preset    | Feel          | Use Case              |
| --------- | ------------- | --------------------- |
| `gentle`  | Soft, natural | Page transitions      |
| `default` | Balanced      | General animations    |
| `bouncy`  | Playful       | Notifications, toasts |
| `stiff`   | Precise       | Toggles, switches     |
| `quick`   | Snappy        | Button presses        |

### Timing Presets

- `press`: 100ms -- button feedback
- `quick`: 150ms -- micro interactions
- `standard`: 300ms -- general transitions
- `carousel`: 600ms -- slide transitions
- `cinematic`: 900ms -- dramatic reveals

## Onboarding

- Cinematic gradient backgrounds per slide
- Glassmorphism icon circles with animated glow
- Bold/ExtraBold titles using the configured font
- Configured via `src/constants/onboarding.ts` + `src/locales/en.ts`

## Icons & Splash Screens

See `docs/ICON_AND_SPLASH_GENERATION.md` for the icon and splash screen generation workflow.

## App Store Listings

See `docs/APP_STORE_LISTING_TEMPLATE.md` for App Store listing templates and ASO guidance.
