# Appendix B: App Store & Play Store Setup

Step-by-step guide to setting up your developer accounts and configuring your apps.

---

## Apple Developer Account

### 1. Create Account

1. Go to [developer.apple.com](https://developer.apple.com)
2. Click "Account" → "Create Apple ID" (if needed)
3. Enroll in Apple Developer Program ($99/year)
4. Wait for approval (usually 24-48 hours)

### 2. Create App ID

1. Go to [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list)
2. Click "+" to add new identifier
3. Select "App IDs" → Continue
4. Select "App" → Continue
5. Fill in:
   - Description: Your App Name
   - Bundle ID: `com.yourcompany.yourapp` (must match app.json)
6. Enable capabilities you need:
   - Push Notifications
   - Sign in with Apple
   - Associated Domains (for deep links)
7. Click "Continue" → "Register"

### 3. Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+"→ "New App"
3. Fill in:
   - Platform: iOS
   - Name: Your App Name (30 chars max)
   - Primary Language: English (or your language)
   - Bundle ID: Select the one you created
   - SKU: A unique ID (e.g., `yourapp-ios-001`)
   - User Access: Full Access
4. Click "Create"

### 4. Configure App Information

In App Store Connect → Your App:

**App Information:**

- Subtitle (30 chars)
- Category (Primary & Secondary)
- Content Rights
- Age Rating (complete questionnaire)

**Pricing and Availability:**

- Price: Free or select price tier
- Availability: Select countries

**App Privacy:**

- Privacy Policy URL (required)
- Complete Data Collection survey

---

## Google Play Developer Account

### 1. Create Account

1. Go to [play.google.com/console](https://play.google.com/console)
2. Sign in with Google Account
3. Pay registration fee ($25 one-time)
4. Complete account details
5. Verify identity (may take 48 hours)

### 2. Create App

1. Click "Create app"
2. Fill in:
   - App name
   - Default language
   - App or Game
   - Free or Paid
3. Accept declarations
4. Click "Create app"

### 3. Set Up Store Listing

**Main store listing:**

- Short description (80 chars)
- Full description (4000 chars)
- App icon (512x512)
- Feature graphic (1024x500)
- Screenshots

**Store settings:**

- App category
- Contact details
- External marketing

### 4. Complete Required Sections

Before you can release:

**App content:**

- Privacy policy URL
- Ads declaration
- App access (demo credentials if login required)
- Content rating (complete questionnaire)
- Target audience
- News apps declaration
- COVID-19 apps declaration
- Data safety

**Releases:**

- Create internal/closed/open testing track
- Or production release

---

## Setting Up In-App Purchases

### iOS: App Store Connect

1. Go to App Store Connect → Your App → Features → In-App Purchases
2. Click "+" to add:
   - Select type (Auto-Renewable Subscription recommended)
   - Reference Name: Internal name
   - Product ID: `com.yourcompany.yourapp.pro_monthly`
3. Configure subscription:
   - Subscription Group: Create new (e.g., "Pro")
   - Duration: 1 Month
   - Price: Select tier
   - Localizations: Add display name and description
4. Review information

**For subscription groups:**

1. Go to Features → Subscriptions → Subscription Groups
2. Create group with multiple tiers:
   - Pro Monthly: $4.99/month
   - Pro Yearly: $29.99/year (save 50%)

### Android: Google Play Console

1. Go to Play Console → Your App → Monetize → Products → Subscriptions
2. Click "Create subscription"
3. Fill in:
   - Product ID: `pro_monthly` (must match RevenueCat)
   - Name: Pro Monthly
   - Description: Full access to all features
4. Add base plan:
   - Duration: 1 month
   - Price: $4.99
   - Free trial: Optional (e.g., 7 days)
5. Activate subscription

**Add yearly plan:**

- Same process with 1 year duration
- Price: $29.99

---

## Connecting to RevenueCat

### 1. Create RevenueCat Account

1. Go to [revenuecat.com](https://www.revenuecat.com)
2. Sign up for free account
3. Create new project

### 2. Add iOS App

1. Go to Project Settings → Apps → "+ New"
2. Select "App Store"
3. Enter:
   - App name
   - Bundle ID (from App Store Connect)
   - App Store Connect App-Specific Shared Secret:
     - Get from: App Store Connect → Your App → App Information → App-Specific Shared Secret → "Manage"
     - Generate and copy secret
4. Save

### 3. Add Android App

1. Go to Project Settings → Apps → "+ New"
2. Select "Play Store"
3. Enter:
   - App name
   - Package name (from app.json)
   - Service Account Credentials JSON:
     - Get from: Play Console → Setup → API access
     - Create new service account
     - Grant "View financial data" permission
     - Download JSON key
4. Upload JSON and save

### 4. Create Products in RevenueCat

1. Go to Products → "+ New"
2. Add each product:
   - Identifier: `pro_monthly`
   - App Store Product ID: `com.yourcompany.yourapp.pro_monthly`
   - Play Store Product ID: `pro_monthly`

### 5. Create Entitlements

1. Go to Entitlements → "+ New"
2. Create "pro" entitlement
3. Attach all products that grant pro access

### 6. Create Offerings

1. Go to Offerings → "+ New"
2. Create "default" offering
3. Add packages:
   - Monthly ($monthly package)
   - Annual ($annual package)

### 7. Get API Keys

1. Go to Project Settings → API Keys
2. Copy:
   - iOS public key: `appl_xxxxx`
   - Android public key: `goog_xxxxx`
3. Add to your app's environment variables

---

## EAS Configuration

### 1. Configure eas.json

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "XXXXXXXXXX"
      },
      "android": {
        "serviceAccountKeyPath": "./path-to-key.json",
        "track": "internal"
      }
    }
  }
}
```

### 2. Get Required Values

**iOS:**

- `appleId`: Your Apple ID email
- `ascAppId`: From App Store Connect URL (the number after `/app/`)
- `appleTeamId`: From [developer.apple.com/account](https://developer.apple.com/account) → Membership → Team ID

**Android:**

- `serviceAccountKeyPath`: Path to the JSON key file from Play Console

### 3. Build and Submit

```bash
# Build for production
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## Pre-Submission Checklist

