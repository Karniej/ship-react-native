---
rank: 45
name: "Latin Daily Reader"
slug: latin-daily-reader
status: WEAK
category: Education
build_time: week
pricing_tier: premium
primary_keyword: "latin"
keyword_popularity: 27
keyword_difficulty: 21
total_score: 24
top_competitor_reviews: 934
suggested_features: [textToSpeech]
---

# Latin Daily Reader

> Weak search signal — only build with a distribution plan beyond ASO.

## Concept

Daily Latin: one verse, one short reading (Cicero, Augustine, Vulgate), full parsing, vocabulary deck, audio pronunciation. Plus a fast offline Latin-English dictionary with macron support.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'latin' is pop 27 / diff 21, with 222 App Store apps, 1 qualifying tracked keyword, and broad or fuzzy intent (52/100). Captured direct competition is manageable at 934 reviews. It barely survives the keyword cutoff and should be treated as weak.

- Primary keyword: **"latin"** — popularity 27, difficulty 21
- Apps competing on the keyword: 222
- Total opportunity score: 24

## Target keywords (ASO)

- latin
- latin dictionary
- latin learning
- vocab
- grammar
- pronounce
- classical
- vulgate

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                            | Reviews | Rating |
| ------------------------------ | ------- | ------ |
| Legentibus: Learn Latin        | 934     | 4.9    |
| Credo: Catholic Latin Learning | 489     | 4.9    |
| Cattus: Learn Latin            | 52      | 4.6    |
| Logeion                        | 71      | 4.4    |
| Latin English Dictionary       | 656     | 4.1    |

## MVP features

- Daily Latin verse + short reading
- Full parsing per word
- Vocabulary deck
- Audio pronunciation
- Offline Latin-English dictionary with macrons
- SQLite FTS for fast lookup

## Monetization

Hard paywall. $4.99/week or $39.99/year. Niche language learners convert well.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $4.99  | $9.99   | $39.99 | 7-day |

## Ship React Native mapping

Set CURRENT_TEMPLATE to 'custom' and enable only: textToSpeech.

- RevenueCat products: create weekly $4.99 / monthly $9.99 / annual $39.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): Bundled Wiktionary-derived corpus; AVFoundation TTS; SQLite FTS; SwiftUI
