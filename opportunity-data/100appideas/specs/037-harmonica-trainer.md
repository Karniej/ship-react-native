---
rank: 37
name: "Harmonica Trainer"
slug: harmonica-trainer
status: WEAK
category: Music
build_time: week
pricing_tier: premium
primary_keyword: "harmonica"
keyword_popularity: 53
keyword_difficulty: 13
total_score: 32
top_competitor_reviews: 2600
suggested_features: []
---

# Harmonica Trainer

> Weak search signal — only build with a distribution plan beyond ASO.

## Concept

Beginner-friendly harmonica trainer with hole-by-hole tab playback, chord library, bending drills, and 7-day starter course. Differentiator: visual real-time fingering UI plus Apple Watch metronome companion that the aging incumbent lacks.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'harmonica' is pop 53 / diff 13, with 172 App Store apps, 1 qualifying tracked keyword, and broad or fuzzy intent (52/100). Competition is real at 2,600 captured reviews. It barely survives the keyword cutoff and should be treated as weak.

- Primary keyword: **"harmonica"** — popularity 53, difficulty 13
- Apps competing on the keyword: 172
- Total opportunity score: 32

## Target keywords (ASO)

- harmonica
- harmonica tab
- blues harmonica
- harmonica chord
- harp
- tuner
- scale
- trainer

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                       | Reviews | Rating |
| ------------------------- | ------- | ------ |
| Harmonica Real Pro        | 2,600   | 4.8    |
| Real Harmonica Simulator  | 11      | 1.5    |
| Harmonica Tab Pro         | 27      | 3.3    |
| Harmonica Bending Trainer | 35      | 4.5    |

## MVP features

- Hole-by-hole tab playback
- Chord library
- Bending drills
- 7-day starter course
- Real-time fingering visualization
- Apple Watch metronome companion

## Monetization

Hard paywall — free tabs teaser, premium for full library. $4.99/week or $39.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $4.99  | $9.99   | $39.99 | 7-day |

## Ship React Native mapping

No AI features detected — set CURRENT_TEMPLATE to 'custom' with all AI features disabled. The boilerplate still provides auth, payments, onboarding, analytics, and i18n.

- RevenueCat products: create weekly $4.99 / monthly $9.99 / annual $39.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): AVAudioEngine for tones; JSON tab library; Apple Watch companion; SwiftUI
