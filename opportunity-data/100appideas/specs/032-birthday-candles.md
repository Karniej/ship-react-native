---
rank: 32
name: "Birthday Candles"
slug: birthday-candles
status: WEAK
category: Entertainment
build_time: weekend
pricing_tier: entry
primary_keyword: "birthday candle app"
keyword_popularity: 26
keyword_difficulty: 21
total_score: 34
top_competitor_reviews: 1672
suggested_features: [imageIdentification]
---

# Birthday Candles

> Weak search signal — only build with a distribution plan beyond ASO.

## Concept

Digital birthday candles you blow out using the microphone. Set your age, blow to extinguish the flame with realistic physics. Fun for when you don't have a real cake. Add AR mode to place candles on a real surface.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'birthday candle app' is pop 26 / diff 21, with 209 App Store apps, 1 qualifying tracked keyword, and exact app-intent (100/100). Competition is real at 1,672 captured reviews. It barely survives the keyword cutoff and should be treated as weak.

- Primary keyword: **"birthday candle app"** — popularity 26, difficulty 21
- Apps competing on the keyword: 209
- Total opportunity score: 34

## Target keywords (ASO)

- birthday candle app
- birthday cake
- blow out candles
- birthday party
- virtual candles

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                            | Reviews | Rating |
| ------------------------------ | ------- | ------ |
| e-Candle                       | 9       | 5.0    |
| Candle - Happy Birthday        | 2       | 1.0    |
| Birthday Cake-Blow out Candles | 1,672   | 4.6    |

## MVP features

- Blow out candles using microphone
- Realistic flame physics
- Set your age for correct candle count
- AR mode to place candles on surfaces
- Themed candle styles
- Birthday song playback

## Monetization

Freemium — basic candles free, premium for themes/effects/AR. $4.99/week or $24.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $4.99  | $9.99   | $24.99 | none  |

## Ship React Native mapping

Set CURRENT_TEMPLATE to 'custom' and enable only: imageIdentification.

- RevenueCat products: create weekly $4.99 / monthly $9.99 / annual $24.99 (no trial) and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): SwiftUI; SpriteKit for flame animation; AVAudioEngine for blow detection; ARKit optional
