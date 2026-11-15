# Landing Page Template

> Template for an app landing page at `yourdomain.com/apps/[appname]`.

---

## Required Pages

Each app needs three pages:

| Page           | URL                                     | Purpose                              |
| -------------- | --------------------------------------- | ------------------------------------ |
| Landing page   | `yourdomain.com/apps/[appname]`         | Marketing, download CTA              |
| Privacy Policy | `yourdomain.com/apps/[appname]/privacy` | Required by App Store and Play Store |
| Terms of Use   | `yourdomain.com/apps/[appname]/terms`   | Required for subscription apps       |

---

## Landing Page Structure

### 1. Hero Section

```
[App Icon]
[App Name]
[Tagline -- same as App Store subtitle]

[Download on the App Store] [Get it on Google Play]
```

- Background: brand primary color or gradient
- App icon: 256x256 rounded corners
- Both store badges visible (even if only one platform is live initially)

### 2. Feature List

3-5 features with icons. Reuse the paywall benefits from `src/constants/paywall.ts`:

```
[Icon] [Feature Title]
       [Feature Description -- one sentence]

[Icon] [Feature Title]
       [Feature Description]

[Icon] [Feature Title]
       [Feature Description]
```

### 3. Screenshots

Show 3-4 app screenshots. Use the same screenshots from the App Store listing, displayed in a phone mockup frame.

### 4. Pricing Section

```
Choose Your Plan

[Weekly Plan]
$7.99/week
Full access to all features

[Yearly Plan] -- BEST VALUE
$49.99/year (7-day free trial)
Save over 80% compared to weekly
```

### 5. FAQ Section

Standard questions for subscription apps:

```
Q: How does the free trial work?
A: Start your 7-day free trial with the yearly plan. You won't be
   charged until the trial ends. Cancel anytime during the trial
   at no cost.

Q: Can I cancel my subscription?
A: Yes, you can cancel anytime through your App Store or Google Play
   account settings. Your access continues until the end of the
   current billing period.

Q: How do I restore my purchase?
A: Open the app, go to the premium screen, and tap "Restore Purchases"
   at the bottom.

Q: What payment methods are accepted?
A: All payments are processed securely through the App Store (iOS) or
   Google Play (Android). We never see or store your payment details.
```

### 6. Download CTA (Bottom)

```
Ready to get started?

[Download on the App Store] [Get it on Google Play]
```

---

## SEO Meta Tags Template

```html
<title>[App Name] - [Primary Keyword] App | [Your Company]</title>
<meta
  name="description"
  content="[App Name] [primary value prop]. [Secondary value prop]. Available on iOS and Android."
/>
<meta name="keywords" content="[app name], [keyword1], [keyword2], [keyword3], [platform] app" />

<!-- Open Graph -->
<meta property="og:title" content="[App Name] - [Tagline]" />
<meta property="og:description" content="[Same as meta description]" />
<meta property="og:image" content="https://yourdomain.com/apps/[appname]/og-image.png" />
<meta property="og:url" content="https://yourdomain.com/apps/[appname]" />
<meta property="og:type" content="website" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="[App Name] - [Tagline]" />
<meta name="twitter:description" content="[Same as meta description]" />
<meta name="twitter:image" content="https://yourdomain.com/apps/[appname]/og-image.png" />

<!-- App Links -->
<meta property="al:ios:app_store_id" content="[ASC_APP_ID]" />
<meta property="al:ios:app_name" content="[App Name]" />
<meta property="al:ios:url" content="[yourapp]://" />
<meta name="apple-itunes-app" content="app-id=[ASC_APP_ID]" />
```

OG image: 1200x630px, brand colors, app icon + tagline.

---

## Privacy Policy Template

The privacy policy must cover:

1. **What data is collected** -- analytics (PostHog), crash reports (Sentry), purchase history (RevenueCat), photos/camera (if applicable)
2. **How data is used** -- app improvement, crash fixing, subscription management
3. **Third-party services** -- list each: PostHog, Sentry, RevenueCat, OpenAI (if AI features)
4. **Data retention** -- how long data is kept
5. **User rights** -- how to request data deletion (email to contact@yourdomain.com)
6. **Children's privacy** -- state the app is not intended for children under 13
7. **Contact** -- contact@yourdomain.com

---

## Terms of Use Template

The terms must cover:

1. **Subscription terms** -- this is the most important section for Apple review:

```
SUBSCRIPTION TERMS

[App Name] offers auto-renewable subscriptions:

- Weekly Plan: $7.99 per week
- Yearly Plan: $49.99 per year (includes a 7-day free trial)

Payment will be charged to your Apple ID account (iOS) or Google Play
account (Android) at the confirmation of purchase.

Your subscription automatically renews unless auto-renew is turned off
at least 24 hours before the end of the current period.

Your account will be charged for renewal within 24 hours prior to the
end of the current period at the same price.

You can manage and cancel your subscriptions by going to your account
settings on the App Store or Google Play Store after purchase.

Any unused portion of a free trial period will be forfeited when the
user purchases a subscription.
```

2. **Acceptable use** -- no illegal activity, no reverse engineering
3. **Intellectual property** -- app content belongs to [Your Company]
4. **Disclaimers** -- app provided "as is", not liable for damages
5. **Governing law** -- jurisdiction
6. **Contact** -- contact@yourdomain.com

---

## Assets Checklist

- [ ] App icon (256x256 for web, PNG)
- [ ] OG image (1200x630, brand colors + icon + tagline)
- [ ] 3-4 screenshots in phone mockup frames
- [ ] App Store badge SVG
- [ ] Google Play badge SVG
- [ ] Favicon (32x32)
