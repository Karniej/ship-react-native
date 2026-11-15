---
rank: 66
name: "Deck of Cards"
slug: deck-of-cards
status: DEAD
category: Entertainment
build_time: weekend
pricing_tier: entry
primary_keyword: "deck of cards"
keyword_popularity: 48
keyword_difficulty: 85
total_score: 18
top_competitor_reviews: 835
suggested_features: []
---

# Deck of Cards

> Do NOT build as-is — no search volume. Kept for reference only.

## Concept

Virtual deck of playing cards — shuffle, draw, deal for any card game. Support multiple deck types (standard, tarot, UNO-style). Add drinking game presets and custom card creation.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'card game' is pop 48 / diff 85, with 246 App Store apps, 0 qualifying tracked keywords, and exact app-intent (100/100). Captured direct competition is manageable at 835 reviews. It stays dead/monitor-only despite any old score.

- Primary keyword: **"deck of cards"** — popularity 48, difficulty 85
- Apps competing on the keyword: 246
- Total opportunity score: 18

## Target keywords (ASO)

- deck of cards
- playing cards
- card deck
- virtual cards
- card game
- shuffle cards

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                          | Reviews | Rating |
| ---------------------------- | ------- | ------ |
| Draw a Card Deck             | 835     | 4.6    |
| Deck of Cards - Virtual deal | 4       | 2.8    |
| iDeckOfCards                 | 355     | 4.1    |

## MVP features

- Shuffle, draw, and deal cards
- Multiple deck types (standard, tarot, UNO-style)
- Drinking game presets
- Custom card creation
- Realistic card animations
- Haptic feedback

## Monetization

Freemium — standard deck free, premium for custom decks, themes, games. $4.99/week or $24.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $4.99  | $9.99   | $24.99 | none  |

## Ship React Native mapping

No AI features detected — set CURRENT_TEMPLATE to 'custom' with all AI features disabled. The boilerplate still provides auth, payments, onboarding, analytics, and i18n.

- RevenueCat products: create weekly $4.99 / monthly $9.99 / annual $24.99 (no trial) and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): SwiftUI; Card animations; Shuffle algorithm; Haptics
