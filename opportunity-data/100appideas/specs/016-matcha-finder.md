---
rank: 16
name: "Matcha Finder"
slug: matcha-finder
status: MODERATE
category: Food & Drink
build_time: complex
pricing_tier: entry
primary_keyword: "matcha"
keyword_popularity: 63
keyword_difficulty: 9
total_score: 44
top_competitor_reviews: 7
suggested_features: []
---

# Matcha Finder

> Decent signal — build it lean, validate fast.

## Concept

A lifestyle app for matcha enthusiasts — find nearby matcha cafes, rate matcha drinks, track your matcha journey with tasting notes. Target the booming matcha culture among health-conscious millennials and Gen Z.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'matcha' is pop 63 / diff 9, with 232 App Store apps, 1 qualifying tracked keyword, and broad or fuzzy intent (52/100). Captured direct competitors are small at 7 reviews. It survives, but no longer ranks as an obvious top build. The old #1 was wrong because it over-weighted the broad head keyword 'matcha' and ignored 232-app saturation plus weak supporting long-tail volume.

- Primary keyword: **"matcha"** — popularity 63, difficulty 9
- Apps competing on the keyword: 232
- Total opportunity score: 44

## Target keywords (ASO)

- matcha
- matcha map
- matcha cafe
- matcha tea
- matcha finder
- green tea
- latte finder
- tea shop

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                            | Reviews | Rating |
| ------------------------------ | ------- | ------ |
| Matcha Map – For Matcha Lovers | 7       | 4.4    |
| Matcha Cafe                    | 0       | -      |
| Matcha Kari                    | 1       | -      |

## MVP features

- Find nearby matcha cafes with MapKit integration
- Rate and review matcha drinks with tasting notes
- Track your matcha journey with a personal journal
- Community-submitted cafe locations via CloudKit
- Favorites sync across devices
- Beautiful curated cafe database

## Monetization

Freemium — free cafe finder, premium for tasting journal, favorites sync, ad-free. $4.99/week or $24.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $4.99  | $9.99   | $24.99 | 7-day |

## Ship React Native mapping

No AI features detected — set CURRENT_TEMPLATE to 'custom' with all AI features disabled. The boilerplate still provides auth, payments, onboarding, analytics, and i18n.

- RevenueCat products: create weekly $4.99 / monthly $9.99 / annual $24.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): MapKit; Core Location; CloudKit for cafe database; User-submitted locations; SwiftUI