### iOS

- [ ] App icon uploaded (1024x1024)
- [ ] Screenshots for required device sizes
- [ ] App description and keywords
- [ ] Privacy policy URL
- [ ] Age rating completed
- [ ] Export compliance answered
- [ ] IDFA declaration (if using ads/analytics)
- [ ] Sign in with Apple implemented (if any auth)
- [ ] In-app purchases configured (if applicable)
- [ ] App review notes (demo account if needed)

### Android

- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (phone + tablet if applicable)
- [ ] Short and full descriptions
- [ ] Privacy policy URL
- [ ] Content rating completed
- [ ] Target audience declared
- [ ] Data safety form completed
- [ ] App access instructions (if login required)

---

## Common Rejection Reasons & Fixes

### iOS

| Rejection                           | Fix                         |
| ----------------------------------- | --------------------------- |
| Guideline 4.8 - No Apple Sign-In    | Add Apple Sign-In           |
| Guideline 3.1.1 - External payments | Use IAP for digital goods   |
| Guideline 2.1 - App Completeness    | Fix crashes, add content    |
| Guideline 5.1.1 - No privacy policy | Add privacy policy URL      |
| Metadata Rejected                   | Fix screenshots/description |

### Android

| Rejection                    | Fix                             |
| ---------------------------- | ------------------------------- |
| Policy violation - Deceptive | Update description to match app |
| Data safety inaccurate       | Complete data safety form       |
| Missing target audience      | Declare target audience         |
| APK invalid                  | Rebuild with correct signing    |

---

## Testing Before Release

### iOS TestFlight

```bash
# Build for TestFlight
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios
```

Then in App Store Connect:

1. Wait for processing (15-30 min)
2. Add testers (internal or external)
3. External testing requires App Review

### Android Internal Testing

```bash
# Build for Android
eas build --platform android --profile production

# Submit to internal track
eas submit --platform android
```

Then in Play Console:

1. Go to Release → Testing → Internal testing
2. Create release
3. Add testers by email

---

## Useful Links

**Apple:**

- [App Store Connect](https://appstoreconnect.apple.com)
- [Developer Portal](https://developer.apple.com/account)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

**Google:**

- [Play Console](https://play.google.com/console)
- [Play Store Policies](https://play.google.com/about/developer-content-policy/)
- [Material Design Guidelines](https://m3.material.io/)

**RevenueCat:**

- [RevenueCat Dashboard](https://app.revenuecat.com)
- [Documentation](https://www.revenuecat.com/docs)

---

**Pro Tip:** Set up your accounts and in-app purchases early. Apple's review for subscription apps can take longer, and Play Console identity verification can take 48+ hours.
