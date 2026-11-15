# App Store Listing Template

> Boilerplate template for creating App Store Connect listings for hard-paywalled subscription apps.
> Based on the proven Mori (Stoic Death Clock) listing structure.
> Use `asc` CLI to push these listings to App Store Connect.

---

## Required Fields

| Field                  | Limit      | Notes                                                                         |
| ---------------------- | ---------- | ----------------------------------------------------------------------------- |
| **App Name**           | 30 chars   | Brand name + descriptor. Must match what's in `app.json`                      |
| **Subtitle**           | 30 chars   | Key value prop, keyword-rich                                                  |
| **Keywords**           | 100 chars  | Comma-separated, no spaces after commas, no duplicates of name/subtitle words |
| **Description**        | 4000 chars | Features + **subscription disclosure** (REQUIRED for hard paywall)            |
| **What's New**         | 4000 chars | Release notes for each version                                                |
| **Support URL**        | required   | Link to support page                                                          |
| **Privacy Policy URL** | required   | Link to privacy policy                                                        |

---

## Description Structure (Hard Paywall Apps)

Every hard-paywalled app description MUST follow this structure:

```
[APP NAME] is a [one-line value proposition].

[2-3 sentences expanding on what the app does and who it's for.]

Features include:
- [Feature 1]
- [Feature 2]
- [Feature 3]
- [Feature 4]
- [Feature 5]

[APP NAME] Pro subscription unlocks all features including [list key locked features]. A weekly subscription is available at [PRICE]/week. A lifetime purchase option is also available. Payment will be charged to your Apple ID account at confirmation of purchase. The subscription automatically renews unless it is canceled at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period. You can manage and cancel your subscriptions by going to your App Store account settings after purchase.

[Optional disclaimer if applicable, e.g., "not medical advice".]

Terms of Use: https://yourdomain.com/apps/[APP_SLUG]/terms
Privacy Policy: https://yourdomain.com/apps/[APP_SLUG]/privacy
```

### Why This Structure Matters

Apple **requires** subscription disclosure in the description for apps with auto-renewable subscriptions. Missing this = rejection. The paragraph above covers:

- What the subscription unlocks
- Price
- Auto-renewal terms
- How to cancel
- Links to Terms & Privacy

---

## ASC CLI Commands

### Create app in App Store Connect

```bash
asc apps create \
  --name "App Name" \
  --bundle-id "com.yourcompany.appslug" \
  --sku "com.yourcompany.appslug"
```

### Set app store listing

```bash
asc apps info edit \
  --app "APP_ID" \
  --locale "en-US" \
  --description "Full description here..." \
  --keywords "keyword1,keyword2,keyword3" \
  --support-url "https://yourdomain.com/apps" \
  --whats-new "Initial release"
```

### Set subtitle (via appInfo)

```bash
asc apps info edit \
  --app "APP_ID" \
  --locale "en-US" \
  --subtitle "Your Subtitle Here"
```

---

## Reference: Mori (Approved & Live)

**App Name**: `Mori: Stoic Death Clock`
**Subtitle**: (set in App Store Connect)
**Keywords**: `memento mori,stoic,life calendar,weeks,countdown,quotes,widget,reflection,time,purpose`

**Description**:

```
Mori is a calm companion for philosophical reflection and intentional living.

See your life as a calendar in weeks, follow an approximate countdown, and return each day to carefully chosen Stoic quotes. With widgets and Live Activities, Mori keeps perspective close without demanding attention.

Features include:
- Life calendar in weeks
- Countdown and death clock
- Daily Stoic quotes
- Widgets and Live Activities
- WHO-based life estimate as a rough approximation

Mori Pro subscription unlocks all features including the life calendar, death clock, daily quotes, widgets, and Live Activities. A weekly subscription is available at $4.99/week. A lifetime purchase option is also available. Payment will be charged to your Apple ID account at confirmation of purchase. The subscription automatically renews unless it is canceled at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period. You can manage and cancel your subscriptions by going to your App Store account settings after purchase.

Mori is not medical advice and does not predict lifespan. The estimate is based on public WHO life-expectancy data and is meant only as a reflective tool.

Terms of Use: https://yourdomain.com/apps/memento/terms
Privacy Policy: https://yourdomain.com/apps/memento/privacy
```
