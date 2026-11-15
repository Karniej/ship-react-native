# Upgrade Guide

This guide provides detailed instructions for upgrading between versions of Ship React Native.

## Table of Contents

- [General Upgrade Process](#general-upgrade-process)
- [Version-Specific Upgrades](#version-specific-upgrades)
- [Troubleshooting](#troubleshooting)

---

## General Upgrade Process

### Before Upgrading

1. **Backup your project**

   ```bash
   git stash  # or commit your changes
   git checkout -b backup-before-upgrade
   ```

2. **Read the changelog**
   Review [CHANGELOG.md](../CHANGELOG.md) for breaking changes and new features.

3. **Check your Node.js version**
   ```bash
   node --version  # Should be 18+ (20 recommended)
   ```

### Standard Upgrade Steps

1. **Update dependencies**

   ```bash
   # Update the boilerplate dependencies
   npm update

   # Or for major version bumps
   npm install package-name@latest
   ```

2. **Clear caches**

   ```bash
   # Clear npm cache
   npm cache clean --force

   # Clear Metro cache
   npx expo start -c

   # Clear iOS pods (if applicable)
   cd ios && pod deintegrate && pod install && cd ..
   ```

3. **Run type check**

   ```bash
   npm run type-check
   ```

4. **Run tests**

   ```bash
   npm test
   ```

5. **Test on both platforms**
   - iOS Simulator
   - Android Emulator
   - Physical devices (recommended)

---

## Version-Specific Upgrades

### Upgrading from 0.x to 1.0.0

This is a major upgrade with significant changes.

#### Breaking Changes

1. **Current baseline**
   - Expo SDK 55 preview
   - React 19.2
   - React Native 0.83
   - New Expo Router 6 syntax

2. **State Management**
   - Zustand 5 (new API for persist middleware)

3. **React Query 5**
   - New query key format
   - Different mutation behavior

#### Migration Steps

1. **Update Expo SDK**

   ```bash
   npx expo install expo@^54.0.0
   npx expo install --fix
   ```

2. **Update Zustand stores**

   ```typescript
   // Old (v4)
   import create from "zustand";

   // New (v5)
   import { create } from "zustand";
   ```

3. **Update React Query**

   ```typescript
   // Old
   const { data } = useQuery(["key"], fetchFn);

   // New
   const { data } = useQuery({ queryKey: ["key"], queryFn: fetchFn });
   ```

4. **Update Expo Router**

   ```typescript
   // Old
   import { Stack } from "expo-router";

   // New - same import but check for API changes
   import { Stack } from "expo-router";
   ```

---

### Upgrading Expo SDK

When a new Expo SDK is released:

1. **Check compatibility**
   - Visit [Expo SDK Changelog](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)

2. **Update Expo**

   ```bash
   npx expo install expo@^XX.0.0
   ```

3. **Update all Expo packages**

   ```bash
   npx expo install --fix
   ```

4. **Update app.json**

   ```json
   {
     "expo": {
       "sdkVersion": "XX.0.0"
     }
   }
   ```

5. **Regenerate native projects** (if using bare workflow)
   ```bash
   npx expo prebuild --clean
   ```

---

### Upgrading React Native

For major React Native upgrades:

1. **Use the upgrade helper**
   - Visit [React Native Upgrade Helper](https://react-native-community.github.io/upgrade-helper/)

2. **Apply changes incrementally**
   - Native files (ios/, android/)
   - Configuration files
   - Dependencies

3. **Test thoroughly**
   - All navigation flows
   - All features
   - Both platforms

---

## Package-Specific Upgrades

### Convex

```bash
npm install convex @convex-dev/auth@latest
```

Check for API changes:

- auth package changes
- generated types
- query/mutation/action APIs

### RevenueCat

```bash
npm install react-native-purchases@latest
```

After upgrading:

- Review migration guide on RevenueCat docs
- Test in sandbox environment
- Verify webhook configurations

### React Navigation / Expo Router

When upgrading navigation:

- Check for deprecated props
- Verify screen options
- Test all navigation flows

---

## Troubleshooting

### Common Issues

#### "Cannot find module" errors

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

#### TypeScript errors after upgrade

```bash
# Regenerate types
npm run type-check

# If using Convex
npx convex dev
```

#### Metro bundler issues

```bash
npx expo start -c
```

#### iOS build fails

```bash
cd ios
pod deintegrate
pod install --repo-update
cd ..
```

#### Android build fails

```bash
cd android
./gradlew clean
cd ..
```

### Getting Help

1. Check the [Expo Forums](https://forums.expo.dev/)
2. Search [React Native GitHub Issues](https://github.com/facebook/react-native/issues)
3. Review [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

---

## Pre-Release Testing Checklist

Before deploying after an upgrade:

- [ ] App launches without crashes
- [ ] Authentication flows work
- [ ] AI generation works
- [ ] Premium purchases work (sandbox)
- [ ] Offline mode works
- [ ] Push notifications work
- [ ] Analytics events fire
- [ ] Error tracking works
- [ ] All navigation flows work
- [ ] Dark/light theme works
- [ ] All translations load

---

## Rollback Procedure

If an upgrade causes issues:

1. **Revert to previous version**

   ```bash
   git checkout backup-before-upgrade
   ```

2. **Reinstall dependencies**

   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Clear all caches**

   ```bash
   npx expo start -c
   ```

4. **Document the issue**
   - Create an issue with error details
   - Include upgrade steps taken
   - Include error logs
