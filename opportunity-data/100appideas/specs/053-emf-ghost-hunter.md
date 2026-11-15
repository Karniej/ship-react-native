---
rank: 53
name: "EMF Ghost Hunter"
slug: emf-ghost-hunter
status: DEAD
category: Entertainment
build_time: week
pricing_tier: premium
primary_keyword: "emf detector"
keyword_popularity: 27
keyword_difficulty: 23
total_score: 20
top_competitor_reviews: 8982
suggested_features: [imageIdentification]
---

# EMF Ghost Hunter

> Do NOT build as-is — no search volume. Kept for reference only.

## Concept

Ghost-hunting EMF + spirit-box combo for paranormal hobbyists / prank-cam content creators. iPhone magnetometer for EMF spike detection, ambient mic spectrogram for voice anomalies, themed haunted-house UI, log readings to a haunted map.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'emf reader' is pop 27 / diff 23, with 214 App Store apps, 1 qualifying tracked keyword, and exact app-intent (100/100). Competition is real at 8,982 captured reviews. It stays dead/monitor-only despite any old score.

- Primary keyword: **"emf detector"** — popularity 27, difficulty 23
- Apps competing on the keyword: 214
- Total opportunity score: 20

## Target keywords (ASO)

- emf detector
- emf reader
- ghost hunting
- spirit box
- paranormal
- haunted
- magnetometer

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                            | Reviews | Rating |
| ------------------------------ | ------- | ------ |
| EMF Radiation Detector Reader  | 4,391   | 4.5    |
| EMF Analytics                  | 62      | 4.1    |
| Ghost Finder EMF               | 11      | 2.3    |
| Ghost Hunting Tools - Detector | 8,982   | 4.2    |
| GhostTube SLS Camera           | 8,550   | 4.6    |

## MVP features

- Magnetometer-based EMF spike detection
- Ambient mic FFT for voice anomalies
- Themed haunted-house UI
- Haunted-spot map logging
- Custom paranormal sound packs
- Investigation history

## Monetization

Hard paywall. $4.99/week or $39.99/year. Paranormal entertainment converts well on TikTok-driven impulse installs.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $4.99  | $9.99   | $39.99 | 7-day |

## Ship React Native mapping

Set CURRENT_TEMPLATE to 'custom' and enable only: imageIdentification.

- RevenueCat products: create weekly $4.99 / monthly $9.99 / annual $39.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): CMMotionManager (magnetometer); AVAudioEngine (FFT); MapKit; SwiftUI
