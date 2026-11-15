# Debugging Guide

This guide covers debugging techniques and tools for the AI App Boilerplate.

## Table of Contents

- [Quick Reference](#quick-reference)
- [Development Tools](#development-tools)
- [React Native Debugger](#react-native-debugger)
- [Console Logging](#console-logging)
- [Network Debugging](#network-debugging)
- [State Debugging](#state-debugging)
- [Performance Debugging](#performance-debugging)
- [Common Issues](#common-issues)
- [Error Handling](#error-handling)

## Quick Reference

```bash
# Start with debugging
npm start

# Clear cache and restart
npx expo start --clear

# Reset Metro bundler
npx expo start --reset-cache

# Run on specific platform
npx expo run:ios
npx expo run:android
```

## Development Tools

### Expo DevTools

Press these keys in the terminal after starting:

| Key | Action                |
| --- | --------------------- |
| `i` | Open iOS simulator    |
| `a` | Open Android emulator |
| `w` | Open web browser      |
| `r` | Reload app            |
| `m` | Toggle dev menu       |
| `j` | Open debugger         |

### React DevTools

Install and use standalone React DevTools:

```bash
# Install globally
npm install -g react-devtools

# Run in separate terminal
react-devtools
```

Then shake your device or press `m` to open dev menu and enable "Debug with React DevTools".

### VS Code Debugging

1. Install "React Native Tools" extension
2. Open `.vscode/launch.json` (already configured)
3. Press F5 or click "Run and Debug"
4. Select configuration:
   - **Attach to packager** - Connect to running app
   - **Debug iOS/Android** - Launch and debug

## Console Logging

### Basic Logging

```typescript
// Simple log
console.log("Value:", someValue);

// Object inspection
console.log(JSON.stringify(object, null, 2));

// Grouped logs
console.group("API Call");
console.log("Request:", request);
console.log("Response:", response);
console.groupEnd();

// Conditional logging
console.assert(condition, "Condition failed!");

// Table format
console.table(arrayOfObjects);
```

### Debug Utility

Create a debug utility for consistent logging:

```typescript
// utils/debug.ts
const DEBUG = __DEV__;

export const debug = {
  log: (...args: unknown[]) => DEBUG && console.log("[DEBUG]", ...args),
  warn: (...args: unknown[]) => DEBUG && console.warn("[WARN]", ...args),
  error: (...args: unknown[]) => console.error("[ERROR]", ...args),

  api: (endpoint: string, data: unknown) => {
    if (!DEBUG) return;
    console.group(`API: ${endpoint}`);
    console.log(data);
    console.groupEnd();
  },

  render: (component: string) => {
    DEBUG && console.log(`[RENDER] ${component}`);
  },
};
```

### Remote Logging (Production)

For production debugging, logs are sent to Sentry:

```typescript
import * as Sentry from "@sentry/react-native";

// Log breadcrumb
Sentry.addBreadcrumb({
  category: "action",
  message: "User tapped generate",
  level: "info",
});

// Capture message
Sentry.captureMessage("Something noteworthy");
```

## Network Debugging

### Flipper (Recommended)

1. Download [Flipper](https://fbflipper.com/)
2. Open Flipper while app is running
3. Use Network plugin to inspect requests

### Network Logging

```typescript
// Add to app/_layout.tsx for development
if (__DEV__) {
  // Log all fetch requests
  const originalFetch = global.fetch;
  global.fetch = async (...args) => {
    console.log("[FETCH]", args[0]);
    const response = await originalFetch(...args);
    console.log("[RESPONSE]", response.status);
    return response;
  };
}
```

### Supabase Debugging

```typescript
// Enable Supabase logging
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(URL, KEY, {
  // Enable debug mode
  db: {
    schema: "public",
  },
  global: {
    // Log all requests in development
    fetch: (...args) => {
      if (__DEV__) {
        console.log("[SUPABASE]", args[0]);
      }
      return fetch(...args);
    },
  },
});
```

## State Debugging

### Zustand DevTools

Use Zustand middleware for debugging:

```typescript
import { devtools } from "zustand/middleware";

export const useStore = create<State>()(
  devtools(
    (set) => ({
      // ... store definition
    }),
    { name: "MyStore" }
  )
);
```

### State Logging Middleware

```typescript
// middleware/logger.ts
const loggerMiddleware = (config) => (set, get, api) =>
  config(
    (...args) => {
      console.log("[STATE] Previous:", get());
      set(...args);
      console.log("[STATE] Next:", get());
    },
    get,
    api
  );
```

### React Query DevTools

If using React Query for data fetching:

```typescript
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Add to root component (web only)
<ReactQueryDevtools initialIsOpen={false} />
```

## Performance Debugging

### React DevTools Profiler

1. Open React DevTools
2. Click "Profiler" tab
3. Click record, interact with app
4. Analyze component render times

### Performance Monitoring

```typescript
// Measure component render time
import { useEffect, useRef } from "react";

function useRenderTime(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current++;
    const renderTime = Date.now() - startTime.current;
    console.log(`[PERF] ${componentName} render #${renderCount.current}: ${renderTime}ms`);
    startTime.current = Date.now();
  });
}
```

### Memory Leaks

Watch for memory leaks in useEffect:

```typescript
useEffect(() => {
  let isMounted = true;

  fetchData().then((data) => {
    // Check if still mounted before setting state
    if (isMounted) {
      setData(data);
    }
  });

  return () => {
    isMounted = false;
  };
}, []);
```

### Why Did You Render

```bash
npm install @welldone-software/why-did-you-render --save-dev
```

```typescript
// wdyr.ts (import first in app/_layout.tsx)
import React from "react";

if (__DEV__) {
  const whyDidYouRender = require("@welldone-software/why-did-you-render");
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}
```

## Common Issues

### Metro Bundler Issues

```bash
# Clear Metro cache
npx expo start --clear

# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Reset watchman
watchman watch-del-all
```

### iOS Simulator Issues

```bash
# Reset simulator
xcrun simctl erase all

# Clear derived data
rm -rf ~/Library/Developer/Xcode/DerivedData

# Rebuild pods
cd ios && pod install --repo-update && cd ..
```

### Android Emulator Issues

```bash
# Clear gradle cache
cd android && ./gradlew clean && cd ..

# Kill gradle daemon
cd android && ./gradlew --stop && cd ..

# Clear Android build
rm -rf android/app/build
```

### TypeScript Errors Not Showing

```bash
# Restart TypeScript server in VS Code
Cmd+Shift+P > "TypeScript: Restart TS Server"

# Check for type errors
npm run type-check
```

### Hot Reload Not Working

1. Check Metro is running
2. Try manual reload: `r` in terminal
3. Check for syntax errors in recent changes
4. Restart packager: `npx expo start --clear`

## Error Handling

### Error Boundary

The app includes an error boundary (`components/ErrorBoundary.tsx`):

```typescript
// Wrap components that might error
<ErrorBoundary fallback={<ErrorScreen />}>
  <RiskyComponent />
</ErrorBoundary>
```

### Async Error Handling

```typescript
// Always wrap async operations
async function fetchData() {
  try {
    const result = await api.call();
    return result;
  } catch (error) {
    // Log to Sentry in production
    if (!__DEV__) {
      Sentry.captureException(error);
    }

    // Log locally in development
    console.error("[API Error]", error);

    // Return safe default or rethrow
    throw error;
  }
}
```

### Sentry Error Tracking

```typescript
// Capture handled errors
try {
  riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: "image-generation" },
    extra: { prompt, model },
  });
}

// Set user context
Sentry.setUser({ id: userId, email });

// Add breadcrumbs
Sentry.addBreadcrumb({
  category: "navigation",
  message: "User opened settings",
});
```

---

## Debugging Checklist

When debugging an issue:

1. [ ] Check console for error messages
2. [ ] Verify network requests in Flipper/DevTools
3. [ ] Check component state with React DevTools
4. [ ] Review Zustand store state
5. [ ] Look for TypeScript errors: `npm run type-check`
6. [ ] Check ESLint warnings: `npm run lint`
7. [ ] Clear caches and restart: `npx expo start --clear`
8. [ ] Check Sentry for production errors

---

For more information:

- [Expo Debugging Docs](https://docs.expo.dev/debugging/tools/)
- [React Native Debugging](https://reactnative.dev/docs/debugging)
- [Flipper Documentation](https://fbflipper.com/docs/getting-started/react-native/)
