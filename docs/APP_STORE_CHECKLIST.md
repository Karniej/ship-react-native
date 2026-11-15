# App Store Submission Checklist

Complete guide for submitting your app to Apple App Store and Google Play Store.

## Table of Contents

- [Pre-Submission Checklist](#pre-submission-checklist)
- [Apple App Store](#apple-app-store)
- [Google Play Store](#google-play-store)
- [Screenshots & Graphics](#screenshots--graphics)
- [App Store Optimization](#app-store-optimization)
- [Common Rejection Reasons](#common-rejection-reasons)

---

## Pre-Submission Checklist

Complete these before submitting to either store:

### App Configuration

- [ ] Update `app.json` with production values
  - [ ] Set correct `name` and `slug`
  - [ ] Update `version` (e.g., "1.0.0")
  - [ ] Set `ios.buildNumber` (increment for each build)
  - [ ] Set `android.versionCode` (increment for each build)
  - [ ] Update `bundleIdentifier` (iOS)
  - [ ] Update `package` (Android)

### Assets

- [ ] App icon (1024x1024, no alpha/transparency for iOS)
- [ ] Adaptive icon for Android
- [ ] Splash screen
- [ ] App Store screenshots (all required sizes)
- [ ] Feature graphic (Google Play)

### Icons & Splash Screens

- [ ] Generate app icon and splash screen (see `docs/ICON_AND_SPLASH_GENERATION.md` if available)
- [ ] Verify icon renders well at all sizes (small home screen icon to large App Store listing)
- [ ] Test splash screen on multiple device sizes
- [ ] Ensure adaptive icon safe zones are respected on Android

### Testing

- [ ] All features work on iOS and Android
- [ ] Test on physical devices (not just simulators)
- [ ] Test in production mode: `npx expo start --no-dev`
- [ ] Verify deep links work
- [ ] Test push notifications
- [ ] Test in-app purchases with sandbox accounts

### Legal & Privacy

- [ ] Privacy policy URL (required)
- [ ] Terms of service URL (required for subscriptions)
- [ ] App uses only required permissions
- [ ] GDPR compliance (if applicable)
- [ ] CCPA compliance (if applicable)
- [ ] Data collection disclosure prepared

### Performance

- [ ] App launches within 5 seconds
- [ ] No crashes on startup
- [ ] Smooth animations (60fps)
- [ ] Reasonable app size (< 150MB recommended)

---

## Apple App Store

### Requirements

#### Developer Account

- [ ] Enrolled in Apple Developer Program ($99/year)
- [ ] Created App ID in Developer Portal
- [ ] Generated Distribution Certificate
- [ ] Created Provisioning Profile

#### App Store Connect Setup

- [ ] Created app in App Store Connect
- [ ] Set app category (primary and secondary)
- [ ] Added keywords (100 characters max)
- [ ] Written description (4000 characters max)
- [ ] Added promotional text (170 characters)
- [ ] Set content rating (via questionnaire)
- [ ] Added support URL
- [ ] Added marketing URL (optional)

### Required Screenshots

| Device                   | Size      | Required    |
| ------------------------ | --------- | ----------- |
| iPhone 6.7"              | 1290x2796 | Yes         |
| iPhone 6.5"              | 1284x2778 | Yes         |
| iPhone 5.5"              | 1242x2208 | Yes         |
| iPad Pro 12.9"           | 2048x2732 | If iPad app |
| iPad Pro 12.9" (6th gen) | 2064x2752 | If iPad app |

### In-App Purchase Setup

- [ ] Create products in App Store Connect
- [ ] Configure RevenueCat with App Store Connect credentials
- [ ] Shared Secret for receipt validation
- [ ] Test with Sandbox tester accounts
- [ ] Configure subscription groups

### Build & Submit

```bash
# Build for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### Review Information

- [ ] App demo account (if login required)
- [ ] Notes for reviewers (explain any special features)
- [ ] Contact information

### Common iOS Review Times

- First submission: 24-48 hours
- Updates: 24-48 hours
- Expedited review: Request if critical bug fix

---

## Google Play Store

### Requirements

#### Developer Account

- [ ] Registered Google Play Developer account ($25 one-time)
- [ ] Accepted Developer Distribution Agreement
- [ ] Set up Google Play Console

#### Store Listing Setup

- [ ] App title (50 characters max)
- [ ] Short description (80 characters max)
- [ ] Full description (4000 characters max)
- [ ] Set app category
- [ ] Set content rating (via questionnaire)
- [ ] Added privacy policy URL

### Required Graphics

| Asset             | Size         | Required      |
| ----------------- | ------------ | ------------- |
| Feature graphic   | 1024x500     | Yes           |
| Phone screenshots | 16:9 or 9:16 | 2 minimum     |
| 7-inch tablet     | 16:9 or 9:16 | If tablet app |
| 10-inch tablet    | 16:9 or 9:16 | If tablet app |
| App icon          | 512x512      | Yes           |

### In-App Purchase Setup

- [ ] Create products in Google Play Console
- [ ] Configure RevenueCat with Google Play credentials
- [ ] Add Service Account JSON key
- [ ] Test with license testers
- [ ] Configure subscription base plans

### Build & Submit

```bash
# Build for Play Store
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### Release Tracks

| Track            | Purpose                            |
| ---------------- | ---------------------------------- |
| Internal testing | Up to 100 testers, instant publish |
| Closed testing   | Invite-only, review required       |
| Open testing     | Public opt-in, review required     |
| Production       | Full release, review required      |

### Data Safety Section

Complete the Data Safety form:

- [ ] Data collection practices declared
- [ ] Data sharing practices declared
- [ ] Data security practices described
- [ ] Data deletion option provided

---

## Screenshots & Graphics

### Best Practices

1. **Show the app in action** - Real screenshots, not mockups
2. **Highlight key features** - First 2 screenshots are most important
3. **Use captions** - Explain benefits, not features
4. **Maintain consistency** - Same style across all screenshots
5. **Localize** - Translate for each language

### Recommended Tools

- [Figma App Store Template](https://www.figma.com/community)
- [Fastlane Frameit](https://docs.fastlane.tools/actions/frameit/)
- [AppLaunchpad](https://theapplaunchpad.com/)
- [Screenshots Pro](https://screenshots.pro/)

### Screenshot Tips

```
✅ DO:
- Show actual app UI
- Use device frames (optional but professional)
- Include status bar
- Show dark and light modes (if applicable)

❌ DON'T:
- Use excessive text
- Show prices (different per region)
- Include personal information
- Use screenshots from different app versions
```

---

## App Store Optimization (ASO)

### Keywords Strategy

**iOS (100 characters):**

- Separate with commas, no spaces after comma
- Don't repeat words already in title
- Use singular or plural, not both

**Android (no character limit for description):**

- Include keywords naturally in description
- Repeat important keywords 3-5 times
- Use bullet points for features

### Title Optimization

```
Format: [Brand Name] - [Benefit/Feature]

Examples:
✅ "PhotoAI - Create Amazing Images"
✅ "VoiceGen - Text to Speech AI"
❌ "Best AI App for Photos and Images Generator"
```

### Description Template

```
[Hook - First sentence is crucial]

[Key benefits - 3-5 bullet points]
• Benefit 1
• Benefit 2
• Benefit 3

[How it works - Brief explanation]

[Features list]

[Social proof - Awards, reviews, press]

[Call to action]
```

---

## Common Rejection Reasons

### Apple App Store

| Reason                                    | Solution                                 |
| ----------------------------------------- | ---------------------------------------- |
| **Guideline 2.1 - Crashes**               | Test thoroughly on physical devices      |
| **Guideline 2.3 - Metadata**              | Ensure screenshots match app             |
| **Guideline 3.1.1 - In-App Purchase**     | Use Apple's IAP for digital goods        |
| **Guideline 4.2 - Minimum Functionality** | Ensure app provides value beyond website |
| **Guideline 5.1.1 - Privacy**             | Request only needed permissions          |
| **Guideline 5.1.2 - Data Use**            | Clearly explain data collection          |

### Google Play Store

| Reason                   | Solution                                   |
| ------------------------ | ------------------------------------------ |
| **Impersonation**        | Don't use other brand names/logos          |
| **Spam**                 | Don't keyword stuff description            |
| **Privacy violation**    | Complete Data Safety form honestly         |
| **Restricted content**   | Ensure AI-generated content is appropriate |
| **Broken functionality** | Test all features thoroughly               |

---

## Post-Launch Checklist

- [ ] Monitor crash reports (Sentry, Crashlytics)
- [ ] Respond to reviews within 24 hours
- [ ] Track key metrics (DAU, retention, conversion)
- [ ] Plan regular updates (every 2-4 weeks)
- [ ] A/B test screenshots and descriptions
- [ ] Monitor for policy changes

---

## Resources

- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Developer Policy Center](https://play.google.com/about/developer-content-policy/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [RevenueCat Setup Guide](https://www.revenuecat.com/docs/getting-started)
