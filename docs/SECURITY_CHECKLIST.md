# Security Checklist

A practical launch checklist for the current Ship React Native stack.

## Critical

- [ ] No provider secrets in client code
- [ ] No production placeholders left in `.env`, EAS vars, or Convex vars
- [ ] All production endpoints use HTTPS
- [ ] Server-side validation exists for user-controlled inputs
- [ ] Error messages do not leak secrets or sensitive payloads
- [ ] RevenueCat keys are configured correctly for iOS and Android

## Convex Mode

- [ ] `EXPO_PUBLIC_CONVEX_URL` points at the correct deployment
- [ ] Convex environment variables contain provider secrets
- [ ] Protected mutations/actions validate the current user before writing data
- [ ] Credits, subscriptions, and user-owned data are enforced server-side
- [ ] Rate limits exist for expensive AI actions

## Expo API Routes Mode

- [ ] Deployment environment contains server-only AI secrets
- [ ] `EXPO_PUBLIC_API_URL` points at the correct deployed origin
- [ ] API routes validate request bodies server-side
- [ ] Auth assumptions are explicit for any protected routes
- [ ] Abuse controls exist for expensive endpoints

## Client App

- [ ] No sensitive tokens are logged
- [ ] AsyncStorage is only used for non-sensitive state unless specifically hardened
- [ ] Sentry is configured without leaking secrets
- [ ] PostHog events avoid raw PII where unnecessary
- [ ] Build artifacts are tested with production env values

## Release Review

- [ ] App Store / Play Store builds tested on real devices
- [ ] Sandbox purchase flow tested end-to-end
- [ ] Error boundaries tested with a forced failure path
- [ ] Offline and reconnect behavior checked for critical flows
