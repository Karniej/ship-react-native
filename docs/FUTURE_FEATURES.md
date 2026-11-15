# Future Features Implementation Guide

This document provides detailed instructions for implementing upcoming features when they become available.

## Table of Contents

1. [Expo UI & Liquid Glass](#1-expo-ui--liquid-glass)
2. [Web Support (PWA)](#2-web-support-pwa)
3. [Storybook Component Library](#3-storybook-component-library)
4. [Biometric Authentication](#4-biometric-authentication)
5. [Implementation Timeline](#5-implementation-timeline)

---

## 1. Expo UI & Liquid Glass

### Overview

Expo UI (`@expo/ui`) provides native platform UI components:

- **iOS**: SwiftUI components
- **Android**: Jetpack Compose components
- **Liquid Glass**: Apple's new translucent design language (iOS 26+)

### Prerequisites

Before enabling Expo UI:

1. **iOS 26+ device** (for Liquid Glass effect)
2. **Xcode 26+** (for building)
3. **Development build** (NOT Expo Go)

### Step 1: Verify Packages Are Installed

The packages are already installed in this boilerplate:

```bash
# Check if packages are installed
npm ls @expo/ui expo-glass-effect expo-blur
```

If missing, install them:

```bash
npx expo install @expo/ui expo-glass-effect expo-blur
```

### Step 2: Enable the Feature Flag

Edit `constants/features.ts`:

```typescript
expoUI: {
  enabled: true, // Change from false to true
  premiumOnly: false,
  beta: true,
  comingSoon: false,
},
```

### Step 3: Create a Development Build

```bash
# Clean previous builds
rm -rf ios android

# Generate native projects
npx expo prebuild

# Install iOS dependencies
cd ios && pod install && cd ..

# Build and run on iOS
npx expo run:ios

# Or build and run on Android
npx expo run:android
```

### Step 4: Enable Glass Tab Bar

Edit `app/(app)/(tabs)/_layout.tsx`:

```typescript
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Platform } from "react-native";

import { isFeatureEnabled } from "@/constants/features";
import { NativeTabBar } from "@/components/native-ui";

export default function TabLayout() {
  // Use glass tab bar when expoUI is enabled
  const useGlassTabBar = isFeatureEnabled("expoUI") && Platform.OS === "ios";

  return (
    <Tabs
      tabBar={useGlassTabBar ? (props) => <NativeTabBar {...props} /> : undefined}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: useGlassTabBar
          ? { position: "absolute", backgroundColor: "transparent", borderTopWidth: 0, elevation: 0 }
          : { paddingBottom: Platform.OS === "android" ? 8 : 0 },
      }}
    >
      {/* ... tabs ... */}
    </Tabs>
  );
}
```

### Step 5: Add Bottom Padding to Screens

For the glass effect to work, content must scroll behind the tab bar. Add padding to scrollable screens:

```typescript
// In your screen styles
const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 100, // Extra space for glass tab bar
  },
});
```

### Step 6: Use Native Components

Import and use native components in your screens:

```typescript
import {
  NativeButton,
  NativePicker,
  GlassView,
  NativeBottomSheet,
  NativeColorPicker,
  NativeCircularProgress,
} from "@/components/native-ui";

// Example: Glass card
<GlassView style={{ padding: 20, margin: 16 }}>
  <Text>This content has a glass effect!</Text>
</GlassView>

// Example: Native button
<NativeButton
  title="Submit"
  onPress={handleSubmit}
  role="default"
/>

// Example: Native picker
<NativePicker
  label="Select Option"
  options={[
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" },
  ]}
  selectedValue={selected}
  onValueChange={setSelected}
/>
```

### Component Reference

| Component                | iOS                    | Android          | Web               | Notes                              |
| ------------------------ | ---------------------- | ---------------- | ----------------- | ---------------------------------- |
| `NativeButton`           | SwiftUI Button         | Compose Button   | Standard Button   | Role affects styling               |
| `NativePicker`           | SwiftUI Picker         | Compose Picker   | Segmented buttons | Native dropdown                    |
| `GlassView`              | Liquid Glass (iOS 26+) | Semi-transparent | Semi-transparent  | Falls back to BlurView on iOS < 26 |
| `NativeBottomSheet`      | Native sheet           | Native sheet     | Modal             | Gesture-enabled                    |
| `NativeColorPicker`      | Native picker          | Native picker    | Color grid        | Full color selection               |
| `NativeCircularProgress` | Native progress        | Native progress  | SVG animation     | Animated                           |

---

## 2. Web Support (PWA)

### Overview

Add Progressive Web App support to run your app in browsers with:

- Responsive design
- Offline support
- App-like experience

### Step 1: Install Web Dependencies

```bash
npx expo install react-native-web react-dom @expo/metro-runtime
```

### Step 2: Configure app.json

Add web configuration to `app.json`:

```json
{
  "expo": {
    "web": {
      "bundler": "metro",
      "output": "single",
      "favicon": "./assets/favicon.png"
    }
  }
}
```

### Step 3: Create Web-Specific Entry

Create `index.web.js` (if needed for web-specific setup):

```javascript
import { registerRootComponent } from "expo";
import App from "./App";

registerRootComponent(App);
```

### Step 4: Handle Platform-Specific Code

Use Platform checks for web-incompatible features:

```typescript
import { Platform } from "react-native";

// Example: Skip native-only features on web
if (Platform.OS !== "web") {
  // Native-only code
  import("./native-feature").then((module) => {
    module.initialize();
  });
}

// Example: Platform-specific styling
const styles = StyleSheet.create({
  container: {
    maxWidth: Platform.OS === "web" ? 1200 : undefined,
    marginHorizontal: Platform.OS === "web" ? "auto" : 0,
  },
});
```

### Step 5: Create Responsive Layouts

```typescript
import { useWindowDimensions, Platform } from "react-native";

function ResponsiveLayout({ children }) {
  const { width } = useWindowDimensions();

  // Breakpoints
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  return (
    <View style={[
      styles.container,
      isDesktop && styles.desktop,
      isTablet && styles.tablet,
      isMobile && styles.mobile,
    ]}>
      {children}
    </View>
  );
}
```

### Step 6: Handle Web Navigation

For web, consider adding URL-based navigation:

```typescript
// In your router configuration
import { usePathname } from "expo-router";

function useWebNavigation() {
  const pathname = usePathname();

  // Track page views for web analytics
  useEffect(() => {
    if (Platform.OS === "web") {
      // Web analytics tracking
      analytics.trackPageView(pathname);
    }
  }, [pathname]);
}
```

### Step 7: PWA Configuration

Create `public/manifest.json`:

```json
{
  "name": "Your App Name",
  "short_name": "App",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#007AFF",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Step 8: Run Web Build

```bash
# Development
npx expo start --web

# Production build
npx expo export --platform web

# The output will be in the 'dist' folder
```

### Step 9: Deploy

Deploy the `dist` folder to any static hosting:

```bash
# Vercel
npx vercel dist

# Netlify
npx netlify deploy --dir=dist --prod

# Firebase Hosting
firebase deploy --only hosting
```

### Web-Specific Considerations

| Feature            | iOS/Android      | Web              | Solution                                 |
| ------------------ | ---------------- | ---------------- | ---------------------------------------- |
| Push Notifications | Native           | Web Push API     | Use `expo-notifications` with web config |
| Camera             | Native camera    | MediaDevices API | Platform check + fallback                |
| File System        | Native FS        | Browser storage  | Use IndexedDB for web                    |
| Biometrics         | Face ID/Touch ID | WebAuthn         | Conditional feature                      |
| In-App Purchases   | RevenueCat       | Stripe/Paddle    | Separate payment flow                    |
| Haptics            | Native haptics   | N/A              | Disable on web                           |

---

## 3. Storybook Component Library

### Overview

Storybook is a tool for developing UI components in isolation. It makes building stunning UIs organized and efficient by providing:

- **Component Playground** - Develop and test components in isolation
- **Documentation** - Auto-generated docs from your components
- **Visual Testing** - Catch visual regressions automatically
- **Accessibility** - Built-in a11y testing

### Why Storybook?

This boilerplate includes 36+ reusable UI components. Storybook will help you:

1. **Preview components** without navigating through the app
2. **Test edge cases** (loading, error, empty states)
3. **Document props** and usage examples
4. **Share designs** with stakeholders
5. **Catch regressions** with visual testing

### Step 1: Install Storybook

```bash
# Initialize Storybook for React Native
npx sb@latest init --type react_native

# Install additional dependencies
npm install @storybook/addon-ondevice-controls @storybook/addon-ondevice-actions
```

### Step 2: Configure Storybook

Create `.storybook/main.js`:

```javascript
module.exports = {
  stories: [
    "../components/**/*.stories.@(js|jsx|ts|tsx)",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: ["@storybook/addon-ondevice-controls", "@storybook/addon-ondevice-actions"],
};
```

Create `.storybook/preview.js`:

```javascript
import { withBackgrounds } from "@storybook/addon-ondevice-backgrounds";

export const decorators = [withBackgrounds];

export const parameters = {
  backgrounds: {
    default: "light",
    values: [
      { name: "light", value: "#FFFFFF" },
      { name: "dark", value: "#1A1A2E" },
    ],
  },
};
```

### Step 3: Create Component Stories

Create stories for each component. Example for Button:

```typescript
// components/ui/Button.stories.tsx
import React from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react-native";
import { Button } from "./Button";

export default {
  title: "UI/Button",
  component: Button,
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "outline", "ghost"],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
  },
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  title: "Primary Button",
  variant: "primary",
};

export const Secondary = Template.bind({});
Secondary.args = {
  title: "Secondary Button",
  variant: "secondary",
};

export const Loading = Template.bind({});
Loading.args = {
  title: "Loading...",
  loading: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  title: "Disabled",
  disabled: true,
};
```

### Step 4: Create Storybook Entry Point

Create `storybook.tsx` at project root:

```typescript
import { getStorybookUI } from "@storybook/react-native";

import "./storybook.requires";

const StorybookUIRoot = getStorybookUI({
  // Options
  enableWebsockets: true,
  onDeviceUI: true,
  shouldPersistSelection: true,
});

export default StorybookUIRoot;
```

### Step 5: Add Storybook Script

Add to `package.json`:

```json
{
  "scripts": {
    "storybook": "sb-rn-get-stories && expo start",
    "storybook:web": "storybook dev -p 6006"
  }
}
```

### Step 6: Run Storybook

```bash
# On device
npm run storybook

# Web interface
npm run storybook:web
```

### Recommended Component Stories

Create stories for these components:

| Component     | Stories to Create                              |
| ------------- | ---------------------------------------------- |
| `Button`      | Primary, Secondary, Outline, Loading, Disabled |
| `Input`       | Default, With Error, With Icon, Disabled       |
| `Card`        | Default, With Image, Pressable                 |
| `Avatar`      | With Image, With Initials, Sizes               |
| `Badge`       | Success, Warning, Error, Custom Colors         |
| `Loading`     | Spinner, Skeleton, Full Screen                 |
| `EmptyState`  | With Icon, With Action, Custom Content         |
| `ErrorCard`   | Default, With Retry, Critical                  |
| `PromptInput` | Default, With Examples, Character Count        |
| `ModelPicker` | Single Select, With Premium Badge              |

### Visual Testing Integration

For automated visual testing, consider:

```bash
# Install Chromatic
npm install --save-dev chromatic

# Run visual tests
npx chromatic --project-token=<your-token>
```

---

## 4. Biometric Authentication

### Overview

Add Face ID, Touch ID, and fingerprint authentication for:

- **App unlock** - Secure app access
- **Transaction confirmation** - Confirm purchases
- **Sensitive data access** - Protect user information

### Step 1: Install Dependencies

```bash
npx expo install expo-local-authentication expo-secure-store
```

### Step 2: Create Biometric Service

```typescript
// services/biometric.service.ts
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

export const biometricService = {
  /**
   * Check if device supports biometrics
   */
  async isSupported(): Promise<boolean> {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  },

  /**
   * Get available authentication types
   */
  async getAuthTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    return LocalAuthentication.supportedAuthenticationTypesAsync();
  },

  /**
   * Authenticate user with biometrics
   */
  async authenticate(reason?: string): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason || "Authenticate to continue",
      fallbackLabel: "Use passcode",
      disableDeviceFallback: false,
    });
    return result.success;
  },

  /**
   * Store sensitive data securely
   */
  async secureStore(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value, {
      requireAuthentication: true,
      authenticationPrompt: "Authenticate to save data",
    });
  },

  /**
   * Retrieve sensitive data (requires biometric auth)
   */
  async secureRetrieve(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key, {
      requireAuthentication: true,
      authenticationPrompt: "Authenticate to access data",
    });
  },
};
```

### Step 3: Create Biometric Settings

```typescript
// In settings screen
import { biometricService } from "@/services/biometric.service";

function BiometricSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    biometricService.isSupported().then(setIsSupported);
  }, []);

  const handleToggle = async (value: boolean) => {
    if (value) {
      const authenticated = await biometricService.authenticate(
        "Enable biometric login"
      );
      if (authenticated) {
        setIsEnabled(true);
        // Save preference
      }
    } else {
      setIsEnabled(false);
    }
  };

  if (!isSupported) return null;

  return (
    <View>
      <Text>Biometric Login</Text>
      <Switch value={isEnabled} onValueChange={handleToggle} />
    </View>
  );
}
```

### Step 4: Protect App on Background

```typescript
// In app/_layout.tsx
import { useAppState } from "@/hooks/useAppState";
import { biometricService } from "@/services/biometric.service";

function AppLayout() {
  const appState = useAppState();
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (appState === "active" && isLocked) {
      biometricService.authenticate("Unlock app").then((success) => {
        if (success) setIsLocked(false);
      });
    }

    if (appState === "background") {
      setIsLocked(true);
    }
  }, [appState]);

  if (isLocked) {
    return <LockScreen onUnlock={() => setIsLocked(false)} />;
  }

  return <Stack />;
}
```

### Use Cases

| Use Case            | Implementation                          |
| ------------------- | --------------------------------------- |
| App Lock            | Require auth when app becomes active    |
| Purchase Confirm    | Require auth before RevenueCat purchase |
| View Sensitive Data | Require auth to view API keys or tokens |
| Delete Account      | Require auth before destructive actions |

---

## 5. Implementation Timeline

### Phase 1: Expo UI (When iOS 26 is Public)

**Estimated: Fall 2025**

- [ ] Enable `expoUI` feature flag
- [ ] Update tab bar to use `NativeTabBar`
- [ ] Add glass effects to key screens
- [ ] Update onboarding with native components
- [ ] Test on iOS 26+ devices

### Phase 2: Web Support

**Can be implemented anytime**

- [ ] Install web dependencies
- [ ] Configure app.json for web
- [ ] Create responsive layouts
- [ ] Handle platform-specific features
- [ ] Set up PWA manifest
- [ ] Deploy to web hosting

### Phase 3: Full Integration

**After both phases complete**

- [ ] Unified codebase for iOS, Android, and Web
- [ ] Feature parity across platforms
- [ ] Automated testing for all platforms
- [ ] CI/CD for multi-platform deployment

---

## Troubleshooting

### Expo UI Issues

**"Cannot find module @expo/ui"**

```bash
npx expo install @expo/ui
```

**"GlassView not showing effect"**

- Ensure iOS 26+ device
- Ensure Xcode 26+ is used for building
- Check that content scrolls behind the view

**"Native components not rendering"**

- Ensure you're running a development build, NOT Expo Go
- Check feature flag is enabled

### Web Issues

**"window is not defined"**

- Wrap browser-specific code in Platform checks
- Use dynamic imports for web-only modules

**"Native module not available"**

- Create fallback components for web
- Use the component pattern in `components/native-ui/`

**Build fails with Metro errors**

- Clear cache: `npx expo start --clear`
- Delete node_modules and reinstall

---

## Resources

- [Expo UI Documentation](https://docs.expo.dev/versions/latest/sdk/ui/)
- [Expo Glass Effect](https://docs.expo.dev/versions/latest/sdk/glass-effect/)
- [React Native Web](https://necolas.github.io/react-native-web/)
- [Expo Web Documentation](https://docs.expo.dev/workflow/web/)
- [Apple Liquid Glass Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
