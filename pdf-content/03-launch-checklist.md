# Part 3: The Complete Launch Checklist

Print this out. Check every box. Ship with confidence.

---

## Development Checklist

### Project Setup

- [ ] Expo SDK on latest stable version
- [ ] TypeScript configured with strict mode
- [ ] ESLint and Prettier configured
- [ ] Git repository initialized
- [ ] `.gitignore` includes `.env` files
- [ ] Environment variables properly set up

### Authentication

- [ ] Email/password login works
- [ ] Apple Sign-In implemented (required if you have any auth)
- [ ] Google Sign-In implemented
- [ ] Logout clears all user data
- [ ] Session persists across app restarts
- [ ] Token refresh works correctly
- [ ] Password reset flow tested

### Core Features

- [ ] Main feature works as expected
- [ ] All CRUD operations tested
- [ ] Error states handled gracefully
- [ ] Loading states implemented
- [ ] Empty states designed
- [ ] Offline behavior defined

### Payments (if applicable)

- [ ] RevenueCat SDK integrated
- [ ] Products created in App Store Connect
- [ ] Products created in Google Play Console
- [ ] Sandbox testing completed (iOS)
- [ ] Test purchases work (Android)
- [ ] Restore purchases works
- [ ] Paywall displays correctly
- [ ] Entitlement checks gate features properly

### Data & Security

- [ ] Row Level Security enabled on ALL tables
- [ ] No API keys in client code
- [ ] Sensitive data in SecureStore (not AsyncStorage)
- [ ] Input validation on all user inputs
- [ ] No sensitive data in console.log
- [ ] HTTPS used everywhere

---

## Design & UX Checklist

### Visual Design

- [ ] Consistent color palette
- [ ] Typography hierarchy clear
- [ ] Dark mode supported
- [ ] Icons consistent style
- [ ] Proper spacing/margins
- [ ] No UI clipping or overflow

### User Experience

- [ ] Onboarding flow complete
- [ ] Navigation intuitive
- [ ] Back buttons work correctly
- [ ] Pull-to-refresh where expected
- [ ] Haptic feedback on key actions
- [ ] Keyboard dismisses appropriately
- [ ] Forms validate in real-time

### Accessibility

- [ ] Text readable at all sizes
- [ ] Touch targets 44pt minimum
- [ ] Colors have sufficient contrast
- [ ] Screen reader labels added
- [ ] Supports Dynamic Type (iOS)

### Performance

- [ ] App starts in < 3 seconds
- [ ] Animations run at 60fps
- [ ] Images optimized and cached
- [ ] No memory leaks
- [ ] Lists virtualized (FlatList)
- [ ] Bundle size reasonable (< 50MB)

---

## App Store Assets Checklist

### App Icon

- [ ] 1024x1024 PNG created
- [ ] No transparency (App Store requirement)
- [ ] No alpha channel
- [ ] Looks good at small sizes
- [ ] Distinct from competitors
- [ ] No text (usually)

### Screenshots (iOS)

| Device         | Resolution  | Required        |
| -------------- | ----------- | --------------- |
| iPhone 6.7"    | 1290 x 2796 | Yes             |
| iPhone 6.5"    | 1284 x 2778 | Yes             |
| iPhone 5.5"    | 1242 x 2208 | No              |
| iPad Pro 12.9" | 2048 x 2732 | If iPad support |

- [ ] 4-10 screenshots per device size
- [ ] First screenshot is most important
- [ ] Show key features
- [ ] Include text overlays explaining value
- [ ] Consistent design across all screenshots

### Screenshots (Android)

| Type       | Resolution          | Required          |
| ---------- | ------------------- | ----------------- |
| Phone      | 1080 x 1920 minimum | Yes               |
| 7" Tablet  | 1200 x 1920         | If tablet support |
| 10" Tablet | 1800 x 2560         | If tablet support |

- [ ] 2-8 screenshots
- [ ] Feature graphic (1024 x 500)
- [ ] High-res icon (512 x 512)

### App Preview Video (Optional)

- [ ] 15-30 seconds length
- [ ] Shows app in action
- [ ] No hands in frame (iOS)
- [ ] Captures at correct resolution
- [ ] Audio is app audio or none

---

## App Store Listing Checklist

### App Information (Both Platforms)

- [ ] App name (30 characters max)
- [ ] Subtitle/short description (30-80 chars)
- [ ] Full description written
- [ ] Keywords/tags optimized
- [ ] Category selected correctly
- [ ] Support URL live
- [ ] Privacy policy URL live
- [ ] Marketing URL (optional)

