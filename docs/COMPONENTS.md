# UI Components Guide

This guide documents all reusable UI components in the AI App Boilerplate.

## Table of Contents

- [Overview](#overview)
- [Core Components](#core-components)
  - [Button](#button)
  - [Input](#input)
  - [Text](#text)
  - [Card](#card)
- [Layout Components](#layout-components)
  - [Divider](#divider)
  - [ScreenHeader](#screenheader)
  - [SectionLabel](#sectionlabel)
- [Feedback Components](#feedback-components)
  - [Loading](#loading)
  - [Skeleton](#skeleton)
  - [EmptyState](#emptystate)
  - [ErrorCard](#errorcard)
- [Display Components](#display-components)
  - [Avatar](#avatar)
  - [Badge](#badge)
  - [IconButton](#iconbutton)
- [AI-Specific Components](#ai-specific-components)
  - [GenerationResult](#generationresult)
  - [GenerationLoadingState](#generationloadingstate)
  - [CreditsCard](#creditscard)
  - [ImagePickerButton](#imagepickerbutton)
- [Animation Components](#animation-components)
  - [AnimatedWrapper](#animatedwrapper)
- [Modal Components](#modal-components)
  - [FullScreenModal](#fullscreenmodal)
- [Design Tokens](#design-tokens)

## Overview

All components are located in `components/ui/` and follow these principles:

- **Themed**: Automatically adapt to light/dark mode
- **Animated**: Built with react-native-reanimated for smooth interactions
- **Typed**: Full TypeScript support with documented props
- **Accessible**: Support for accessibility features

### Importing Components

```typescript
// Individual import
import { Button } from "@/components/ui/Button";

// Barrel import (if index.ts exists)
import { Button, Input, Card } from "@/components/ui";
```

---

## Core Components

### Button

A pressable button with multiple variants, sizes, and states.

```typescript
import { Button } from "@/components/ui/Button";

// Basic usage
<Button title="Click me" onPress={handlePress} />

// With variants
<Button title="Primary" variant="primary" />
<Button title="Secondary" variant="secondary" />
<Button title="Outline" variant="outline" />
<Button title="Ghost" variant="ghost" />
<Button title="Danger" variant="danger" />

// With sizes
<Button title="Small" size="sm" />
<Button title="Medium" size="md" />
<Button title="Large" size="lg" />

// With icons
<Button title="Save" leftIcon="save-outline" />
<Button title="Next" rightIcon="arrow-forward" />

// States
<Button title="Loading..." loading />
<Button title="Disabled" disabled />
<Button title="Full Width" fullWidth />
```

**Props:**

| Prop        | Type                                                           | Default     | Description                  |
| ----------- | -------------------------------------------------------------- | ----------- | ---------------------------- |
| `title`     | `string`                                                       | -           | Button text (required)       |
| `variant`   | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | Visual style                 |
| `size`      | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                         | `'md'`      | Button size                  |
| `loading`   | `boolean`                                                      | `false`     | Show loading spinner         |
| `disabled`  | `boolean`                                                      | `false`     | Disable interactions         |
| `leftIcon`  | `string`                                                       | -           | Ionicons name for left icon  |
| `rightIcon` | `string`                                                       | -           | Ionicons name for right icon |
| `fullWidth` | `boolean`                                                      | `false`     | Stretch to container width   |
| `style`     | `ViewStyle`                                                    | -           | Custom container style       |
| `textStyle` | `TextStyle`                                                    | -           | Custom text style            |

---

### Input

A text input with label, validation, and icons.

```typescript
import { Input } from "@/components/ui/Input";

// Basic usage
<Input placeholder="Enter text" value={value} onChangeText={setValue} />

// With label and helper text
<Input
  label="Email"
  placeholder="you@example.com"
  helperText="We'll never share your email"
/>

// With validation error
<Input
  label="Password"
  error="Password must be at least 8 characters"
  secureTextEntry
/>

// With icons
<Input
  leftIcon="search"
  placeholder="Search..."
/>
<Input
  rightIcon="eye-off"
  onRightIconPress={togglePassword}
  secureTextEntry={!showPassword}
/>

// Variants
<Input variant="outlined" label="Outlined" />
<Input variant="filled" label="Filled" />
<Input variant="underlined" label="Underlined" />
```

**Props:**

| Prop               | Type                                     | Default      | Description                   |
| ------------------ | ---------------------------------------- | ------------ | ----------------------------- |
| `label`            | `string`                                 | -            | Label text above input        |
| `placeholder`      | `string`                                 | -            | Placeholder text              |
| `error`            | `string`                                 | -            | Error message (shows red)     |
| `helperText`       | `string`                                 | -            | Helper text below input       |
| `leftIcon`         | `string`                                 | -            | Ionicons name for left icon   |
| `rightIcon`        | `string`                                 | -            | Ionicons name for right icon  |
| `onRightIconPress` | `() => void`                             | -            | Callback for right icon press |
| `size`             | `'sm' \| 'md' \| 'lg'`                   | `'md'`       | Input size                    |
| `variant`          | `'outlined' \| 'filled' \| 'underlined'` | `'outlined'` | Visual style                  |
| `disabled`         | `boolean`                                | `false`      | Disable input                 |

---

### Text

Typography component with semantic variants.

```typescript
import { Text } from "@/components/ui/Text";

// Variants
<Text variant="h1">Heading 1</Text>
<Text variant="h2">Heading 2</Text>
<Text variant="h3">Heading 3</Text>
<Text variant="body">Body text</Text>
<Text variant="bodySmall">Small body</Text>
<Text variant="caption">Caption</Text>
<Text variant="label">Label</Text>

// Colors
<Text color="primary">Primary color</Text>
<Text color="secondary">Secondary color</Text>
<Text color="brand">Brand color</Text>
<Text color="error">Error color</Text>
<Text color="success">Success color</Text>

// Alignment
<Text align="center">Centered text</Text>
<Text align="right">Right aligned</Text>
```

**Props:**

| Prop      | Type                                                                                     | Default     | Description          |
| --------- | ---------------------------------------------------------------------------------------- | ----------- | -------------------- |
| `variant` | `'h1' \| 'h2' \| 'h3' \| 'body' \| 'bodySmall' \| 'caption' \| 'label'`                  | `'body'`    | Typography style     |
| `color`   | `'primary' \| 'secondary' \| 'tertiary' \| 'brand' \| 'error' \| 'success' \| 'warning'` | `'primary'` | Text color           |
| `align`   | `'left' \| 'center' \| 'right'`                                                          | `'left'`    | Text alignment       |
| `weight`  | `'regular' \| 'medium' \| 'semiBold' \| 'bold'`                                          | -           | Font weight override |

---

### Card

Container component with elevation and press states.

```typescript
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";

// Basic card
<Card>
  <Text>Card content</Text>
</Card>

// Variants
<Card variant="elevated">Elevated (with shadow)</Card>
<Card variant="filled">Filled background</Card>
<Card variant="outlined">With border</Card>

// Pressable card
<Card pressable onPress={handlePress}>
  <Text>Tap me</Text>
</Card>

// With enter animation
<Card enterAnimation="fadeUp" animationDelay={100}>
  <Text>Animated card</Text>
</Card>

// Compound pattern
<Card>
  <CardHeader>
    <Text variant="h3">Title</Text>
  </CardHeader>
  <CardContent>
    <Text>Main content</Text>
  </CardContent>
  <CardFooter>
    <Button title="Cancel" variant="ghost" />
    <Button title="Save" />
  </CardFooter>
</Card>
```

**Props:**

| Prop             | Type                                         | Default      | Description            |
| ---------------- | -------------------------------------------- | ------------ | ---------------------- |
| `variant`        | `'elevated' \| 'filled' \| 'outlined'`       | `'elevated'` | Visual style           |
| `padding`        | `'none' \| 'sm' \| 'md' \| 'lg'`             | `'md'`       | Internal padding       |
| `radius`         | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'`     | `'lg'`       | Border radius          |
| `pressable`      | `boolean`                                    | `false`      | Enable press animation |
| `enterAnimation` | `'fade' \| 'fadeUp' \| 'fadeDown' \| 'none'` | `'none'`     | Enter animation        |
| `animationDelay` | `number`                                     | `0`          | Delay in milliseconds  |

---

## Layout Components

### Divider

Horizontal line separator.

```typescript
import { Divider } from "@/components/ui/Divider";

<Divider />
<Divider spacing="lg" />
<Divider color="#custom" />
```

### ScreenHeader

Page header with back button and actions.

```typescript
import { ScreenHeader } from "@/components/ui/ScreenHeader";

<ScreenHeader title="Settings" />
<ScreenHeader
  title="Profile"
  showBackButton
  rightAction={<IconButton icon="settings" onPress={openSettings} />}
/>
```

### SectionLabel

Section title with optional subtitle.

```typescript
import { SectionLabel } from "@/components/ui/SectionLabel";

<SectionLabel title="Recent" />
<SectionLabel title="Settings" subtitle="Customize your experience" />
```

---

## Feedback Components

### Loading

Full-screen or inline loading indicator.

```typescript
import { Loading } from "@/components/ui/Loading";

<Loading />
<Loading size="small" />
<Loading message="Loading..." />
```

### Skeleton

Placeholder loading state.

```typescript
import { Skeleton } from "@/components/ui/Skeleton";

<Skeleton width={200} height={20} />
<Skeleton width="100%" height={150} radius={12} />
<Skeleton circle size={48} />
```

### EmptyState

Empty content placeholder.

```typescript
import { EmptyState } from "@/components/ui/EmptyState";

<EmptyState
  icon="images-outline"
  title="No images yet"
  message="Generate your first image to see it here"
  actionLabel="Generate"
  onAction={handleGenerate}
/>
```

### ErrorCard

Error display with retry option.

```typescript
import { ErrorCard } from "@/components/ui/ErrorCard";

<ErrorCard
  title="Something went wrong"
  message="Failed to load data"
  onRetry={handleRetry}
/>
```

---

## Display Components

### Avatar

User profile image with fallback.

```typescript
import { Avatar } from "@/components/ui/Avatar";

<Avatar source={{ uri: imageUrl }} />
<Avatar name="John Doe" /> {/* Shows initials */}
<Avatar size="sm" />
<Avatar size="lg" badge />
```

### Badge

Status indicator or count.

```typescript
import { Badge } from "@/components/ui/Badge";

<Badge label="New" />
<Badge label="3" variant="error" />
<Badge label="Beta" variant="warning" />
```

### IconButton

Circular icon-only button.

```typescript
import { IconButton } from "@/components/ui/IconButton";

<IconButton icon="add" onPress={handleAdd} />
<IconButton icon="trash" variant="danger" />
<IconButton icon="share" size="lg" />
```

---

## AI-Specific Components

### GenerationResult

Display generated content (image, video, audio).

```typescript
import { GenerationResult } from "@/components/ui/GenerationResult";

<GenerationResult
  type="image"
  url={imageUrl}
  onDownload={handleDownload}
  onShare={handleShare}
/>
```

### GenerationLoadingState

Animated loading state for AI generation.

```typescript
import { GenerationLoadingState } from "@/components/ui/GenerationLoadingState";

<GenerationLoadingState
  type="image"
  message="Creating your image..."
/>
```

### CreditsCard

Display remaining credits.

```typescript
import { CreditsCard } from "@/components/ui/CreditsCard";

<CreditsCard
  remaining={42}
  onBuyMore={handleBuyCredits}
/>
```

### ImagePickerButton

Image selection with preview.

```typescript
import { ImagePickerButton } from "@/components/ui/ImagePickerButton";

<ImagePickerButton
  label="Reference Image"
  onImageSelected={handleImage}
  selectedImage={imageUri}
  onClear={handleClear}
/>
```

---

## Animation Components

### AnimatedWrapper

Generic animation wrapper.

```typescript
import { AnimatedWrapper } from "@/components/ui/AnimatedWrapper";

<AnimatedWrapper animation="fadeIn">
  <Card>Content</Card>
</AnimatedWrapper>

<AnimatedWrapper animation="slideUp" delay={200}>
  <Button title="Animated button" />
</AnimatedWrapper>
```

---

## Modal Components

### FullScreenModal

Full-screen modal overlay.

```typescript
import { FullScreenModal } from "@/components/ui/FullScreenModal";

<FullScreenModal
  visible={isVisible}
  onClose={handleClose}
  title="Select Option"
>
  <OptionList />
</FullScreenModal>
```

---

## Design Tokens

Components use design tokens from `constants/theme.ts`:

### Colors

```typescript
import { colors } from "@/constants/theme";

colors.primary; // Brand primary
colors.secondary; // Brand secondary
colors.success; // Success green
colors.warning; // Warning orange
colors.error; // Error red
colors.surface.light; // Light mode surface
colors.surface.dark; // Dark mode surface
```

### Spacing

```typescript
import { spacing } from "@/constants/theme";

spacing.xs; // 4
spacing.sm; // 8
spacing.md; // 12
spacing.lg; // 16
spacing.xl; // 24
spacing["2xl"]; // 32
```

### Typography

```typescript
import { typography } from "@/constants/theme";

typography.fontSize.xs; // 12
typography.fontSize.sm; // 14
typography.fontSize.md; // 16
typography.fontSize.lg; // 18
typography.fontWeight.regular;
typography.fontWeight.bold;
```

### Border Radius

```typescript
import { borderRadius } from "@/constants/theme";

borderRadius.sm; // 4
borderRadius.md; // 8
borderRadius.lg; // 12
borderRadius.xl; // 16
borderRadius.full; // 9999
```

---

## Creating Custom Components

Follow this pattern when creating new components:

```typescript
import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";

import { useAppTheme } from "@/hooks/useAppTheme";
import { colors, spacing } from "@/constants/theme";

// ============================================================================
// TYPES
// ============================================================================

interface MyComponentProps {
  /** Description of prop */
  title: string;
  /** Optional style override */
  style?: ViewStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function MyComponent({ title, style }: MyComponentProps) {
  const { isDark } = useAppTheme();

  return (
    <View style={[styles.container, style]}>
      {/* Component content */}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
});
```

---

For more examples, explore the existing components in `components/ui/`.
