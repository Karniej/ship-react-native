# Ship React Native - Improvement Roadmap

> Historical roadmap snapshot from January 2026.
> Some stack/version references reflect the repo state at that time rather than the current main branch.

**Date:** January 11, 2026
**Version Analyzed:** 1.0.0
**Tech Stack:** Historical snapshot from the January 2026 codebase

---

## Executive Summary

This document outlines gaps and improvements identified in the Ship React Native boilerplate to make it the most comprehensive React Native starter kit available.

---

## Priority Improvements

### 1. Push Notifications Setup

**Priority:** High
**Effort:** Medium
**Status:** Package installed, not integrated

`expo-notifications` is installed but lacks implementation.

**Missing Components:**

- Permission request flow with graceful denial handling
- FCM/APNs token registration with the backend layer
- Foreground notification listener
- Background notification handler
- Notification tap handler with deep linking
- Notification preferences sync with backend
- Local notification scheduling

**Implementation Location:**

- `services/notifications.service.ts`
- `hooks/useNotifications.ts`
- `convex/pushTokens.ts` or API/backend persistence layer for device tokens

---

### 2. End-to-End Testing

**Priority:** High
**Effort:** High
**Status:** Not present

Only unit tests exist. Production apps need E2E testing.

**Recommended Setup:**

- Maestro (simpler) or Detox (more powerful)
- Critical flow coverage:
  - Onboarding completion
  - Authentication (all methods)
  - AI generation flow
  - Premium purchase flow
  - Offline/online transitions

**Files to Add:**

- `e2e/` directory
- `maestro/` or `.detoxrc.js`
- CI workflow for E2E tests

---

### 3. Over-the-Air Updates

**Priority:** High
**Effort:** Low
**Status:** Not present

Missing `expo-updates` for OTA updates.

**Benefits:**

- Deploy hotfixes without App Store review
- A/B testing capabilities
- Rollback support

**Implementation:**

```bash
npx expo install expo-updates
```

**Files to Add:**

- Update check on app launch
- Update available prompt UI
- `eas.json` update channel configuration

---

### 4. Form Validation Library

**Priority:** Medium
**Effort:** Medium
**Status:** Not present

No form handling or validation library.

**Recommended Stack:**

- `react-hook-form` - Form state management
- `zod` - Schema validation

**Benefits:**

- Type-safe form handling
- Reduced boilerplate
- Consistent error handling
- Better UX with real-time validation

**Files to Add:**

- `hooks/useForm.ts` - Wrapper hook
- `utils/validation.ts` - Common schemas
- Form component examples

---

### 5. App Store Review Integration

**Priority:** Medium
**Effort:** Low
**Status:** Package installed, not integrated

`expo-store-review` is installed but unused.

**Smart Prompt Strategy:**

- After 3rd successful AI generation
- After completing onboarding
- After 7 days of app usage
- Never more than once per 30 days
- Never after errors or failed operations

**Files to Add:**

- `services/storeReview.service.ts`
- `hooks/useStoreReview.ts`
- Store in `useGeneralStore` - last prompt date

---

### 6. Accessibility (a11y)

**Priority:** Medium
**Effort:** Medium
**Status:** Not documented

No accessibility guidelines or patterns.

**Required Additions:**

- `accessibilityLabel` on all buttons/inputs
- `accessibilityRole` on interactive elements
- `accessibilityHint` for complex actions
- Screen reader testing documentation
- Color contrast verification
- Touch target size validation (min 44x44)

**Files to Add:**

- `docs/ACCESSIBILITY.md`
- a11y testing in CI (axe-core or similar)
- Component updates with a11y props

---

### 7. Performance Optimization Patterns

**Priority:** Medium
**Effort:** Medium
**Status:** Not documented

Missing optimization guidelines.

**Documentation Needed:**

- When to use `React.memo`
- When to use `useMemo` and `useCallback`
- Image optimization with `expo-image`
- FlatList optimization patterns
- Bundle size monitoring
- Performance profiling guide

