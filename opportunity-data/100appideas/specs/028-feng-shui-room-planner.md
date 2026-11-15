---
rank: 28
name: "Feng Shui Room Planner"
slug: feng-shui-room-planner
status: MODERATE
category: Lifestyle
build_time: week
pricing_tier: entry
primary_keyword: "feng shui"
keyword_popularity: 22
keyword_difficulty: 17
total_score: 37
top_competitor_reviews: 79
suggested_features: [imageIdentification]
---

# Feng Shui Room Planner

> Decent signal — build it lean, validate fast.

## Concept

Feng Shui compass and room planner for home layout decisions. Users scan or photograph a room, overlay a Bagua map, calculate Kua number and lucky directions, then get placement checklists for bed, desk, doors, mirrors, plants, and colors.

## Validation data

RANKING AUDIT 2026-05-11: ranking keyword 'feng shui' is pop 22 / diff 17, with 214 App Store apps, 1 qualifying tracked keyword, and broad or fuzzy intent (65/100). Captured direct competitors are small at 79 reviews. It survives, but no longer ranks as an obvious top build.

- Primary keyword: **"feng shui"** — popularity 22, difficulty 17
- Apps competing on the keyword: 214
- Total opportunity score: 37

## Target keywords (ASO)

- feng shui
- feng shui compass
- bagua map
- kua number
- feng shui room
- room planner
- home energy
- lucky directions

Use the primary keyword in the App Store title (≤30 chars). Spread the rest across
subtitle (≤30 chars) and the 100-char iOS keyword field — no duplicates between fields.

## Competition

| App                          | Reviews | Rating |
| ---------------------------- | ------- | ------ |
| Chinese Feng Shui Tool Kit   | 1,607   | 4.6    |
| RoomFlow - Feng Shui Design  | 79      | 4.6    |
| Feng Shui Design by FengFlow | 54      | 4.4    |
| HarmonySpace - Feng Shui     | 135     | 4.3    |
| Fengshui Theory              | 85      | 4.7    |

## MVP features

- Compass-based facing direction
- Bagua map room overlay
- Kua number and lucky directions
- Room photo annotations
- Furniture placement checklist
- Daily home improvement tips

## Monetization

Freemium - one room and compass free, premium for unlimited rooms, Bagua overlays, Kua profile, saved plans, and exports. $4.99/week or $24.99/year.

| Weekly | Monthly | Annual | Trial |
| ------ | ------- | ------ | ----- |
| $4.99  | $9.99   | $24.99 | 7-day |

## Ship React Native mapping

Set CURRENT_TEMPLATE to 'custom' and enable only: imageIdentification.

- RevenueCat products: create weekly $4.99 / monthly $9.99 / annual $24.99 with a 7-day trial and map them in `src/constants/config.ts` (`PRODUCT_IDS`).
- Original implementation notes (written for native iOS — adapt to React Native/Expo): SwiftUI; Core Location compass; PhotosUI room imports; Vision overlay positioning; SwiftData; Content database
