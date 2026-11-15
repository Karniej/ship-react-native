---
rank: 17
name: "Bartender Practice Game"
slug: bartender-practice-game
status: MODERATE
category: Food & Drink
build_time: week
pricing_tier: entry
primary_keyword: "bartender game"
keyword_popularity: 32
keyword_difficulty: 21
total_score: 44
top_competitor_reviews: 1182
suggested_features: []
---

# Bartender Practice Game

> Decent signal — build it lean, validate fast.

## Concept

A cocktail-mixing game that doubles as bartender training. Users learn classic drink recipes by playing timed service rounds, memorizing pours, glassware, garnishes, and build order.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'bartender game' is pop 32 / diff 21, with 148 App Store apps, 1 qualifying tracked keyword, and exact app-intent (100/100). Captured direct competition is manageable at 1,182 reviews. It survives, but no longer ranks as an obvious top build.

- Primary keyword: **"bartender game"** — popularity 32, difficulty 21
- Apps competing on the keyword: 148
- Total opportunity score: 44

## Target keywords (ASO)

- bartender game
- bartender app
- bartending school
- cocktail recipes
- mixology
- drink recipes
- bar simulator

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                            | Reviews | Rating |
| ------------------------------ | ------- | ------ |
| Best Bartender - Mixed Drink   | 23      | 3.3    |
| Be a Bartender!                | 875     | 4.7    |
| Bartender School               | 1,182   | 4.8    |
| Bartending School by Gigz Labs | 1       | 5.0    |
| BarSim Bartender Throwdown     | 40      | 2.9    |

## MVP features

- Timed cocktail service rounds
- Recipe flashcards for classic drinks
- Pour accuracy scoring
- Glassware and garnish training
- No-alcohol mocktail mode
- Daily drink challenge

## Monetization

Freemium - free starter recipes, premium for full drink library and training packs. $4.99/week or $24.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $4.99  | $9.99   | $24.99 | 7-day |

## Ship React Native mapping

No AI features detected — set CURRENT_TEMPLATE to 'custom' with all AI features disabled. The boilerplate still provides auth, payments, onboarding, analytics, and i18n.

- RevenueCat products: create weekly $4.99 / monthly $9.99 / annual $24.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): SwiftUI; Recipe content database; Game state engine; Sprite-style drink building UI; Haptics