### iOS Specific

- [ ] App Store Connect account ready
- [ ] Bundle ID matches app.json
- [ ] SKU defined
- [ ] Content rights declared
- [ ] Age rating questionnaire complete
- [ ] Export compliance answered
- [ ] IDFA usage declared

### Android Specific

- [ ] Google Play Console account ready
- [ ] Package name matches app.json
- [ ] Content rating questionnaire complete
- [ ] Target audience declared
- [ ] Data safety section complete
- [ ] App access instructions (if login required)

---

## Legal & Compliance Checklist

### Required Documents

- [ ] Privacy Policy (link in app + stores)
- [ ] Terms of Service (recommended)
- [ ] EULA (for subscriptions)

### Privacy Policy Must Include

- [ ] What data you collect
- [ ] How you use the data
- [ ] Third-party services used
- [ ] Data retention policy
- [ ] User rights (GDPR/CCPA)
- [ ] Contact information
- [ ] Last updated date

### GDPR Compliance (if EU users)

- [ ] Consent for data collection
- [ ] Right to data export
- [ ] Right to data deletion
- [ ] Cookie/tracking consent
- [ ] Data processing agreements with vendors

### Apple Requirements

- [ ] Apple Sign-In if any social auth
- [ ] In-app purchase for digital goods
- [ ] No external payment links
- [ ] Kids category rules (if applicable)

### Google Requirements

- [ ] Target API level current
- [ ] Families policy compliance (if applicable)
- [ ] No incentivized reviews

---

## Pre-Submission Testing Checklist

### Device Testing

- [ ] Tested on iPhone (recent model)
- [ ] Tested on iPhone (older model)
- [ ] Tested on Android phone
- [ ] Tested on tablet (if supported)
- [ ] Tested with slow network
- [ ] Tested with no network

### Flow Testing

- [ ] Fresh install flow
- [ ] Upgrade from free to paid
- [ ] Logout and login again
- [ ] Kill app and reopen
- [ ] Background to foreground
- [ ] Deep links work

### Edge Cases

- [ ] Very long text inputs
- [ ] Special characters in inputs
- [ ] Maximum file size uploads
- [ ] Rapid button tapping
- [ ] Orientation changes (if supported)

---

## Build & Submit Checklist

### Pre-Build

- [ ] Version number incremented
- [ ] Build number incremented
- [ ] All console.log removed (or production-safe)
- [ ] Debug code removed
- [ ] Environment variables for production

### EAS Build

```bash
# Verify configuration
eas build:configure

# Build for production
eas build --platform all --profile production

# Check build status
eas build:list
```

- [ ] Build completes successfully
- [ ] Download and test the build
- [ ] Install on real device
- [ ] All features work in production build

### Submit

```bash
# iOS
eas submit --platform ios

# Android
eas submit --platform android
```

- [ ] Submission accepted
- [ ] All metadata complete
- [ ] No errors or warnings

---

## Post-Launch Checklist

### Monitoring Setup

- [ ] Sentry error tracking enabled
- [ ] RevenueCat dashboards accessible
- [ ] Analytics tracking key events
- [ ] Push notification setup (optional)

### Marketing

- [ ] Product Hunt launch planned (optional)
- [ ] Social media announcement ready
- [ ] App review request implemented
- [ ] Email announcement ready

### Maintenance Plan

- [ ] Bug tracking system ready
- [ ] User feedback channel set up
- [ ] Update schedule planned
- [ ] Backup and recovery plan

---

## Quick Reference: Version Numbers

```json
// app.json
{
  "expo": {
    "version": "1.0.0", // User-facing version
    "ios": {
      "buildNumber": "1" // Increment each build
    },
    "android": {
      "versionCode": 1 // Increment each build
    }
  }
}
```

**Rule:** Version can stay same, buildNumber/versionCode must always increase.

---

## Emergency Fixes

### If App Gets Rejected

1. Read the rejection reason carefully
2. Don't panic - most are easy fixes
3. Fix the issue
4. Increment build number
5. Rebuild and resubmit
6. Add notes explaining the fix

### Common Quick Fixes

| Rejection              | Fix                  |
| ---------------------- | -------------------- |
| Broken link            | Update URL, resubmit |
| Missing privacy policy | Add policy, link it  |
| Crasher bug            | Fix, test, rebuild   |
| Incomplete metadata    | Fill missing fields  |
| Login issues           | Add demo account     |

---

**Next:** AI prompts to create professional app icons and where to find screenshot templates.
