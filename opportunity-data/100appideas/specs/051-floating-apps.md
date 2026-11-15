---
rank: 51
name: "Floating Apps"
slug: floating-apps
status: DEAD
category: Productivity
build_time: complex
pricing_tier: premium
primary_keyword: "floating apps"
keyword_popularity: 50
keyword_difficulty: 21
total_score: 20
top_competitor_reviews: 846
suggested_features: []
---

# Floating Apps

> Do NOT build as-is — no search volume. Kept for reference only.

## Concept

Float mini apps over other apps using Picture-in-Picture. Clock, calculator, notes, timer, translator all available as floating windows. Productivity multitasking that iOS doesn't natively support well.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'split screen' is pop 50 / diff 21, with 205 App Store apps, 1 qualifying tracked keyword, and adjacent app-intent (72/100). Captured direct competition is manageable at 846 reviews. It stays dead/monitor-only despite any old score.

- Primary keyword: **"floating apps"** — popularity 50, difficulty 21
- Apps competing on the keyword: 205
- Total opportunity score: 20

## Target keywords (ASO)

- floating apps
- pip
- split screen
- floating window
- overlay app
- multitask

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                           | Reviews | Rating |
| ----------------------------- | ------- | ------ |
| Split Screen - Floating Apps  | 846     | 4.5    |
| Twins: Split Screen Dual View | 176     | 4.3    |
| Floating Clock - Teleprompter | 78      | 4.1    |

## MVP features

- Float mini apps using Picture-in-Picture
- Clock, calculator, notes, timer widgets
- Translator floating window
- Works over any app
- Customizable floating widget size
- Quick launch from shortcut

## Monetization

Freemium — 1 floating widget free, premium for all widgets. $7.99/week or $49.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $7.99  | $14.99  | $49.99 | 7-day |

## Ship React Native mapping

No AI features detected — set CURRENT_TEMPLATE to 'custom' with all AI features disabled. The boilerplate still provides auth, payments, onboarding, analytics, and i18n.

- RevenueCat products: create weekly $7.99 / monthly $14.99 / annual $49.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): AVPictureInPictureController; Custom PiP content; SwiftUI
