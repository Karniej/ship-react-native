---
rank: 31
name: "Armocromia Color Analysis"
slug: armocromia-color-analysis
status: WEAK
category: Lifestyle
build_time: week
pricing_tier: premium
primary_keyword: "armocromia"
keyword_popularity: 42
keyword_difficulty: 23
total_score: 34
top_competitor_reviews: 4213
suggested_features: [imageIdentification]
---

# Armocromia Color Analysis

> Weak search signal — only build with a distribution plan beyond ASO.

## Concept

Personal color analysis app for Italian and global fashion users. Take a selfie, detect undertone and contrast, get a seasonal palette, makeup shades, outfit colors, and shopping-safe color cards.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'armocromia' is pop 42 / diff 23, with 194 App Store apps, 2 qualifying tracked keywords, and adjacent app-intent (75/100). Competition is real at 4,213 captured reviews. It barely survives the keyword cutoff and should be treated as weak.

- Primary keyword: **"armocromia"** — popularity 42, difficulty 23
- Apps competing on the keyword: 194
- Total opportunity score: 34

## Target keywords (ASO)

- armocromia
- color analysis
- seasonal color analysis
- personal palette
- palette AI
- skin undertone
- outfit colors

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                            | Reviews | Rating |
| ------------------------------ | ------- | ------ |
| Color Analysis - Dressika      | 4,213   | 4.4    |
| Color Analysis AI & Palette    | 8       | 5.0    |
| Color Analysis: Season Palette | 71      | 4.4    |
| ArmocromIA - Color Analysis    | 2       | 1.5    |
| My Best Colors                 | 2,669   | 4.7    |

## MVP features

- Selfie-based undertone and contrast analysis
- Seasonal palette result with confidence score
- Makeup, hair, and outfit color recommendations
- Wallet-friendly color cards for shopping
- Before/after outfit comparison
- Italian-first localization with English support

## Monetization

Hard paywall after one free analysis. $4.99/week or $39.99/year. Beauty and style utilities monetize well when the result feels personal.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $4.99  | $9.99   | $39.99 | 7-day |

## Ship React Native mapping

Set CURRENT_TEMPLATE to 'custom' and enable only: imageIdentification.

- RevenueCat products: create weekly $4.99 / monthly $9.99 / annual $39.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): SwiftUI; Vision face landmarks; Color sampling and palette matching; PhotosUI; Optional AI explanation layer
