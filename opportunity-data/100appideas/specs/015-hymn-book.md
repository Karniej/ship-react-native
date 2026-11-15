---
rank: 15
name: "Hymn Book"
slug: hymn-book
status: MODERATE
category: Books
build_time: week
pricing_tier: entry
primary_keyword: "hymn book"
keyword_popularity: 25
keyword_difficulty: 9
total_score: 45
top_competitor_reviews: 143
suggested_features: []
---

# Hymn Book

> Decent signal — build it lean, validate fast.

## Concept

Digital hymn book with 1,000+ classic hymns, search by title/lyrics/number, audio playback, favorites, offline mode. Target church-goers, worship leaders, choir members. Include multiple hymnals.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'hymn book' is pop 25 / diff 9, with 243 App Store apps, 1 qualifying tracked keyword, and exact app-intent (100/100). Captured direct competition is manageable at 143 reviews. It survives, but no longer ranks as an obvious top build.

- Primary keyword: **"hymn book"** — popularity 25, difficulty 9
- Apps competing on the keyword: 243
- Total opportunity score: 45

## Target keywords (ASO)

- hymn book
- hymns
- christian hymns
- gospel songs
- church songs
- worship music
- choir songs

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                        | Reviews | Rating |
| -------------------------- | ------- | ------ |
| Gospel Hymns and Songs GHS | 4       | 4.5    |
| Gospel Hymn Book + Audio   | 143     | 4.2    |
| Iwe Orin Mimo              | 8       | 3.1    |
| The Christian Hymn Book    | 2       | -      |

## MVP features

- 1,000+ classic hymns searchable by title, lyrics, or number
- Audio playback for each hymn
- Favorites and offline mode
- Multiple hymnals (Baptist, Methodist, Catholic)
- Full-text search across all lyrics
- Adjustable font size for readability

## Monetization

Freemium — 100 free hymns, premium for full library + audio. $4.99/week or $24.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $4.99  | $9.99   | $24.99 | 7-day |

## Ship React Native mapping

No AI features detected — set CURRENT_TEMPLATE to 'custom' with all AI features disabled. The boilerplate still provides auth, payments, onboarding, analytics, and i18n.

- RevenueCat products: create weekly $4.99 / monthly $9.99 / annual $24.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): SwiftUI; Full-text search; AVFoundation for audio; Offline content bundle