**Consider Adding:**

- `expo-image` instead of RN Image
- Performance monitoring with Sentry
- Bundle analyzer in CI

---

### 8. Social Sharing

**Priority:** Low
**Effort:** Low
**Status:** Package installed, not integrated

`expo-sharing` is installed but not used.

**Use Cases:**

- Share AI-generated images/videos
- Share app referral links
- Export generations to social media

**Files to Add:**

- `utils/sharing.ts`
- Share buttons in gallery/generation screens
- Deep link generation for shared content

---

### 9. Centralized Permissions

**Priority:** Low
**Effort:** Low
**Status:** Not present

No unified permission handling.

**Required Permissions:**

- Camera (image-identify, video)
- Microphone (transcription)
- Media Library (save generations)
- Notifications (push)

**Files to Add:**

- `services/permissions.service.ts`
- `hooks/usePermission.ts`
- Settings redirect on denial

---

### 10. Deep Linking Documentation

**Priority:** Low
**Effort:** Low
**Status:** Supported but not documented

Expo Router supports deep linking but missing docs.

**Documentation Needed:**

- URL scheme configuration
- Universal links setup (iOS)
- App Links setup (Android)
- Example deep link handlers
- Testing deep links guide

---

## Developer Experience Improvements

### Configuration Files

| File                   | Status  | Action                       |
| ---------------------- | ------- | ---------------------------- |
| `.prettierrc`          | Missing | Add with project conventions |
| `.nvmrc`               | Missing | Add with Node 20             |
| `.editorconfig`        | Missing | Add for consistency          |
| `commitlint.config.js` | Missing | Add for conventional commits |

### GitHub Templates

| Template                            | Status  | Action |
| ----------------------------------- | ------- | ------ |
| `ISSUE_TEMPLATE/bug_report.md`      | Missing | Add    |
| `ISSUE_TEMPLATE/feature_request.md` | Missing | Add    |
| `PULL_REQUEST_TEMPLATE.md`          | Missing | Add    |

### Other Files

| File                   | Status  | Action                   |
| ---------------------- | ------- | ------------------------ |
| `CHANGELOG.md`         | Missing | Add with version history |
| `docs/UPGRADE.md`      | Missing | Add upgrade guide        |
| `docs/ARCHITECTURE.md` | Missing | Add visual diagrams      |

---

## ESLint Enhancements

**Current Setup:** Basic ESLint with universe config

**Suggested Additions:**

```javascript
// .eslintrc.js additions
{
  plugins: ['import'],
  rules: {
    'import/order': ['error', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      alphabetize: { order: 'asc' }
    }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'react-hooks/exhaustive-deps': 'warn'
  }
}
```

---

## Documentation Gaps

### Missing Documentation

1. **Upgrade Guide** (`docs/UPGRADE.md`)
   - How to upgrade from older versions
   - Breaking changes by version
   - Migration scripts

2. **Architecture Overview** (`docs/ARCHITECTURE.md`)
   - Visual diagram of app structure
   - Data flow diagrams
   - Component hierarchy

3. **API Rate Limits** (`docs/RATE_LIMITS.md`)
   - OpenAI limits
   - Replicate limits
   - ElevenLabs limits
   - Supabase Edge Function limits

4. **Cost Estimation** (`docs/COST_GUIDE.md`)
   - AI API costs per generation
   - Supabase pricing tiers
   - RevenueCat fees
   - Monthly cost calculator

5. **Troubleshooting FAQ** (expand `docs/DEBUGGING.md`)
   - More common issues
   - Platform-specific problems
   - Third-party service issues

---

## Security Improvements

### High Priority

1. **Input Sanitization**
   - Document XSS prevention
   - Prompt injection prevention for AI
   - SQL injection prevention (RLS handles most)

2. **Secure Storage Patterns**
   - When to use `expo-secure-store`
   - Sensitive data handling guide
   - Token storage best practices

### Medium Priority

