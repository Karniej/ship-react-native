---
rank: 76
name: "Morse Code Translator"
slug: morse-code-translator
status: DEAD
category: Education
build_time: week
pricing_tier: premium
primary_keyword: "morse code translator"
keyword_popularity: 8
keyword_difficulty: 19
total_score: 15
top_competitor_reviews: 2373
suggested_features: []
---

# Morse Code Translator

> Do NOT build as-is — no search volume. Kept for reference only.

## Concept

Translate text to morse code and back. Transmit via flashlight, sound, or haptics. Include learning mode with interactive lessons, speed practice, and real-time decoding from audio input.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'morse code translator' is pop 8 / diff 19, with 210 App Store apps, 0 qualifying tracked keywords, and exact app-intent (100/100). Competition is real at 2,373 captured reviews. It stays dead/monitor-only despite any old score.

- Primary keyword: **"morse code translator"** — popularity 8, difficulty 19
- Apps competing on the keyword: 210
- Total opportunity score: 15

## Target keywords (ASO)

- morse code translator
- morse code
- morse decoder
- morse encoder
- sos signal

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                            | Reviews | Rating |
| ------------------------------ | ------- | ------ |
| Morse code - Morse Master      | 212     | 4.6    |
| Morse Code Decoder and Encoder | 18      | 3.6    |
| Morse Code Reader and Decoder  | 2,373   | 4.4    |

## MVP features

- Text to morse code translation
- Transmit via flashlight, sound, or haptics
- Interactive learning lessons
- Speed practice mode
- Real-time audio decoding
- SOS quick send

## Monetization

Freemium — basic translator free, premium for lessons + audio decode. $7.99/week or $49.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $7.99  | $14.99  | $49.99 | 7-day |

## Ship React Native mapping

No AI features detected — set CURRENT_TEMPLATE to 'custom' with all AI features disabled. The boilerplate still provides auth, payments, onboarding, analytics, and i18n.

- RevenueCat products: create weekly $7.99 / monthly $14.99 / annual $49.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): SwiftUI; AVFoundation (torch + audio); Haptics; Audio analysis
