---
rank: 72
name: "Funko Pop Tracker"
slug: funko-pop-tracker
status: DEAD
category: Entertainment
build_time: complex
pricing_tier: premium
primary_keyword: "funko pop"
keyword_popularity: 22
keyword_difficulty: 43
total_score: 15
top_competitor_reviews: 8220
suggested_features: [imageIdentification]
---

# Funko Pop Tracker

> Do NOT build as-is — no search volume. Kept for reference only.

## Concept

A barcode-scan + photo-shelf Funko Pop tracker: log your collection, get current secondary-market value, wishlist scanner at retail, set-completion progress for series. Native iOS, fast scanning, beautiful shelf view.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'collection' is pop 22 / diff 43, with 216 App Store apps, 1 qualifying tracked keyword, and broad or fuzzy intent (52/100). Competition is real at 8,220 captured reviews. It stays dead/monitor-only despite any old score.

- Primary keyword: **"funko pop"** — popularity 22, difficulty 43
- Apps competing on the keyword: 216
- Total opportunity score: 15

## Target keywords (ASO)

- funko pop
- funko
- vinyl figure
- collection
- scanner
- value
- price
- wishlist
- collectible

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                           | Reviews | Rating |
| ----------------------------- | ------- | ------ |
| Funko (official)              | 475     | 2.8    |
| PopGrinder                    | 58      | 4.5    |
| Toy Value Scanner for Funko   | 159     | 4.7    |
| hobbyDB Collection Management | 8,220   | 4.8    |
| Price Scanner for Funko Pop   | 43      | 4.7    |
| iCollect Vinyl Figures        | 471     | 4.6    |

## MVP features

- Barcode scan + photo-shelf collection log
- Secondary-market value lookup
- Wishlist scanner at retail
- Set completion tracking
- CloudKit sync
- Beautiful shelf view

## Monetization

Hard paywall. $4.99/week or $39.99/year. Collectors pay — proven by hobbyDB's 8k reviews.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $4.99  | $9.99   | $39.99 | 7-day |

## Ship React Native mapping

Set CURRENT_TEMPLATE to 'custom' and enable only: imageIdentification.

- RevenueCat products: create weekly $4.99 / monthly $9.99 / annual $39.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): AVFoundation barcode; Vision OCR for box numbers; CloudKit sync; Scraped price endpoint