3. **Certificate Pinning**
   - For production API calls
   - Supabase connection security

4. **Jailbreak/Root Detection**
   - Optional security layer
   - Graceful degradation

### Documentation

5. **Security Checklist** (`docs/SECURITY_CHECKLIST.md`)
   - Pre-launch security audit steps
   - Penetration testing guide
   - Compliance considerations (GDPR, CCPA)

---

## Nice-to-Have Features

### Platform Extensions

| Feature              | Effort | Value  |
| -------------------- | ------ | ------ |
| iOS Widgets          | High   | Medium |
| Apple Watch App      | High   | Low    |
| Android Widgets      | Medium | Medium |
| Siri Shortcuts       | Medium | Medium |
| CarPlay/Android Auto | High   | Low    |

### Advanced Features

| Feature                  | Effort | Value  |
| ------------------------ | ------ | ------ |
| AR Camera Features       | High   | Medium |
| Offline Generation Queue | Medium | High   |
| Background Upload        | Medium | Medium |
| iCloud/Google Drive Sync | High   | Medium |
| Multi-device Sync        | High   | Medium |

---

## Quick Wins

These can be implemented in under 1 hour each:

### 1. Add `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### 2. Add `.nvmrc`

```
20
```

### 3. Add GitHub Issue Template

```markdown
## <!-- .github/ISSUE_TEMPLATE/bug_report.md -->

name: Bug Report
about: Report a bug

---

**Describe the bug**

**To Reproduce**

**Expected behavior**

**Screenshots**

**Environment:**

- Device:
- OS:
- App Version:
```

### 4. Add `CHANGELOG.md`

```markdown
# Changelog

## [1.0.0] - 2026-01-11

### Added

- Initial release
- AI generation (image, video, speech, transcription, vision, chat)
- Authentication (email, magic link, social, anonymous)
- Premium subscriptions with RevenueCat
- Offline support
- i18n (5 languages)
- Dark/light theming
```

### 5. Add Import Sorting

```bash
npm install --save-dev eslint-plugin-import
```

### 6. Integrate Store Review

```typescript
// Quick integration in useAIStore after successful generation
import * as StoreReview from "expo-store-review";

// After generation success
const generationCount = get().generationHistory.length;
if (generationCount === 3 || generationCount === 10) {
  StoreReview.requestReview();
}
```

### 7. Add Debug Menu (Dev Only)

```typescript
// components/DebugMenu.tsx - only renders in __DEV__
// Shows: auth state, credits, feature flags, clear storage
```

---

## Implementation Priority Matrix

```
                    HIGH VALUE
                        │
    ┌───────────────────┼───────────────────┐
    │                   │                   │
    │  Push Notifs      │  Store Review     │
    │  OTA Updates      │  Sharing          │
    │  E2E Tests        │  Permissions      │
    │                   │                   │
LOW ├───────────────────┼───────────────────┤ HIGH
EFFORT                  │                   EFFORT
    │                   │                   │
    │  .prettierrc      │  Form Validation  │
    │  GitHub Templates │  Accessibility    │
    │  CHANGELOG        │  Performance Docs │
    │                   │                   │
    └───────────────────┼───────────────────┘
                        │
                    LOW VALUE
```

**Recommended Order:**

1. Quick wins (config files, templates)
2. OTA Updates (low effort, high value)
3. Store Review integration
4. Push Notifications
5. Form Validation
6. E2E Testing
7. Accessibility
8. Everything else

---

## Conclusion

The Ship React Native boilerplate is already production-ready with excellent foundations. These improvements would elevate it from "very good" to "best-in-class" by addressing:

- **Reliability:** E2E tests, OTA updates
- **Engagement:** Push notifications, store reviews
- **Developer Experience:** Better tooling, documentation
- **Accessibility:** Inclusive design patterns
- **Security:** Hardened for production

The quick wins can be implemented immediately, while larger features can be prioritized based on your specific app requirements.

---

_Generated by Claude Code - January 11, 2026_
